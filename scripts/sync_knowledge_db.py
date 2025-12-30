#!/usr/bin/env python3
import sqlite3
import json
import os
from datetime import datetime

# Configuration
DB_PATH = "/Users/infinite27/Antigravity/knowledge.db"
JSON_PATH = "/Users/infinite27/AILCC_PRIME/web_tasks.json"
REGISTRY_JSON_PATH = "/Users/infinite27/AILCC_PRIME/agents/registry.json"

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def load_json_file(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return None

def save_json_file(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def sync_tasks_db_to_json():
    print(f"[*] Syncing Tasks: DB -> JSON...")
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks")
    db_tasks = [dict(row) for row in cursor.fetchall()]
    
    json_data = load_json_file(JSON_PATH) or []
    json_tasks = {t.get('id') or t.get('task_id'): t for t in json_data}
    
    for db_task in db_tasks:
        db_id = db_task['id']
        task_obj = {
            "id": db_id,
            "title": db_task['title'],
            "description": db_task['description'],
            "assignee": db_task['assignee'],
            "status": db_task['status'],
            "priority": db_task['priority'],
            "updated_at": db_task['updated_at']
        }
        if db_id not in json_tasks or db_task['updated_at'] > json_tasks[db_id].get('updated_at', ''):
            json_tasks[db_id] = task_obj
            print(f" [+] Updated {db_id} in JSON")
            
    save_json_file(JSON_PATH, list(json_tasks.values()))
    conn.close()

def sync_tasks_json_to_db():
    print(f"[*] Syncing Tasks: JSON -> DB...")
    json_tasks = load_json_file(JSON_PATH) or []
    conn = get_db_connection()
    cursor = conn.cursor()
    for task in json_tasks:
        t_id = task.get('id') or task.get('task_id')
        if not t_id: continue
        cursor.execute("SELECT updated_at FROM tasks WHERE id = ?", (t_id,))
        row = cursor.fetchone()
        json_updated = task.get('updated_at') or task.get('created_at', '')
        if not row or (json_updated and json_updated > row[0]):
            cursor.execute("""
                INSERT OR REPLACE INTO tasks (id, title, description, assignee, status, priority, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (t_id, task.get('title') or task.get('description', 'No Title')[:50], task.get('description', ''), task.get('assignee', 'unassigned'), task.get('status', 'pending'), task.get('priority', 3), json_updated if json_updated else datetime.utcnow().isoformat() + "Z"))
            print(f" [+] Updated {t_id} in DB")
    conn.commit()
    conn.close()

def sync_agents_json_to_db():
    print(f"[*] Syncing Agents: JSON -> DB...")
    registry_data = load_json_file(REGISTRY_JSON_PATH)
    if not registry_data or 'agents' not in registry_data: return
    
    conn = get_db_connection()
    cursor = conn.cursor()
    for agent in registry_data['agents']:
        a_id = agent['agent_id']
        cursor.execute("""
            INSERT OR REPLACE INTO agent_registry (agent_id, name, role, status, endpoint, capabilities, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (a_id, agent['name'], agent['role'], agent['status'], agent['endpoint'], json.dumps(agent.get('capabilities', [])), datetime.utcnow().isoformat() + "Z"))
        print(f" [+] Updated agent {a_id} in DB")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: sync_knowledge_db.py [push|pull|both]")
        sys.exit(1)
    mode = sys.argv[1]
    if mode in ["pull", "both"]:
        sync_tasks_db_to_json()
        sync_agents_json_to_db()
    if mode in ["push", "both"]:
        sync_tasks_json_to_db()
        sync_agents_json_to_db() # Registry sync is usually one-way JSON -> DB for now but we can expand
    print("[!] Sync Complete.")
