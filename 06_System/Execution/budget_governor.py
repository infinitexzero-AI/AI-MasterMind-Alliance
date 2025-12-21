import json
import os
from datetime import datetime

BUDGET_FILE = "/Users/infinite27/AILCC_PRIME/06_System/State/budget_state.json"
LOG_FILE = "/Users/infinite27/AILCC_PRIME/06_System/Logs/budget_alerts.log"

def load_budget():
    with open(BUDGET_FILE, 'r') as f:
        return json.load(f)

def save_budget(data):
    with open(BUDGET_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def reset_if_new_day():
    data = load_budget()
    today = datetime.now().strftime("%Y-%m-%d")
    if data["last_reset"] != today:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ♻️ New Day detected. Resetting budget counters.")
        data["current_spend"] = 0.00
        data["last_reset"] = today
        for agent in data["agents"]:
            data["agents"][agent]["spend"] = 0.00
            data["agents"][agent]["requests"] = 0
        data["status"] = "HEALTHY"
        data["throttle_level"] = 0
        save_budget(data)

def log_transaction(agent, cost):
    reset_if_new_day()
    data = load_budget()
    
    if agent not in data["agents"]:
        print(f"Error: Unknown agent {agent}")
        return

    data["agents"][agent]["spend"] += cost
    data["agents"][agent]["requests"] += 1
    data["current_spend"] += cost
    
    # Evaluate Health
    if data["current_spend"] >= data["daily_limit"]:
        data["status"] = "CRITICAL"
        data["throttle_level"] = 100
    elif data["current_spend"] >= data["daily_limit"] * 0.8:
        data["status"] = "WARNING"
        data["throttle_level"] = 50
    else:
        data["status"] = "HEALTHY"
        data["throttle_level"] = 0

    save_budget(data)
    
    if data["status"] != "HEALTHY":
        with open(LOG_FILE, 'a') as log:
            log.write(f"[{datetime.now().isoformat()}] ⚠️ BUDGET ALERT: Status {data['status']} | Spend: ${data['current_spend']:.2f}\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3:
        agent = sys.argv[1]
        cost = float(sys.argv[2])
        log_transaction(agent, cost)
        print(f"Logged ${cost:.4f} for {agent}.")
    else:
        reset_if_new_day()
        data = load_budget()
        print(f"Budget Governor: {data['status']} | Total: ${data['current_spend']:.2f} / ${data['daily_limit']:.2f}")
