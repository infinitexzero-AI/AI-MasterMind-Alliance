import os
import json
import sys
from datetime import datetime

# Antigravity Logic Core
# This script orchestrates the switching of modes and status updates

MODES_DIR = "modes"
STATE_FILE = "dashboard_state.json"

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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python antigravity.py [mode|scan|status]")
        sys.exit(1)
        
    command = sys.argv[1]
    
    if command == "mode":
        set_mode(sys.argv[2])
    elif command == "scan":
        scan_courses()
    elif command == "status":
        state = load_state()
        print(json.dumps(state['meta_orchestrator'], indent=2))
    else:
        print(f"Unknown command: {command}")
