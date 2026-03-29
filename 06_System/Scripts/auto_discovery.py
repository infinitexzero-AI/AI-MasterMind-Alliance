import sys
import os
import sqlite3
import json
import argparse
from datetime import datetime

# Configuration
DB_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/knowledge-base.db"
METRICS_FILE = "/Users/infinite27/AILCC_PRIME/06_System/State/agent_metrics.json"

def log_metrics_history(agent_id, cpu, memory):
    if not os.path.exists(METRICS_FILE):
        data = {"history": [], "last_updated": ""}
    else:
        with open(METRICS_FILE, 'r') as f:
            try:
                data = json.load(f)
            except:
                data = {"history": [], "last_updated": ""}

    entry = {
        "timestamp": datetime.now().isoformat(),
        "agent_id": agent_id,
        "cpu": cpu,
        "memory": memory
    }
    
    data["history"].append(entry)
    # Keep only last 1000 entries
    data["history"] = data["history"][-1000:]
    data["last_updated"] = datetime.now().isoformat()
    
    with open(METRICS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def register_node(agent_id, name, role, status="ACTIVE", endpoint=None, capabilities=None, cpu=0.0, memory=0.0):
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Ensure table exists with all columns
    c.execute("""
        CREATE TABLE IF NOT EXISTS agent_registry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id TEXT UNIQUE,
            name TEXT,
            role TEXT,
            status TEXT,
            endpoint TEXT,
            capabilities TEXT,
            last_seen TEXT,
            cpu FLOAT DEFAULT 0.0,
            memory FLOAT DEFAULT 0.0
        )
    """)
    
    # Check if cpu/memory columns exist (migration check)
    c.execute("PRAGMA table_info(agent_registry)")
    cols = [col[1] for col in c.fetchall()]
    if 'cpu' not in cols:
        c.execute("ALTER TABLE agent_registry ADD COLUMN cpu FLOAT DEFAULT 0.0")
    if 'memory' not in cols:
        c.execute("ALTER TABLE agent_registry ADD COLUMN memory FLOAT DEFAULT 0.0")
    
    caps_json = json.dumps(capabilities or [])
    last_seen = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    try:
        c.execute("""
            INSERT INTO agent_registry (agent_id, name, role, status, endpoint, capabilities, last_seen, cpu, memory)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(agent_id) DO UPDATE SET
                status=excluded.status,
                endpoint=excluded.endpoint,
                capabilities=excluded.capabilities,
                last_seen=excluded.last_seen,
                role=excluded.role,
                cpu=excluded.cpu,
                memory=excluded.memory
        """, (agent_id, name, role, status, endpoint, caps_json, last_seen, cpu, memory))
        conn.commit()
        
        # Log to history
        log_metrics_history(agent_id, cpu, memory)
        
        print(f"Node '{name}' ({agent_id}) registered successfully. [CPU: {cpu}%, MEM: {memory}%]")
    except Exception as e:
        print(f"Registration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Register an AI Agent Node.")
    parser.add_argument("--id", required=True, help="Unique Agent ID (e.g., 'antigravity')")
    parser.add_argument("--name", required=True, help="Display Name")
    parser.add_argument("--role", required=True, help="Agent Role")
    parser.add_argument("--status", default="ACTIVE", help="Current Status")
    parser.add_argument("--endpoint", help="API Endpoint URL")
    parser.add_argument("--caps", help="JSON string of capabilities")
    parser.add_argument("--cpu", type=float, default=0.0, help="Current CPU usage percentage")
    parser.add_argument("--memory", type=float, default=0.0, help="Current Memory usage percentage")
    
    args = parser.parse_args()
    
    caps = json.loads(args.caps) if args.caps else []
    register_node(args.id, args.name, args.role, args.status, args.endpoint, caps, args.cpu, args.memory)


