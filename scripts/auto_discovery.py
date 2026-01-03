#!/usr/bin/env python3
"""
Node Auto-Discovery (Task 010)
Allows agents to register their presence and capabilities.
"""

import sys
import os
import sqlite3
import json
import argparse
from datetime import datetime

# Configuration
DB_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/knowledge-base.db"

def register_node(agent_id, name, role, status="ACTIVE", endpoint=None, capabilities=None):
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Ensure table exists
    c.execute("""
        CREATE TABLE IF NOT EXISTS agent_registry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id TEXT UNIQUE,
            name TEXT,
            role TEXT,
            status TEXT,
            endpoint TEXT,
            capabilities TEXT,
            last_seen TEXT
        )
    """)
    
    caps_json = json.dumps(capabilities or [])
    last_seen = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    try:
        c.execute("""
            INSERT INTO agent_registry (agent_id, name, role, status, endpoint, capabilities, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(agent_id) DO UPDATE SET
                status=excluded.status,
                endpoint=excluded.endpoint,
                capabilities=excluded.capabilities,
                last_seen=excluded.last_seen,
                role=excluded.role
        """, (agent_id, name, role, status, endpoint, caps_json, last_seen))
        conn.commit()
        print(f"Node '{name}' ({agent_id}) registered successfully.")
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
    
    args = parser.parse_args()
    
    caps = json.loads(args.caps) if args.caps else []
    register_node(args.id, args.name, args.role, args.status, args.endpoint, caps)

