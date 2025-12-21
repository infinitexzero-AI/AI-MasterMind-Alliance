import os
import subprocess
import json
import time
from datetime import datetime

# Paths
DASHBOARD_DIR = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard"
GEMINI_CRAFTSMAN = "/Users/infinite27/AILCC_PRIME/06_System/Execution/gemini_craftsman.py"
RELAY_URL = "http://localhost:3001/api/gemini/report"

def log_debug(msg):
    print(f"🌀 ANTIGRAVITY (Debugger): {msg}")

def run_autonomous_loop():
    log_debug("Initiating Autonomous Debugging Loop...")
    
    # 1. Scan for errors
    # We specify directories to avoid the 'ignored' issue
    cmd = ["npx", "eslint", "pages", "components", "--ext", ".ts,.tsx", "--format", "json", "--no-ignore"]
    log_debug(f"Running scan in {DASHBOARD_DIR}...")
    
    result = subprocess.run(cmd, cwd=DASHBOARD_DIR, capture_output=True, text=True)
    
    try:
        errors = json.loads(result.stdout)
    except Exception as e:
        log_debug(f"Scan failed or no errors found: {e}")
        return

    # 2. Extract meaningful errors
    error_summary = []
    for file_report in errors:
        if file_report.get('errorCount', 0) > 0:
            filename = os.path.basename(file_report['filePath'])
            for msg in file_report['messages']:
                if msg['severity'] == 2: # Error
                    error_summary.append(f"{filename}:{msg['line']} - {msg['message']}")

    if not error_summary:
        log_debug("✅ No high-severity errors detected. System healthy.")
        return

    log_debug(f"❌ {len(error_summary)} errors detected. Delegating to GEMINI...")
    
    # 3. Delegate to Gemini
    directive = "Fix the following lint errors: " + " | ".join(error_summary[:3]) # Limit to top 3
    subprocess.run(["python3", GEMINI_CRAFTSMAN, directive])

    log_debug("Delegation complete. Awaiting PR generation.")

if __name__ == "__main__":
    run_autonomous_loop()
