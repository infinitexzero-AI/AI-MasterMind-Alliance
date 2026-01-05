#!/usr/bin/env python3
"""
Task 140: Financial Arbitrage
Updates the status of pending receipts based on evidence submission.
"""

import json
import os
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
FINANCE_STATE = f"{ROOT}/06_System/State/finance_data.json"
OUTBOX = f"{ROOT}/06_System/AILCC/outbox"
LOG_FILE = f"{ROOT}/06_System/Logs/financial_arbitrage.log"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] [FINANCE] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def run_arbitrage():
    log("💰 Running Financial Arbitrage Pulse...")
    
    # Check if Discourse Dispatch exists
    dispatch_file = f"{OUTBOX}/OFFICIAL_DISPATCH_Bursary_Appeal_2026.md"
    if not os.path.exists(dispatch_file):
        log("⏳ Evidence submission file not found. Skipping status update.")
        return

    if not os.path.exists(FINANCE_STATE):
        log("❌ Finance state missing.")
        return

    with open(FINANCE_STATE, 'r') as f:
        data = json.load(f)

    updated = False
    for receipt in data.get('pending_receipts', []):
        if receipt['id'] == "Bursary-2025-Dec" and receipt['status'] == "AWAITING_SUBMISSION":
            log(f"✅ Submission detected. Updating receipt {receipt['id']} to SUBMITTED.")
            receipt['status'] = "SUBMITTED"
            receipt['submitted_at'] = datetime.now().isoformat()
            updated = True
            
        if receipt['id'] == "NSLSC-2025-Term-W26" and receipt['status'] == "PROCESSING_DELAYED":
            log("⚡ Analyzing NSLSC Delay. Linking to Evidence Bundle...")
            receipt['internal_note'] = "Linked to appeal JP-MTA-2026-AB1 for hold removal."

    if updated:
        data['last_updated'] = datetime.now().isoformat()
        with open(FINANCE_STATE, 'w') as f:
            json.dump(data, f, indent=2)
        log("✨ Financial state synchronized.")
    else:
        log("ℹ️ No financial receipts require status updates.")

if __name__ == "__main__":
    run_arbitrage()
