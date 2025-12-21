import json
import os
from datetime import datetime

CONFIG_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/context_config.json"
STATE_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/current_context.json"
LOG_PATH = "/Users/infinite27/AILCC_PRIME/06_System/Logs/context_transitions.log"

def get_current_mode():
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    current_day = now.weekday() # 0-6 (Mon-Sun)
    
    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)
        
    active_mode = "REST" # Default
    
    for entry in config['schedule']:
        if current_day in entry['days']:
            if entry['start'] <= current_time <= entry['end']:
                active_mode = entry['mode']
                break
                
    return active_mode, config['modes'].get(active_mode, {})

def update_context():
    mode_id, mode_info = get_current_mode()
    
    new_state = {
        "active_mode": mode_id,
        "mode_info": mode_info,
        "timestamp": datetime.now().isoformat(),
        "last_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Check if mode changed
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'r') as f:
            old_state = json.load(f)
    else:
        old_state = {}
        
    if old_state.get("active_mode") != mode_id:
        with open(LOG_PATH, 'a') as log:
            log.write(f"[{datetime.now().isoformat()}] 🔄 MODE TRANSITION: {old_state.get('active_mode', 'INIT')} -> {mode_id}\n")
        print(f"🔄 Switching Mode: {mode_id}")
    
    with open(STATE_PATH, 'w') as f:
        json.dump(new_state, f, indent=2)
        
    return new_state

if __name__ == "__main__":
    state = update_context()
    print(f"Current System Context: {state['active_mode']} - {state['mode_info'].get('name', 'Unknown')}")
