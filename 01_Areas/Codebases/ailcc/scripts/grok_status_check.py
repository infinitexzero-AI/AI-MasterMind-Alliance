import os
import json
import socket
from datetime import datetime

# Path to the shared system state
STATUS_FILE = "/Users/infinite27/AILCC_PRIME/06_System/State/dashboard_state.json"

def update_grok_status(online=False):
    """
    Updates the system state with Grok's web reading status.
    """
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, 'r') as f:
            data = json.load(f)
    else:
        data = {"components": {}}
        
    if "components" not in data:
        data["components"] = {}
        
    data["components"]["grok_web_reading"] = {
        "status": "ONLINE" if online else "OFFLINE",
        "last_checked": datetime.now().isoformat(),
        "fallback_active": not online
    }
    
    with open(STATUS_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    
    status_str = "ONLINE" if online else "OFFLINE (Proxy Active)"
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🤖 Grok Web Reading: {status_str}")

if __name__ == "__main__":
    # In a full automation, we would attempt a test search or check a known endpoint.
    # For now, we'll manually set to OFFLINE based on current intelligence.
    update_grok_status(online=False)
    print("Usage: python3 grok_status_check.py [online|offline]")
