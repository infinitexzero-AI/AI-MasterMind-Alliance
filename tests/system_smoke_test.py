#!/usr/bin/env python3
"""
Step 9: system_smoke_test.py
Verifies that all critical ports and agents are active.
"""

import socket
import os
import sqlite3
import json

ROOT = "/Users/infinite27/AILCC_PRIME"
DB_PATH = f"{ROOT}/06_System/State/knowledge-base.db"
PORTS = {
    3000: "Nexus Dashboard",
    3001: "Neural Relay",
    3006: "MCP Proxy"
}

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(('127.0.0.1', port)) == 0

def test_system():
    print(f"--- 🚬 AILCC SYSTEM SMOKE TEST ---")
    
    # 1. Port Verification
    print("\n[Port Connectivity]")
    for port, name in PORTS.items():
        state = "✅ ONLINE" if check_port(port) else "❌ OFFLINE"
        print(f" - Port {port} ({name}): {state}")

    # 2. Database Integrity
    print("\n[Database Integrity]")
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [t[0] for t in c.fetchall()]
            print(f" ✅ Knowledge Base Found. Tables: {', '.join(tables)}")
            conn.close()
        except Exception as e:
            print(f" ❌ Database Error: {e}")
    else:
        print(f" ❌ Database missing at {DB_PATH}")

    # 3. Agent Roster Check
    print("\n[Agent Roster Pulse]")
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            # If the user renamed the table to intelligence_vault, we check for agents in agent_registry
            c.execute("SELECT agent_id, status FROM agent_registry;")
            agents = c.fetchall()
            if agents:
                for aid, status in agents:
                    print(f" - {aid}: {status}")
            else:
                print(" ⚠️ No agents registered yet.")
            conn.close()
        except sqlite3.OperationalError:
             print(" ⚠️ agent_registry table not found.")

    print("\n--- TEST COMPLETE ---")

if __name__ == "__main__":
    test_system()
