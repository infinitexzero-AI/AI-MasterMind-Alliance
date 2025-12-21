import os
import json
import sys
from datetime import datetime

# Path Resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../"))
CONFIG_PATH = os.path.join(WORKSPACE_ROOT, "antigravity_config.json")

# Ensure core is importable
CORE_DIR = os.path.join(WORKSPACE_ROOT, "01_Areas", "Codebases", "ailcc")
sys.path.append(CORE_DIR)

from core.integrations.google_bridge import GoogleBridge
from core.integrations.scholar_bridge import sync_courses

# Antigravity Logic Core
# This script orchestrates the switching of modes and status updates

MODES_DIR = os.path.join(WORKSPACE_ROOT, "01_Areas", "modes")
STATE_FILE = os.path.join(WORKSPACE_ROOT, "06_System", "State", "dashboard_state.json")

def load_state():
    with open(STATE_FILE, 'r') as f:
        return json.load(f)

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def set_mode(mode_name):
    print(f"Antigravity: Switching System to [{mode_name.upper()}] Mode...")
    state = load_state()
    
    # Update active mode in state (mock structure update)
    if "system" not in state:
        state["system"] = {}
    
    state["system"]["active_mode"] = mode_name
    state["system"]["last_update"] = datetime.now().isoformat()
    
    save_state(state)
    print(f"Antigravity: System is now in {mode_name} mode.")

def scan_courses():
    print("Antigravity: Scanning Scholar Data...")
    courses_path = os.path.join(MODES_DIR, "mode-1-student", "current_courses.json")
    try:
        with open(courses_path, 'r') as f:
            data = json.load(f)
            print(f"Found {len(data['courses'])} active courses.")
            for course in data['courses']:
                print(f" - {course['code']}: {course['name']} ({course['deliverables'][-1]['status']} Exam)")
    except FileNotFoundError:
        print("Error: Scholar data not found.")

def sync_state():
    print("Antigravity: Syncing State to Cloud...")
    state = load_state()
    bridge = GoogleBridge()
    
    if bridge.authenticate():
        # Ideally we find an existing log sheet or create one. 
        # For this prototype, we'll append to a hardcoded ID if known, 
        # OR just create a new one if we want to be safe, 
        # BUT for a "Sync" it implies using an existing resource.
        # Let's check state for a 'cloud_log_id'.
        
        spreadsheet_id = state.get('system', {}).get('cloud_log_id')
        
        if not spreadsheet_id:
            print("No Cloud Log found in state. Creating new log sheet...")
            spreadsheet_id = bridge.create_sheet("AILCC System Logs")
            if spreadsheet_id:
                # Update state with new ID
                if "system" not in state: state["system"] = {}
                state["system"]["cloud_log_id"] = spreadsheet_id
                save_state(state)
        
        if spreadsheet_id:
            timestamp = datetime.now().isoformat()
            mode = state.get('system', {}).get('active_mode', 'UNKNOWN')
            row = [timestamp, mode, "Sync performed"]
            bridge.append_row(spreadsheet_id, row)
        else:
            print("❌ Failed to resolve Cloud Log ID.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python antigravity.py [mode|scan|status]")
        sys.exit(1)
        
    command = sys.argv[1]
    
    if command == "mode":
        set_mode(sys.argv[2])
    elif command == "scan":
        scan_courses()
    elif command == "sync":
        sync_state()
    elif command == "scholar":
        sync_courses()
    elif command == "status":
        state = load_state()
        print(json.dumps(state['meta_orchestrator'], indent=2))
    else:
        print(f"Unknown command: {command}")
