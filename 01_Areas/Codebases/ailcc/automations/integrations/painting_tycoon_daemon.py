#!/usr/bin/env python3
"""
painting_tycoon_daemon.py — East Coast Fresh Coats Automation (Tycoon Module)
=============================================================================
A background daemon that monitors local CSV exports for the painting business.
It parses:
1. CRM/Quotes Export (painting_quotes.csv)
2. Inventory Ledger (painting_inventory.csv)

It calculates pending quotes, extracts upcoming jobs, and flags low inventory
(e.g., Primer, Tape, Drop Cloths).

The extracted intelligence is deposited into the Hippocampus as a Tycoon JSON 
payload (`painting_biz_status.json`), which is then dynamically consumed by 
the OmniTracker and protected by Biometric Consent for financial transactions.

Usage:
    python3 painting_tycoon_daemon.py --run
    python3 painting_tycoon_daemon.py --mock   (Generate test CSVs)
    python3 painting_tycoon_daemon.py --status
"""

import os
import csv
import json
import logging
import argparse
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [PaintingTycoon] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
TYCOON_REPORTS  = HIPPOCAMPUS_DIR / "tycoon_reports"
BIZ_JSON_PATH   = TYCOON_REPORTS / "painting_biz_status.json"

DOWNLOADS_DIR   = Path.home() / "Downloads"
QUOTES_CSV      = DOWNLOADS_DIR / "painting_quotes.csv"
INVENTORY_CSV   = DOWNLOADS_DIR / "painting_inventory.csv"

# Minimum inventory thresholds to trigger OmniTracker 'CRITICAL' alerts
LOW_STOCK_THRESHOLDS = {
    "Gallons of Primer": 5,
    "Rolls of Painters Tape": 10,
    "Gallons of Ceiling White": 3,
    "Tray Liners": 15
}


def parse_quotes(filepath: Path) -> dict:
    """Parse CRM Quotes CSV."""
    status = {"pending": [], "upcoming_jobs": [], "total_revenue_booked": 0.0}
    if not filepath.exists():
        logger.warning(f"Quotes CSV not found: {filepath.name}")
        return status

    try:
        with open(filepath, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                norm = {k.lower().strip(): v.strip() for k, v in row.items() if k}
                client = norm.get("client", "Unknown")
                job_type = norm.get("type", "Exterior/Interior")
                state = norm.get("status", "").lower()
                amount_str = norm.get("amount", "0").replace("$", "").replace(",", "")
                date_str = norm.get("date", "")
                
                try:
                    amount = float(amount_str)
                except:
                    amount = 0.0

                item = {
                    "id": f"QT-{hash(client) % 1000}",
                    "client": client,
                    "type": job_type,
                    "amount": amount,
                    "date": date_str
                }

                if state in ["pending", "draft", "needs followup"]:
                    status["pending"].append(item)
                elif state in ["approved", "booked", "scheduled"]:
                    status["upcoming_jobs"].append(item)
                    status["total_revenue_booked"] += amount

        logger.info(f"✅ Parsed {len(status['pending'])} pending quotes and {len(status['upcoming_jobs'])} upcoming jobs.")
    except Exception as e:
        logger.error(f"Error parsing quotes: {e}")
    
    return status


def parse_inventory(filepath: Path) -> list:
    """Parse Inventory CSV and check against thresholds."""
    low_stock_items = []
    if not filepath.exists():
        logger.warning(f"Inventory CSV not found: {filepath.name}")
        return low_stock_items

    try:
        with open(filepath, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                norm = {k.lower().strip(): v.strip() for k, v in row.items() if k}
                item_name = norm.get("item", "Unknown")
                qty_str = norm.get("quantity", "0")
                
                try:
                    qty = int(qty_str)
                except:
                    qty = 0

                # Check if item drops below explicit threshold, or default to < 2
                threshold = LOW_STOCK_THRESHOLDS.get(item_name, 2)
                if qty <= threshold:
                    low_stock_items.append({
                        "item": item_name,
                        "current_stock": qty,
                        "threshold": threshold
                    })
        
        if low_stock_items:
            logger.info(f"⚠️ Found {len(low_stock_items)} inventory items below threshold.")
    except Exception as e:
        logger.error(f"Error parsing inventory: {e}")
    
    return low_stock_items


def process_biz_files() -> dict:
    """Run both parsers and unify the data."""
    quotes = parse_quotes(QUOTES_CSV)
    inventory = parse_inventory(INVENTORY_CSV)

    # Determine Urgency based on business rules
    overall_urgency = "ROUTINE"
    if inventory:
        overall_urgency = "CRITICAL" # We can't paint without materials
    elif quotes["pending"]:
        overall_urgency = "HIGH"     # Money on the table

    report = {
        "business": "East Coast Fresh Coats",
        "last_sync": datetime.now().isoformat(),
        "urgency": overall_urgency,
        "quotes": quotes,
        "low_inventory": inventory
    }

    return report


def deposit_report(report: dict):
    os.makedirs(TYCOON_REPORTS, exist_ok=True)
    BIZ_JSON_PATH.write_text(json.dumps(report, indent=2))
    logger.info(f"💾 Fresh Coats payload deposited to {BIZ_JSON_PATH.name}")


def generate_mock_csvs():
    """Generates mock CSV files in Downloads for testing the ingestion loop."""
    quotes_data = [
        "Client,Type,Amount,Status,Date",
        "Smith Residence,Full Interior Trim,$1400.00,Pending,2026-03-10",
        "Downtown Cafe,Exterior Signage,$850.00,Booked,2026-03-12",
        "Jones Living Room,Walls/Ceiling,$1200.00,Pending,2026-03-15",
        "Moncton Library,Hallway Touchup,$400.00,Booked,2026-03-18"
    ]
    QUOTES_CSV.write_text("\n".join(quotes_data))
    
    inventory_data = [
        "Item,Quantity,Location",
        "Gallons of Primer,3,Van",
        "Rolls of Painters Tape,8,Storage Unit",
        "Gallons of Ceiling White,1,Van",
        "Tray Liners,40,Storage Unit",
        "Benjamin Moore Regal Select (Eggshell),12,Storage Unit"
    ]
    INVENTORY_CSV.write_text("\n".join(inventory_data))
    logger.info("Created mock `painting_quotes.csv` and `painting_inventory.csv` in ~/Downloads.")


def print_status():
    if not BIZ_JSON_PATH.exists():
        print("\\n📊 Fresh Coats Status: No data parsed yet. Run --run or --mock.\\n")
        return
    
    try:
        data = json.loads(BIZ_JSON_PATH.read_text())
        print("\\n🎨 East Coast Fresh Coats (Tycoon Module)")
        print(f"   Last Sync  : {data.get('last_sync', 'Unknown')[:16].replace('T', ' ')}")
        print(f"   Urgency    : {data.get('urgency')}")
        
        q = data.get('quotes', {})
        print(f"\\n   💰 Revenue : ${q.get('total_revenue_booked', 0):.2f} (Booked Upcoming)")
        print(f"   📝 Pending Quotes:")
        for pt in q.get('pending', []):
            print(f"      - {pt['client']} ({pt['type']}) : ${pt['amount']}")

        inv = data.get('low_inventory', [])
        print(f"\\n   📦 Low Inventory Alerts:")
        if not inv:
            print("      All stock levels optimal.")
        else:
            for item in inv:
                print(f"      ⚠️ {item['item']}: {item['current_stock']} left (Min: {item['threshold']})")
        print()
    except Exception as e:
        print(f"Error reading JSON: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Painting Tycoon Daemon — East Coast Fresh Coats")
    parser.add_argument("--run", action="store_true", help="Parse CRM and Inventory CSVs")
    parser.add_argument("--mock", action="store_true", help="Generate mock CSVs and run parser")
    parser.add_argument("--status", action="store_true", help="View latest business status")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.mock:
        generate_mock_csvs()
        report = process_biz_files()
        deposit_report(report)
        print_status()
    elif args.run:
        report = process_biz_files()
        deposit_report(report)
        print_status()
    else:
        print_status()
