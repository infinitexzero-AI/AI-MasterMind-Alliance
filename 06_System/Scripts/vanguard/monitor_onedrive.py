import os
import time
import json
import redis
from datetime import datetime

# Connect to core Redis bus
r = redis.Redis(host='localhost', port=6379, db=0)

VAULT_DIR = "/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT"
POLL_INTERVAL = 5 # seconds

def calculate_sync_percentage():
    """
    Simulates sync percentage calculation by diffing local timestamps 
    against known cloud states or detecting rapid file changes typical during syncs.
    Real sync calculation requires deep API access, but we can infer it via Chokidar 
    latency or raw IO churn. Defaulting to 100% (idle/synced) when churn dies down.
    """
    total_bytes = 0
    mod_times = []
    
    if not os.path.exists(VAULT_DIR):
        print(f"[!] Warning: Vault path not found: {VAULT_DIR}")
        return 0
        
    for root, dirs, files in os.walk(VAULT_DIR):
        for file in files:
            path = os.path.join(root, file)
            try:
                stat = os.stat(path)
                total_bytes += stat.st_size
                mod_times.append(stat.st_mtime)
            except Exception:
                pass
                
    if not mod_times:
        return 100
        
    recent_churn = sum(1 for m in mod_times if (time.time() - m) < 10)
    
    if recent_churn > 0:
        # If files are rapidly moving, estimate a generic active sync %
        return max(10, 100 - (recent_churn * 5))
    else:
        return 100 # Fully synced/Idle

print("🌀 Vanguard OneDrive Sync Monitor initialized.")
print(f"📡 Watching: {VAULT_DIR}")

while True:
    try:
        sync_pct = calculate_sync_percentage()
        
        payload = {
            "type": "ONEDRIVE_SYNC_STATE",
            "percent": int(sync_pct),
            "timestamp": datetime.now().isoformat()
        }
        
        # Publish to Redis Pub/Sub for Relay server to catch
        r.publish('ailcc:system:events', json.dumps(payload))
        
        # Update Redis Hash for persistent state queries
        r.hset('ailcc:vanguard:state', 'onedrive_sync', int(sync_pct))
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Global Sync: {sync_pct}%")
        
        time.sleep(POLL_INTERVAL)
        
    except Exception as e:
        print(f"❌ Monitor Error: {e}")
        time.sleep(10)
