import json
import os
import shutil
import time
import sqlite3
from datetime import datetime

# Canonical Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
INBOX = f"{ROOT}/context/handoffs/inbox"
ACTIVE = f"{ROOT}/context/handoffs/active"
DB_PATH = "/Users/infinite27/Antigravity/knowledge.db"
LOG_FILE = f"{ROOT}/logs/valentine.log"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] [VALENTINE] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def update_db_task(task_id, description, agent, status):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO tasks (id, title, description, assignee, status, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (task_id, description[:100], description, agent, status, 1))
        conn.commit()
        conn.close()
    except Exception as e:
        log(f"DB Update Error: {e}")

def classify_agent(description):
    desc = description.lower()
    if any(k in desc for k in ["scrape", "search", "web", "find"]):
        return "comet"
    if any(k in desc for k in ["code", "script", "implement", "fix", "debug"]):
        return "antigravity"
    if any(k in desc for k in ["analyze", "summary", "draft", "reconcile"]):
        return "claude"
    return "valentine"

def process_inbox():
    if not os.path.exists(INBOX):
        os.makedirs(INBOX, exist_ok=True)
        return

    if not os.path.exists(ACTIVE):
        os.makedirs(ACTIVE, exist_ok=True)

    for filename in os.listdir(INBOX):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(INBOX, filename)
        try:
            with open(filepath, "r") as f:
                payload = json.load(f)

            task_id = payload.get("content", {}).get("task_id", filename)
            task_desc = payload.get("content", {}).get("description", "Unknown task")
            agent = classify_agent(task_desc)
            
            log(f"New Task Detected: {task_desc}")
            log(f"Routing to: {agent}")

            # Update recipient in payload
            payload["recipient"] = agent
            payload["metadata"]["processed_by"] = "valentine_router"

            # Sync to Knowledge DB
            update_db_task(task_id, task_desc, agent, "PENDING")

            # Move to active
            new_path = os.path.join(ACTIVE, filename)
            with open(new_path, "w") as f:
                json.dump(payload, f, indent=2)
            
            os.remove(filepath)
            log(f"Successfully dispatched {filename} to {agent}")

        except Exception as e:
            log(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    log("Valentine Router Service v1.1 Initialized.")
    while True:
        process_inbox()
        time.sleep(10)
