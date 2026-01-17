import sqlite3
import re
import uuid
from datetime import datetime
import os

LOG_FILE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/logs/swarm_link.log"
DB_PATH = "/Users/infinite27/.antigravity/workspace.db"

def parse_logs_to_db():
    if not os.path.exists(LOG_FILE):
        print(f"❌ Log file not found: {LOG_FILE}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get primary workspace ID
    cursor.execute("SELECT id FROM workspaces WHERE path LIKE '%AILCC_PRIME%'")
    row = cursor.fetchone()
    if not row:
        print("❌ Workspace AILCC_PRIME not found in DB")
        return
    ws_id = row[0]

    print(f"Processing logs for Workspace ID: {ws_id}")

    with open(LOG_FILE, 'r') as f:
        content = f.read()

    # Identify "Task Delegated" events as conversation starters
    # Format: [TIMESTAMP] [SUCCESS] Task TASK-XXX delegated to AGENT
    tasks = re.findall(r'\[(.*?)\] \[SUCCESS\] Task (TASK-\d+) delegated to (.*)', content)
    
    count = 0
    for timestamp_str, task_id, agent in tasks:
        # Convert timestamp to standard format if needed, or keep as is
        # timestamp_str example: 2026-01-08T05:11:53.114Z
        


        current_time = datetime.utcnow().isoformat() + "Z"
        title = f"Task {task_id} - {agent}"
        cursor.execute("""
            INSERT INTO conversations (workspace_id, uuid, title, created_at, last_updated)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(uuid) DO UPDATE SET last_updated = excluded.last_updated
        """, (ws_id, task_id, title, timestamp_str, current_time))
        count += 1

    conn.commit()
    conn.close()
    print(f"✅ Ingested {count} conversation items from swarm logs.")

if __name__ == "__main__":
    parse_logs_to_db()
