import json
import os
import time
from datetime import datetime

FINANCE_DATA = "/Users/infinite27/AILCC_PRIME/06_System/State/finance_data.json"
LOG_FILE = "/Users/infinite27/AILCC_PRIME/logs/financial_watchdog.log"

def log_event(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"[{timestamp}] {message}")

def check_deposits():
    if not os.path.exists(FINANCE_DATA):
        log_event("Error: finance_data.json not found.")
        return

    with open(FINANCE_DATA, "r") as f:
        data = json.load(f)

    pending = data.get("pending_receipts", [])
    if not pending:
        log_event("No pending receipts found in registry.")
        return

    for item in pending:
        if item["status"] == "RECEIVED":
            continue
            
        # Watchdog logic: In a real scenario, this would interface with an API or Scraper.
        # For this local monitor, it signals when status changes are detected or manually flagged.
        log_event(f"Monitoring {item['id']} ({item['source']}) | Status: {item['status']} | Priority: {item['priority']}")

def main():
    log_event("Financial Watchdog Agent Initialized.")
    # Check once on launch
    check_deposits()

if __name__ == "__main__":
    main()
