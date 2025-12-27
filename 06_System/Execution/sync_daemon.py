import json
import os
import time
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
SYNC_STATE_FILE = f"{ROOT}/06_System/State/sync_state.json"
STATUS_FILE = f"{ROOT}/06_System/State/status.json"
LOG_FILE = f"{ROOT}/06_System/Logs/sync_daemon.log"
ANTIGRAVITY_WORKSPACES = os.path.expanduser("~/Library/Application Support/Antigravity/Workspaces")

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

class CDCEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            self.handle_change("MODIFIED", event.src_path)

    def on_created(self, event):
        self.handle_change("CREATED", event.src_path)

    def handle_change(self, change_type, path):
        log(f"CDC Event: {change_type} at {path}")
        update_sync_state("antigravity_workspace", "synced", f"{change_type}: {os.path.basename(path)}")
        update_master_status("ACTIVE", f"Syncing {os.path.basename(path)}")

def update_sync_state(component, status, event_msg=None):
    try:
        if os.path.exists(SYNC_STATE_FILE):
            with open(SYNC_STATE_FILE, "r") as f:
                data = json.load(f)
        else:
            data = {"events": [], "system_health": {}, "agents": {}}
        
        data["system_health"][component] = status
        data["timestamp"] = datetime.now().isoformat()
        
        if event_msg:
            data["events"].append({
                "timestamp": datetime.now().isoformat(),
                "component": component,
                "message": event_msg
            })
            # Keep last 10 events
            data["events"] = data["events"][-10:]
            
        with open(SYNC_STATE_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log(f"Error updating sync state: {e}")

def update_master_status(status, task):
    try:
        with open(STATUS_FILE, "r") as f:
            data = json.load(f)
        data["agents"]["sync_daemon"] = {"status": status, "task": task}
        data["last_updated"] = datetime.now().isoformat()
        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log(f"Error updating master status: {e}")

def mock_comet_pulse():
    # Simulate a healthy Comet Assistant ping
    log("Mocking Comet Assistant API Pulse...")
    update_sync_state("comet_assistant_status", "healthy")

if __name__ == "__main__":
    log("Sync Daemon (CDC) starting...")
    
    # Ensure workspace path exists for watchdog
    if not os.path.exists(ANTIGRAVITY_WORKSPACES):
        os.makedirs(ANTIGRAVITY_WORKSPACES, exist_ok=True)
        log(f"Created workspace directory: {ANTIGRAVITY_WORKSPACES}")

    event_handler = CDCEventHandler()
    observer = Observer()
    observer.schedule(event_handler, ANTIGRAVITY_WORKSPACES, recursive=True)
    observer.start()
    
    update_master_status("ACTIVE", "Monitoring Digital Sync")
    
    try:
        while True:
            mock_comet_pulse()
            time.sleep(60) # Pulse every minute
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
