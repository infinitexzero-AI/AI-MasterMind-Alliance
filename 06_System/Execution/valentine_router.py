import json
import os
import shutil
import time
from datetime import datetime

# Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
INBOX = f"{ROOT}/06_System/AILCC/handoffs/inbox"
ACTIVE = f"{ROOT}/06_System/AILCC/handoffs/active"
LOG_FILE = f"{ROOT}/06_System/Logs/valentine.log"
STATUS_FILE = f"{ROOT}/06_System/State/status.json"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] [VALENTINE] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

from slm_router import SLMRouter

# Initialize SLM Component
slm = SLMRouter()

def classify_agent(description):
    analysis = slm.classify_task(description)
    log(f"SLM Analysis: {analysis['category']} ({analysis['complexity']}) -> {analysis['route']}")
    return analysis.get('target', 'valentine')

def process_inbox():
    if not os.path.exists(INBOX):
        return

    for filename in os.listdir(INBOX):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(INBOX, filename)
        try:
            with open(filepath, "r") as f:
                payload = json.load(f)

            task_desc = payload.get("content", {}).get("description", "Unknown task")
            agent = classify_agent(task_desc)
            
            log(f"New Task Detected: {task_desc}")
            log(f"Routing to: {agent}")

            # Update recipient in payload
            payload["recipient"] = agent
            payload["metadata"]["processed_by"] = "valentine_router"

            # Move to active
            new_path = os.path.join(ACTIVE, filename)
            with open(new_path, "w") as f:
                json.dump(payload, f, indent=2)
            
            os.remove(filepath)
            log(f"Successfully dispatched {filename} to {agent}")

        except Exception as e:
            log(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    log("Valentine Router Service Initialized.")
    while True:
        process_inbox()
        time.sleep(10)
