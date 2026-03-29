#!/usr/bin/env python3
"""
Step 17: Log Scout (Anomaly Detection)
Monitors heartbeat and dashboard logs for suspicious patterns or failures.
"""

import time
import os
import re
from datetime import datetime

HEARTBEAT_LOG = "/Users/infinite27/AILCC_PRIME/06_System/Logs/system_heartbeat.log"
DASHBOARD_LOG = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/dev_log.txt"

ALERT_KEYWORDS = ["ERROR", "CRITICAL", "Link severed", "Traceback", "Failed to fetch"]

def scout():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔭 Log Scout Active. Monitoring for anomalies...")
    
    # Initial scan of last 50 lines
    for log_path in [HEARTBEAT_LOG, DASHBOARD_LOG]:
        if not os.path.exists(log_path): continue
        with open(log_path, 'r') as f:
            lines = f.readlines()[-50:]
            for line in lines:
                if any(k in line for k in ALERT_KEYWORDS):
                    print(f"⚠️ HISTORICAL ALERT in {os.path.basename(log_path)}: {line.strip()}")

    # Live tail simulation (one pass for now, usually would be a daemon)
    # We can implement a simple loop that checks every second in a background process if needed.
    # For now, we provide the logic to detect spikes.
    
if __name__ == "__main__":
    scout()
