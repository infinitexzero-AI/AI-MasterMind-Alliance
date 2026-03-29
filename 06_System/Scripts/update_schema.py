import sqlite3
import os

DB_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/knowledge-base.db"

def update_schema():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Create system_logs table
    c.execute('''
    CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        source TEXT,
        level TEXT,
        message TEXT,
        metadata TEXT
    )
    ''')
    
    # Create agent_registry table
    c.execute('''
    CREATE TABLE IF NOT EXISTS agent_registry (
        agent_id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        status TEXT,
        endpoint TEXT,
        capabilities TEXT,
        last_seen TEXT
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Schema updated successfully.")

if __name__ == "__main__":
    update_schema()
