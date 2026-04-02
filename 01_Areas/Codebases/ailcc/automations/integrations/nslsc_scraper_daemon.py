import os
import json
import logging
import argparse
import requests
from pathlib import Path
from datetime import datetime
from typing import TypedDict, Annotated, Sequence
import operator

try:
    from langchain_core.messages import BaseMessage, HumanMessage
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.sqlite import SqliteSaver
except ImportError:
    print("⚠️ LangGraph not installed.")
    exit(1)
try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("⚠️ Playwright not installed. Run: pip install playwright && playwright install chromium")
    sync_playwright = None

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [NSLSC-Scraper] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
TYCOON_REPORTS  = HIPPOCAMPUS_DIR / "tycoon_reports"
NSLSC_JSON_PATH = TYCOON_REPORTS / "nslsc_status.json"

LOGIN_URL = "https://csnpe-nslsc.cibcetude-canlearn.ca/eng/SignOn.aspx"

# Load credentials from ENV. The user must set these securely.
GCKEY_USERNAME = os.getenv("GCKEY_USERNAME", "")
GCKEY_PASSWORD = os.getenv("GCKEY_PASSWORD", "")
# Security questions format: Q1_KEYWORD=ANSWER1;Q2_KEYWORD=ANSWER2
SECURITY_Q_MAP = os.getenv("NSLSC_SECURITY_ANSWERS", "") 
RELAY_URL      = "http://localhost:5005"

def broadcast_synapse(agent: str, intent: str, confidence: float = 1.0, domain: str = "FINANCE"):
    """Broadcast state to the Neural Synapse Uplink."""
    try:
        requests.post(f"{RELAY_URL}/api/system/synapse", json={
            "agent": agent,
            "intent": intent,
            "confidence": confidence,
            "domain": domain
        }, timeout=2)
    except Exception as e:
        logger.warning(f"Failed to broadcast synapse: {e}")


def parse_security_questions(raw_mapping: str) -> dict:
    """Parse security questions from env var into a dict of {keyword: answer}."""
    q_dict = {}
    if not raw_mapping:
        return q_dict
    pairs = raw_mapping.split(";")
    for p in pairs:
        if "=" in p:
            k, v = p.split("=", 1)
            q_dict[k.strip().lower()] = v.strip()
    return q_dict


def run_scraper(headless: bool = True) -> dict:
    """Execute the Playwright login and scraping flow."""
    if not sync_playwright:
        logger.error("Playwright is missing. Cannot run scraper.")
        return {}

    if not GCKEY_USERNAME or not GCKEY_PASSWORD:
        logger.error("Missing GCKEY_USERNAME or GCKEY_PASSWORD in environment variables.")
        return {}

    sec_answers = parse_security_questions(SECURITY_Q_MAP)
    
    with sync_playwright() as p:
        logger.info(f"🚀 Launching browser (Headless={headless})...")
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            logger.info("Navigate to NSLSC Sign-On page...")
            page.goto(LOGIN_URL, timeout=30000)

            # Click standard GCKey login button (selectors often change, using standard text matching)
            logger.info("Selecting GCKey authentication...")
            page.locator("text=Continue to Sign-In Partner").click() # Or GCKey equivalent
            page.wait_for_load_state('networkidle')
            
            # GCKey Portal
            logger.info("Entering GCKey credentials...")
            page.fill("input[name='token']", GCKEY_USERNAME)
            page.fill("input[name='password']", GCKEY_PASSWORD)
            page.click("button[type='submit']")
            page.wait_for_load_state('networkidle')

            # Security Question Intercept
            try:
                # Check for GCKey MFA or Security Questions
                if page.locator("text=Protect your account").is_visible(timeout=3000):
                    logger.warning("🛡️ MFA Gate Detected (2nd Factor).")
                    broadcast_synapse("NSLSC_WATCHER", "AWAITING_MFA_TOKEN", 0.9, "SECURITY")
                    return {"status": "AWAITING_MFA", "error": "MFA Code Required (Check Email/SMS)"}

                question_text = page.locator(".security-question-text").inner_text(timeout=5000)
                logger.info(f"Security Question Promped: {question_text}")
                
                answered = False
                for keyword, answer in sec_answers.items():
                    if keyword in question_text.lower():
                        page.fill("input[name='securityAnswer']", answer)
                        page.click("button:has-text('Next')")
                        logger.info("Answered security question.")
                        answered = True
                        break
                
                if not answered:
                    logger.warning("Unrecognized security question based on .env map.")
                    broadcast_synapse("NSLSC_WATCHER", "UNRECOGNIZED_SECURITY_QUESTION", 0.8, "SECURITY")
            except PlaywrightTimeout:
                logger.info("No security question prompted. Proceeding.")

            # NSLSC Dashboard Extraction
            logger.info("Reaching main NSLSC Dashboard...")
            page.wait_for_selector(".loan-balance-value", timeout=15000)

            # NOTE: These selectors are speculative and need adjustment against the live Gov.ca DOM.
            balance = page.locator(".loan-balance-value").inner_text().strip()
            next_payment = page.locator(".next-payment-amount").inner_text().strip()
            payment_date = page.locator(".next-payment-date").inner_text().strip()
            loan_status = page.locator(".loan-status-badge").inner_text().strip()

            data = {
                "balance": balance,
                "next_payment": next_payment,
                "payment_date": payment_date,
                "status": loan_status,
                "last_checked": datetime.now().isoformat(),
                "error": None
            }
            logger.info(f"✅ Scraping Complete: Balance={balance} | Next Payment={next_payment} on {payment_date}")

        except Exception as e:
            logger.error(f"❌ Scraping failed at DOM extraction stage: {e}")
            data = {
                "balance": "Unknown",
                "next_payment": "Unknown",
                "payment_date": "Unknown",
                "status": "Error",
                "last_checked": datetime.now().isoformat(),
                "error": str(e)
            }
        finally:
            browser.close()

    return data


def deposit_report(data: dict):
    os.makedirs(TYCOON_REPORTS, exist_ok=True)
    NSLSC_JSON_PATH.write_text(json.dumps(data, indent=2))
    logger.info(f"💾 NSLSC payload deposited to {NSLSC_JSON_PATH.name}")


def print_status():
    if not NSLSC_JSON_PATH.exists():
        print("\\n📊 NSLSC Status: No data scraped yet. Run --run to initiate Playwright scrape.\\n")
        return
    
    data = json.loads(NSLSC_JSON_PATH.read_text())
    print("\\n📊 NSLSC Financial Status (Tycoon Module)")
    print(f"   Last Checked : {data.get('last_checked')}")
    if data.get("error"):
        print(f"   Status       : ❌ ERROR - {data['error'][:60]}")
    else:
        print(f"   Loan Balance : {data.get('balance')}")
        print(f"   Next Payment : {data.get('next_payment')} on {data.get('payment_date')}")
        print(f"   Account State: {data.get('status')}")
    print()


# ─── LangGraph Architecture ───────────────────────────────────────────────────
class AgentState(TypedDict):
    status: str
    error_reason: str
    data: dict

def scraper_node(state: AgentState):
    logger.info("Node: Running NSLSC Scraper...")
    data = run_scraper(headless=True)
    if data.get("error"):
        logger.warning(f"Scraping blocked: {data['error']}")
        return {"status": "BLOCKED", "error_reason": data["error"], "data": data}
    return {"status": "COMPLETED", "error_reason": "", "data": data}

def omnitracker_block_node(state: AgentState):
    logger.info(f"🛑 Node: Halted. Sent alert to Tycoon: {state.get('error_reason')}")
    # In a real scenario, this writes a task to the OmniTracker API payload
    # For now, it places the workflow into a paused state awaiting intervention.
    return {"status": "AWAITING_USER"}

def summarize_node(state: AgentState):
    logger.info("✅ Node: Scraping Successful. Writing to Hippocampus...")
    deposit_report(state["data"])
    return {"status": "SUCCESS"}

def router(state: AgentState) -> str:
    status = state.get("status", "")
    if status == "BLOCKED":
        return "omnitracker_block_node"
    return "summarize_node"

def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("scrape", scraper_node)
    workflow.add_node("omnitracker_block_node", omnitracker_block_node)
    workflow.add_node("summarize", summarize_node)
    
    workflow.set_entry_point("scrape")
    workflow.add_conditional_edges("scrape", router)
    workflow.add_edge("omnitracker_block_node", END)
    workflow.add_edge("summarize", END)
    
    return workflow

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NSLSC Scraper Daemon — Tycoon Module (Stateful)")
    parser.add_argument("--run", action="store_true", help="Launch Playwright to scrape NSLSC via LangGraph")
    parser.add_argument("--headless", type=bool, default=True, help="Run headless mode (false to view browser)")
    parser.add_argument("--status", action="store_true", help="Show last scraped status")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.run:
        graph = build_graph()
        memory = SqliteSaver.from_conn_string(":memory:")
        app = graph.compile(checkpointer=memory)
        config = {"configurable": {"thread_id": "nslsc_scrape_1"}}
        
        initial_state = {"status": "STARTING", "error_reason": "", "data": {}}
        print(f"\\n🚀 Dispatching Stateful NSLSC Scraper Daemon")
        for event in app.stream(initial_state, config=config):
            for node, data in event.items():
                print(f"--> Triggered Node: [{node}] | Status: {data.get('status')}")
        print_status()
    else:
        print_status()
