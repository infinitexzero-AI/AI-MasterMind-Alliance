#!/usr/bin/env python3
"""
bank_csv_daemon.py — Financial Burn Rate Daemon (Tycoon Module)
===============================================================
Mirrors the Zotero Watcher pattern for bank CSV files.
Parses bank statement exports (CSV format from major Canadian banks),
calculates Burn Rate vs. Income metrics, categorizes spending,
and deposits structured reports into the Hippocampus for
dashboard visualization and Vanguard Swarm analysis.

Supported banks (CSV export format):
  - RBC Royal Bank
  - TD Canada Trust
  - Scotia Bank
  - BMO Bank of Montreal
  - Generic CSV (date, description, amount columns)

Usage:
    python3 bank_csv_daemon.py --watch ~/Downloads/    # monitor folder
    python3 bank_csv_daemon.py --parse ~/Downloads/statement.csv
    python3 bank_csv_daemon.py --report               # show burn rate summary
    python3 bank_csv_daemon.py --status               # show daemon status
"""

import os
import csv
import json
import logging
import hashlib
import argparse
import re
import time
from pathlib import Path
from datetime import datetime, date
from typing import Optional, TypedDict, Annotated, Sequence
import operator

try:
    from langchain_core.messages import BaseMessage, HumanMessage
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.sqlite import SqliteSaver
except ImportError:
    print("⚠️ LangGraph not installed.")
    exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [BurnRateDaemon] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR   = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
TYCOON_REPORTS    = HIPPOCAMPUS_DIR / "tycoon_reports"
BURN_LEDGER_PATH  = HIPPOCAMPUS_DIR / "burn_rate_ledger.json"
WATCH_DIR         = Path.home() / "Downloads"
POLL_INTERVAL     = 30  # seconds between folder scans

# ─── Spending Categories (keywords → category) ────────────────────────────────
SPENDING_CATEGORIES = {
    "income"     : ["payroll", "deposit", "etransfer received", "direct deposit", "salary", "payment received", "fresh coats", "east coast"],
    "housing"    : ["rent", "mortgage", "hydro", "electricity", "internet", "power", "utilities"],
    "food"       : ["sobeys", "walmart", "costco", "mcdonald", "tim hortons", "subway", "pizza", "grocery", "food", "restaurant"],
    "transport"  : ["gas", "petro", "shell", "esso", "uber", "transit", "moncton", "parking"],
    "education"  : ["nslsc", "student", "university", "moncton u", "tuition", "bookstore"],
    "subscriptions": ["netflix", "spotify", "github", "openai", "anthropic", "google", "apple", "amazon prime", "xai"],
    "business"   : ["home depot", "rona", "sherwin", "benjamin moore", "paint", "supplies", "fresh coats"],
    "savings"    : ["transfer to savings", "wealthsimple", "rrsp", "tfsa", "investment"],
    "other"      : []
}


# ─── CSV Format Detection ─────────────────────────────────────────────────────
def detect_bank_format(headers: list[str]) -> str:
    """Detect which bank format this CSV is from."""
    h = [h.lower().strip() for h in headers]
    if "account number" in h and "cheque number" in h:
        return "rbc"
    if "transaction date" in h and "debit amount" in h and "credit amount" in h:
        return "td"
    if "date" in h and "withdrawals" in h and "deposits" in h:
        return "scotiabank"
    if "date" in h and "description" in h and "amount" in h:
        return "generic"
    return "generic"


def parse_amount(value: str) -> float:
    """Parse currency string to float."""
    if not value or value.strip() in ("", "-", "N/A"):
        return 0.0
    clean = re.sub(r"[,$\s]", "", value.strip())
    try:
        return float(clean)
    except ValueError:
        return 0.0


# ─── CSV Parsers ──────────────────────────────────────────────────────────────
def parse_transactions(filepath: Path) -> list[dict]:
    """Parse any supported CSV format into unified transaction dicts."""
    transactions = []
    try:
        with open(filepath, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames or []
            bank_format = detect_bank_format(headers)
            logger.info(f"Detected format: {bank_format} | Headers: {headers[:5]}")

            for row in reader:
                row = {k.strip(): v.strip() for k, v in row.items() if k}
                txn = _normalize_row(row, bank_format)
                if txn:
                    transactions.append(txn)

    except Exception as e:
        logger.error(f"Parse error on {filepath}: {e}")

    return transactions


def _normalize_row(row: dict, fmt: str) -> Optional[dict]:
    """Normalize a bank CSV row to unified transaction format."""
    try:
        if fmt == "td":
            debit  = parse_amount(row.get("Debit Amount", "0"))
            credit = parse_amount(row.get("Credit Amount", "0"))
            amount = credit - debit
            return {
                "date"       : row.get("Transaction Date", ""),
                "description": row.get("Description", ""),
                "amount"     : amount,
                "type"       : "credit" if amount > 0 else "debit",
            }
        elif fmt == "scotiabank":
            withdrawals = parse_amount(row.get("Withdrawals", "0"))
            deposits    = parse_amount(row.get("Deposits", "0"))
            amount      = deposits - withdrawals
            return {
                "date"       : row.get("Date", ""),
                "description": row.get("Description", ""),
                "amount"     : amount,
                "type"       : "credit" if amount > 0 else "debit",
            }
        else:  # generic / rbc
            amount = parse_amount(row.get("Amount", row.get("CAD$", "0")))
            return {
                "date"       : row.get("Date", row.get("Transaction Date", "")),
                "description": row.get("Description", row.get("Memo", "")),
                "amount"     : amount,
                "type"       : "credit" if amount > 0 else "debit",
            }
    except Exception:
        return None


def categorize(description: str) -> str:
    """Map a transaction description to a spending category."""
    desc_lower = description.lower()
    for category, keywords in SPENDING_CATEGORIES.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return "other"


# ─── Burn Rate Calculator ─────────────────────────────────────────────────────
def calculate_burn_rate(transactions: list[dict]) -> dict:
    """Calculate burn rate metrics from transaction list."""
    income       = 0.0
    expenses     = {}
    total_spent  = 0.0

    for txn in transactions:
        amt  = txn["amount"]
        cat  = categorize(txn["description"])

        if amt > 0:
            income += amt
        else:
            spent = abs(amt)
            expenses[cat] = expenses.get(cat, 0.0) + spent
            total_spent   += spent

    net           = income - total_spent
    savings_rate  = (net / income * 100) if income > 0 else 0
    burn_rate     = total_spent  # monthly spend

    return {
        "income"          : round(income, 2),
        "total_spent"     : round(total_spent, 2),
        "net"             : round(net, 2),
        "savings_rate_pct": round(savings_rate, 1),
        "burn_rate"       : round(burn_rate, 2),
        "breakdown"       : {k: round(v, 2) for k, v in sorted(expenses.items(), key=lambda x: -x[1])},
        "transaction_count": len(transactions),
    }


# ─── Hippocampus Deposit ──────────────────────────────────────────────────────
def build_tycoon_report(filepath: Path, metrics: dict) -> str:
    """Build Tycoon Markdown report from burn rate metrics."""
    month = datetime.now().strftime("%B %Y")
    lines = [
        f"# 💰 Tycoon Report — {month}",
        f"**Source:** `{filepath.name}`",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "## 📊 Burn Rate Summary",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| 💵 Total Income | **${metrics['income']:,.2f}** |",
        f"| 🔥 Total Spent | **${metrics['total_spent']:,.2f}** |",
        f"| 💚 Net Remaining | **${metrics['net']:,.2f}** |",
        f"| 📈 Savings Rate | **{metrics['savings_rate_pct']}%** |",
        f"| 🏦 Monthly Burn Rate | **${metrics['burn_rate']:,.2f}** |",
        f"| 📋 Transactions | {metrics['transaction_count']} |",
        "",
        "## 🗂️ Spending Breakdown",
    ]

    for category, amount in metrics["breakdown"].items():
        pct = (amount / metrics['total_spent'] * 100) if metrics['total_spent'] > 0 else 0
        bar = "█" * int(pct / 5)
        lines.append(f"- **{category.title()}**: ${amount:,.2f} ({pct:.1f}%) {bar}")

    lines += [
        "",
        "## ⚠️ Vanguard Swarm Risk Assessment",
    ]

    # Risk flags
    if metrics["savings_rate_pct"] < 10:
        lines.append("🔴 **CRITICAL**: Savings rate below 10% — requires biometric authorization before non-essential spending")
    elif metrics["savings_rate_pct"] < 20:
        lines.append("🟡 **HIGH**: Savings rate below 20% — review discretionary spending")
    else:
        lines.append("🟢 **NOMINAL**: Financial health within target parameters")

    subs = metrics["breakdown"].get("subscriptions", 0)
    if subs > 200:
        lines.append(f"🟡 Subscription spend ${subs:.2f}/mo — audit recommended")

    return "\n".join(lines)


def deposit_tycoon_report(filepath: Path, report_md: str, metrics: dict):
    """Save Tycoon report to Hippocampus."""
    os.makedirs(TYCOON_REPORTS, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    out_file  = TYCOON_REPORTS / f"burn_rate_{timestamp}_{filepath.stem}.md"
    out_file.write_text(report_md)
    logger.info(f"✅ Tycoon Report deposited: {out_file.name}")

    # Export metrics for Dashboard consumption
    metrics_file = TYCOON_REPORTS / "burn_rate_metrics.json"
    metrics_payload = {
        "last_updated": datetime.now().isoformat(),
        "current_month": metrics
    }
    metrics_file.write_text(json.dumps(metrics_payload, indent=2))
    logger.info(f"📊 Dashboard metrics updated: {metrics_file.name}")

    # Update ledger
    ledger = load_ledger()
    fp_hash = hashlib.md5(filepath.read_bytes()).hexdigest()
    ledger["processed_files"][fp_hash] = {
        "filename"  : filepath.name,
        "processed" : datetime.now().isoformat(),
        "income"    : metrics["income"],
        "burn_rate" : metrics["burn_rate"],
        "net"       : metrics["net"],
    }
    save_ledger(ledger)
    return str(out_file)


# ─── Ledger ───────────────────────────────────────────────────────────────────
def load_ledger() -> dict:
    os.makedirs(HIPPOCAMPUS_DIR, exist_ok=True)
    if BURN_LEDGER_PATH.exists():
        try:
            return json.loads(BURN_LEDGER_PATH.read_text())
        except Exception:
            pass
    return {"processed_files": {}, "last_run": None}


def save_ledger(ledger: dict):
    ledger["last_run"] = datetime.now().isoformat()
    BURN_LEDGER_PATH.write_text(json.dumps(ledger, indent=2))


# ─── Main Ingestion Loop ──────────────────────────────────────────────────────
def scan_and_ingest(watch_dir: Path, once: bool = True):
    """Scan directory for new CSV bank statements and process them."""
    ledger    = load_ledger()
    processed = 0

    csv_files = list(watch_dir.glob("*.csv")) + list(watch_dir.glob("*.CSV"))
    logger.info(f"🔍 Scanning {watch_dir} — found {len(csv_files)} CSV files")

    for filepath in csv_files:
        fp_hash = hashlib.md5(filepath.read_bytes()).hexdigest()
        if fp_hash in ledger["processed_files"]:
            continue  # already processed

        logger.info(f"📄 Processing: {filepath.name}")
        transactions = parse_transactions(filepath)
        if not transactions:
            logger.warning(f"  No transactions parsed — skipping")
            continue

        metrics      = calculate_burn_rate(transactions)
        report_md    = build_tycoon_report(filepath, metrics)
        deposit_tycoon_report(filepath, report_md, metrics)
        processed   += 1

        logger.info(f"  Income: ${metrics['income']:,.2f} | Burn: ${metrics['burn_rate']:,.2f} | Net: ${metrics['net']:,.2f}")

        # Sovereign Autonomy: 
        # If surplus capital exceeds $1000, autonomously stage it for algorithmic investment.
        if metrics['net'] > 1000.0:
            logger.info("💰 Sovereign Tranche Detected! Staging surplus capital for algorithmic deployment...")
            executor_path = Path(__file__).parent / "wealth_executor.py"
            os.system(f"python3 {executor_path} --stage_surplus {metrics['net']}")

    if processed == 0:
        logger.info("✨ No new bank statements found. Drop a CSV into ~/Downloads/ to trigger.")

    return processed


def print_status():
    ledger = load_ledger()
    print(f"\n📊 Financial Burn Rate Daemon Status")
    print(f"   Statements processed : {len(ledger['processed_files'])}")
    print(f"   Reports path         : {TYCOON_REPORTS}")
    print(f"   Last run             : {ledger.get('last_run', 'Never')}")
    if ledger["processed_files"]:
        latest = sorted(ledger["processed_files"].values(), key=lambda x: x["processed"], reverse=True)[0]
        print(f"\n   📋 Latest Statement:")
        print(f"      File      : {latest['filename']}")
        print(f"      Income    : ${latest['income']:,.2f}")
        print(f"      Burn Rate : ${latest['burn_rate']:,.2f}")
        print(f"      Net       : ${latest['net']:,.2f}")
    print()


def print_report():
    """Show the latest Tycoon report from Hippocampus."""
    reports = list(TYCOON_REPORTS.glob("*.md")) if TYCOON_REPORTS.exists() else []
    if not reports:
        print("No reports yet. Drop a bank CSV into ~/Downloads/ and run --parse")
        return
    latest = sorted(reports, key=lambda f: f.stat().st_mtime, reverse=True)[0]
    print(latest.read_text())


# ─── LangGraph Architecture ───────────────────────────────────────────────────
class AgentState(TypedDict):
    status: str
    error_reason: str
    processed_count: int

def scanner_node(state: AgentState):
    logger.info("Node: Running CSV Scanner...")
    # Trigger original logic
    count = scan_and_ingest(WATCH_DIR, once=True)
    if count == 0:
        logger.info("Scraping blocked: No new statements found.")
        return {"status": "BLOCKED", "error_reason": "No new CSV files to process in ~/Downloads/", "processed_count": count}
    return {"status": "COMPLETED", "error_reason": "", "processed_count": count}

def omnitracker_block_node(state: AgentState):
    logger.info(f"🛑 Node: Halted. Status: {state.get('error_reason')}")
    # In a real scenario, this writes a task to the OmniTracker API payload
    # For now, it places the workflow into a paused state.
    return {"status": "AWAITING_FILES"}

def summarize_node(state: AgentState):
    logger.info(f"✅ Node: Scraping Successful. Processed {state['processed_count']} files.")
    return {"status": "SUCCESS"}

def router(state: AgentState) -> str:
    status = state.get("status", "")
    if status == "BLOCKED":
        return "omnitracker_block_node"
    return "summarize_node"

def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("scan", scanner_node)
    workflow.add_node("omnitracker_block_node", omnitracker_block_node)
    workflow.add_node("summarize", summarize_node)
    
    workflow.set_entry_point("scan")
    workflow.add_conditional_edges("scan", router)
    workflow.add_edge("omnitracker_block_node", END)
    workflow.add_edge("summarize", END)
    
    return workflow

# ─── CLI ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Financial Burn Rate Daemon — Tycoon Module (Stateful)"
    )
    parser.add_argument("--watch",  metavar="DIR",  help="Watch directory for new CSVs (continuous)")
    parser.add_argument("--parse",  metavar="FILE", help="Parse a single CSV file")
    parser.add_argument("--report", action="store_true", help="Show latest burn rate report")
    parser.add_argument("--status", action="store_true", help="Show daemon status")
    parser.add_argument("--run", action="store_true", help="Launch stateful scan pass using LangGraph")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.report:
        print_report()
    elif args.parse:
        fp = Path(args.parse)
        if not fp.exists():
            print(f"❌ File not found: {fp}")
        else:
            txns    = parse_transactions(fp)
            metrics = calculate_burn_rate(txns)
            report  = build_tycoon_report(fp, metrics)
            deposit_tycoon_report(fp, report, metrics)
            print(report)
    elif args.watch:
        watch_dir = Path(args.watch)
        logger.info(f"🚀 Burn Rate Daemon watching: {watch_dir}")
        while True:
            scan_and_ingest(watch_dir, once=False)
            logger.info(f"⏳ Next scan in {POLL_INTERVAL}s...")
            time.sleep(POLL_INTERVAL)
    elif args.run:
        graph = build_graph()
        memory = SqliteSaver.from_conn_string(":memory:")
        app = graph.compile(checkpointer=memory)
        config = {"configurable": {"thread_id": "bank_csv_scan_1"}}
        
        initial_state = {"status": "STARTING", "error_reason": "", "processed_count": 0}
        print(f"\\n🚀 Dispatching Stateful Bank CSV Daemon")
        for event in app.stream(initial_state, config=config):
            for node, data in event.items():
                print(f"--> Triggered Node: [{node}] | Status: {data.get('status')}")
        print_status()
    else:
        # Default behavior: Show status instead of implicit run
        print_status()
