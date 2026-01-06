import os
import sqlite3
import glob
import re
from datetime import datetime

ROOT_DIR = "/Users/infinite27/AILCC_PRIME"
LOG_DIR = os.path.join(ROOT_DIR, "06_System/Logs")
DB_PATH = os.path.join(ROOT_DIR, "06_System/State/knowledge-base.db")

class LogService:
    def __init__(self, broadcast_fn=None):
        self.broadcast_fn = broadcast_fn

    def parse_log_line(self, line):
        match = re.search(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s*(?:\[([^\]]+)\])?\s*(.*)', line)
        if match:
            ts = match.group(1)
            session_id = match.group(2) or "GLOBAL"
            msg = match.group(3)
            level = "INFO"
            if any(w in msg.upper() for w in ["WARN", "WARNING"]): level = "WARN"
            if any(e in msg.upper() for e in ["ERROR", "FAIL", "FAILED", "EXCEPTION"]): level = "ERROR"
            if "CRITICAL" in msg.upper(): level = "CRITICAL"
            return ts, level, session_id, msg
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S'), "RAW", "NONE", line.strip()

    async def aggregate_logs(self):
        if not os.path.exists(LOG_DIR):
            return 0

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                source TEXT,
                level TEXT,
                session_id TEXT,
                message TEXT
            )
        """)
        
        log_files = glob.glob(os.path.join(LOG_DIR, "*.log"))
        total_added = 0
        for log_file in log_files:
            source = os.path.basename(log_file)
            try:
                with open(log_file, 'r', errors='ignore') as f:
                    lines = f.readlines()[-100:]
                    for line in lines:
                        line = line.strip()
                        if not line: continue
                        ts, level, sid, msg = self.parse_log_line(line)
                        c.execute("SELECT id FROM system_logs WHERE timestamp=? AND message=? AND source=? LIMIT 1", (ts, msg, source))
                        if not c.fetchone():
                            c.execute("INSERT INTO system_logs (timestamp, source, level, session_id, message) VALUES (?, ?, ?, ?, ?)",
                                      (ts, source, level, sid, msg))
                            total_added += 1
            except Exception:
                pass

        conn.commit()
        conn.close()
        return total_added
