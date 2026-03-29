#!/usr/bin/env python3
"""
Step 11: Security Audit Script
Scans logs and state files for potentially sensitive information (tokens, keys).
"""

import os
import re
import json
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
LOGS_DIR = f"{ROOT}/06_System/Logs"
STATE_DIR = f"{ROOT}/06_System/State"

# Patterns for sensitive data
PATTERNS = {
    "GitHub Token": r'ghp_[a-zA-Z0-9]{36}',
    "Generic Key": r'(?i)(key|token|password|secret|auth)["\s:=]+[a-zA-Z0-9_\-]{16,}',
    "Session ID": r'SESSION_[a-zA-Z0-9]{8,}'
}

def audit_file(filepath):
    findings = []
    try:
        with open(filepath, 'r', errors='ignore') as f:
            content = f.read()
            for name, pattern in PATTERNS.items():
                matches = re.finditer(pattern, content)
                for match in matches:
                    findings.append({
                        "file": filepath,
                        "type": name,
                        "match": match.group(0)[:8] + "..." # Masked
                    })
    except Exception as e:
        pass
    return findings

def run_audit():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🛡️ Initiating System Security Audit...")
    all_findings = []
    
    for root, dirs, files in os.walk(LOGS_DIR):
        for file in files:
            all_findings.extend(audit_file(os.path.join(root, file)))
            
    for root, dirs, files in os.walk(STATE_DIR):
        for file in files:
            if file.endswith((".json", ".log", ".txt")):
                all_findings.extend(audit_file(os.path.join(root, file)))
                
    if all_findings:
        print(f"⚠️ Found {len(all_findings)} items requiring verification.")
        for f in all_findings:
            print(f" - [{f['type']}] in {os.path.basename(f['file'])}: {f['match']}")
    else:
        print("✅ No sensitive leaks detected in active logs/state.")

if __name__ == "__main__":
    run_audit()
