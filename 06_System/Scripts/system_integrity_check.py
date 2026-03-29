#!/usr/bin/env python3
"""
Step 15: System Integrity Check
Generates and verifies checksums for core AILCC scripts.
"""

import hashlib
import os
import json
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
CHKSUM_FILE = f"{ROOT}/06_System/State/script_integrity.json"

CORE_SCRIPTS = [
    f"{ROOT}/06_System/Execution/ailcc_orchestrator.py",
    f"{ROOT}/06_System/Execution/system_relay.py",
    f"{ROOT}/06_System/Execution/vault_rag.py",
    f"{ROOT}/scripts/heartbeat_monitor.py",
    f"{ROOT}/scripts/auto_discovery.py"
]

def get_hash(filepath):
    if not os.path.exists(filepath): return None
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def verify_or_update(update=False):
    db = {}
    if os.path.exists(CHKSUM_FILE) and not update:
        with open(CHKSUM_FILE, 'r') as f:
            db = json.load(f)
            
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔐 Running Integrity Pulse...")
    
    current_hashes = {}
    integrity_stable = True
    
    for script in CORE_SCRIPTS:
        name = os.path.basename(script)
        h = get_hash(script)
        if not h:
            print(f"❌ MISSING: {name}")
            integrity_stable = False
            continue
            
        current_hashes[script] = h
        
        if script in db:
            if db[script] != h:
                print(f"⚠️ TAMPERED/UPDATED: {name}")
                integrity_stable = False
            else:
                pass # Match
    
    if update or not os.path.exists(CHKSUM_FILE):
        with open(CHKSUM_FILE, 'w') as f:
            json.dump(current_hashes, f, indent=2)
        print("💾 Integrity baseline updated.")
    elif integrity_stable:
        print("✅ All core scripts verify against baseline.")
    else:
        print("🚨 INTEGRITY BREACH DETECTED. Review recent changes.")

if __name__ == "__main__":
    import sys
    update_mode = "--update" in sys.argv
    verify_or_update(update=update_mode)
