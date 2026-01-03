#!/usr/bin/env python3
"""
Log Aggregator (Task 008)
Scans system logs and indexes them into the knowledge base for analyzing.
"""

import os
import sqlite3
import glob
from datetime import datetime
import re

# Configuration
ROOT_DIR = "/Users/infinite27/AILCC_PRIME"
LOG_DIR = os.path.join(ROOT_DIR, "06_System/Logs")
DB_PATH = os.path.join(ROOT_DIR, "06_System/State/knowledge-base.db")

def get_db_connection():
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)

def parse_log_line(line):
    """
    Parses a log line assuming format: [YYYY-MM-DD HH:MM:SS] Message
    Detects Levels: INFO, WARN, ERROR, CRITICAL
    Returns (timestamp, level, message)
    """
    # Simple regex for the timestamp [YYYY-MM-DD HH:MM:SS]
    match = re.search(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (.*)', line)
    if match:
        ts = match.group(1)
        msg = match.group(2)
        
        # Detect Level
        level = "INFO"
        if any(w in msg.upper() for w in ["WARN", "WARNING"]): level = "WARN"
        if any(e in msg.upper() for e in ["ERROR", "FAIL", "FAILED", "EXCEPTION"]): level = "ERROR"
        if "CRITICAL" in msg.upper(): level = "CRITICAL"
        
        return ts, level, msg
    
    # Fallback for lines without timestamps
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S'), "RAW", line.strip()

def aggregate_logs():
    if not os.path.exists(LOG_DIR):
        print(f"Error: Log directory not found at {LOG_DIR}")
        return

    conn = get_db_connection()
    c = conn.cursor()
    
    # Ensure table exists
    c.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            source TEXT,
            level TEXT,
            message TEXT
        )
    """)
    
    log_files = glob.glob(os.path.join(LOG_DIR, "*.log"))
    
    total_added = 0
    for log_file in log_files:
        source = os.path.basename(log_file)
        try:
            with open(log_file, 'r', errors='ignore') as f:
                all_lines = f.readlines()
                # Process the last 100 lines for each file
                lines = all_lines[-100:] if len(all_lines) > 100 else all_lines
                
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    
                    ts, level, msg = parse_log_line(line)
                    # Deduplication
                    c.execute("SELECT id FROM system_logs WHERE timestamp=? AND message=? AND source=? LIMIT 1", (ts, msg, source))
                    if not c.fetchone():
                        c.execute("INSERT INTO system_logs (timestamp, source, level, message) VALUES (?, ?, ?, ?)",
                                  (ts, source, level, msg))
                        total_added += 1
        except Exception as e:
            print(f"Error reading {log_file}: {e}")

    conn.commit()
    conn.close()
    print(f"Logs aggregated successfully. Added {total_added} new entries.")


if __name__ == "__main__":
    aggregate_logs()

