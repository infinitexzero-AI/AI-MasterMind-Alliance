#!/usr/bin/env python3
import json
import os
from datetime import datetime, timedelta

STATE_FILE = "/Users/infinite27/AILCC_PRIME/sync_state.json"

def validate():
    print(f"[*] Validating {STATE_FILE}...")
    if not os.path.exists(STATE_FILE):
        print(" [!] File not found.")
        return False
        
    with open(STATE_FILE, 'r') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(" [!] JSON Decode Error.")
            return False
            
    # Schema Check
    required_keys = ["last_updated", "agents_synced", "active_workflows"]
    for key in required_keys:
        if key not in data:
            print(f" [!] Missing key: {key}")
            return False
            
    # Freshness Check (24h)
    last_updated_str = data.get("last_updated", "").split('+')[0].replace('Z', '')
    try:
        # Handle various ISO formats
        if 'T' in last_updated_str:
            last_updated = datetime.fromisoformat(last_updated_str)
        else:
            last_updated = datetime.strptime(last_updated_str, "%Y-%m-%d %H:%M:%S")
            
        if datetime.utcnow() - last_updated > timedelta(hours=24):
            print(" [!] Sync state is stale (> 24h).")
            return False
    except Exception as e:
        print(f" [!] Date parsing error: {e}")
        return False
        
    print("[!] Sync State Valid.")
    return True

if __name__ == "__main__":
    validate()
