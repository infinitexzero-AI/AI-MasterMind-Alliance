import json
import os
import time
from datetime import datetime

# Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
MANIFEST_PATH = f"{ROOT}/MASTER_PROJECT_MANIFEST.md"
SYNC_FILE = f"{ROOT}/06_System/State/multiversal_sync.json"
LOG_FILE = f"{ROOT}/06_System/Logs/mode7_sync.log"
COLLECTIVE_LOG = f"{ROOT}/04_Intelligence_Vault/COLLECTIVE_PERSPECTIVE_LOG.md"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def get_manifest_context():
    try:
        with open(MANIFEST_PATH, "r") as f:
            return f.read()
    except Exception as e:
        log(f"Error reading manifest: {e}")
        return ""

def initiate_sync(objective):
    context = get_manifest_context()
    sync_packet = {
        "status": "INITIATED",
        "timestamp": datetime.now().isoformat(),
        "objective": objective,
        "context_summary": context[:500] + "...", # Truncated for meta-packet
        "agents": {
            "Antigravity": {"status": "READY", "report": "Pulse initiated."},
            "Perplexity": {"status": "PENDING", "report": ""},
            "Claude": {"status": "PENDING", "report": ""},
            "ChatGPT": {"status": "PENDING", "report": ""},
            "Grok": {"status": "PENDING", "report": ""}
        }
    }
    
    os.makedirs(os.path.dirname(SYNC_FILE), exist_ok=True)
    with open(SYNC_FILE, "w") as f:
        json.dump(sync_packet, f, indent=2)
    
    log(f"🚀 Pulse initiated for objective: {objective}")

def update_collective_log(agent, report):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"\n### 🤖 {agent} Perspective ({timestamp})\n{report}\n\n---\n"
    
    header = "# 🌌 COLLECTIVE PERSPECTIVE LOG\n\n*A unified record of multiversal AI synergy.*\n\n"
    
    if not os.path.exists(COLLECTIVE_LOG):
        content = header + entry
    else:
        with open(COLLECTIVE_LOG, "r") as f:
            current_log = f.read()
        if header not in current_log:
            content = header + entry + current_log
        else:
            # Insert after header
            content = current_log.replace(header, header + entry)

    with open(COLLECTIVE_LOG, "w") as f:
        f.write(content)
    log(f"✅ Updated collective log with {agent} perspective.")

def check_for_reports():
    if not os.path.exists(SYNC_FILE):
        return

    try:
        with open(SYNC_FILE, "r") as f:
            data = json.load(f)
    except Exception as e:
        log(f"Error reading sync file: {e}")
        return

    updated = False
    for agent, state in data["agents"].items():
        if state["status"] == "REPORTING":
            update_collective_log(agent, state["report"])
            state["status"] = "SYNCED"
            updated = True

    if updated:
        with open(SYNC_FILE, "w") as f:
            json.dump(data, f, indent=2)
            
    # Check if all synced
    statuses = [s["status"] for s in data["agents"].values()]
    if all(s == "SYNCED" for s in statuses) and data["status"] != "COMPLETED":
        data["status"] = "COMPLETED"
        data["completed_at"] = datetime.now().isoformat()
        with open(SYNC_FILE, "w") as f:
            json.dump(data, f, indent=2)
        log("🎉 Multiversal Sync Cycle COMPLETED.")

if __name__ == "__main__":
    # Test initiation
    initiate_sync("Test Circular Orchestration Loop")
    
    log("Monitoring for agent reports...")
    while True:
        check_for_reports()
        time.sleep(10)
