import sqlite3
import os
import time

DB_DIR = "/Users/infinite27/.antigravity"
DB_PATH = os.path.join(DB_DIR, "workspace.db")

def init_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
        print(f"📂 Created directory: {DB_DIR}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Table: workspaces
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        name TEXT,
        last_synced TEXT
    );
    """)

    # Table: files
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER,
        path TEXT NOT NULL,
        checksum TEXT,
        last_modified REAL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        UNIQUE(workspace_id, path)
    );
    """)
    
    # Table: conversations (metadata for chat logs)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER,
        uuid TEXT UNIQUE,
        title TEXT,
        created_at TEXT,
        last_updated TEXT,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
    """)

    # Seed initial workspace
    primary_ws = "/Users/infinite27/AILCC_PRIME"
    cursor.execute("INSERT OR IGNORE INTO workspaces (path, name, last_synced) VALUES (?, ?, ?)", 
                   (primary_ws, "AILCC_PRIME", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())))

    conn.commit()
    conn.close()
    print(f"✅ Database initialized at: {DB_PATH}")

if __name__ == "__main__":
    init_db()
