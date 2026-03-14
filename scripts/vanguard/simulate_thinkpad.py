import os
import json
import time
from datetime import datetime

VAULT_DIR = "/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT"
MOCK_FILE = os.path.join(VAULT_DIR, "status_ThinkPad27.json")

print("🧪 Injecting Simulated Vanguard Node [ThinkPad27]")

try:
    if not os.path.exists(VAULT_DIR):
        print(f"Creating mock vault directory at {VAULT_DIR}")
        os.makedirs(VAULT_DIR, exist_ok=True)
        
    payload = {
        "node": "ThinkPad27",
        "os": "Windows 11 Pro",
        "role": "Compute Mule",
        "cpu": 45,
        "memory": 62,
        "uptime": "2d 4h 12m",
        "timestamp": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        "battery": "100%"
    }
    
    with open(MOCK_FILE, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)
        
    print("✅ payload injected. The Nexus Dashboard should detect this immediately.")
    print("Waiting 10 seconds before simulating offline decay...")
    time.sleep(10)
    
except Exception as e:
    print(f"❌ Simulation Error: {e}")
