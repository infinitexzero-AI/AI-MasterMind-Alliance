import json
import os
from datetime import datetime

OMNITRACKER_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/tasks/omnitracker_registry.json"
OPTIMIZER_LOG = "/Users/infinite27/AILCC_PRIME/06_System/State/optimizer_logs.json"

BIO_PULSE_PATH = "/Users/infinite27/AILCC_PRIME/data/bio_pulse.json"

def get_registry():
    with open(OMNITRACKER_PATH, 'r') as f:
        return json.load(f)

def run_evolution():
    registry = get_registry()
    print("🧠 OmniTracker Optimizer: Biometric + Dependency Alignment Initiated")
    
    # 1. Map Completed Tasks for Dependency Checking
    completed_ids = set()
    for wave in registry.get("waves", []):
        for task in wave.get("tasks", []):
            if task.get("status") == "completed":
                completed_ids.add(task.get("id"))

    # 2. Get Current Bio State
    current_state = "RECOVERY" # Default
    if os.path.exists(BIO_PULSE_PATH):
        try:
            with open(BIO_PULSE_PATH, 'r') as f:
                bio_data = json.load(f)
                current_state = bio_data.get("energy_state", "RECOVERY")
                print(f"💓 Bio-Status Detected: {current_state}")
        except Exception as e:
            print(f"⚠️ Failed to read Bio-Pulse: {e}")

    # 3. Re-rank tasks locally (In-place sort for each wave)
    for wave in registry.get("waves", []):
        tasks = wave.get("tasks", [])
        
        def rank_task(t):
            # Dependency Check (Hard Gate)
            deps = t.get("metadata", {}).get("depends_on", [])
            if isinstance(deps, int):
                deps = [deps]
            is_blocked = not all(d in completed_ids for d in deps)
            
            if is_blocked:
                return -100 # Sent to bottom of the queue
                
            preferred = t.get("metadata", {}).get("preferred_energy_state", "FOCUS")
            match_score = 10 if preferred == current_state else 0
            status_score = 5 if t.get("status") in ["pending", "in_progress", "researching"] else 0
            return match_score + status_score
            
        tasks.sort(key=rank_task, reverse=True)
    
    # Save optimized registry
    with open(OMNITRACKER_PATH, 'w') as f:
        json.dump(registry, f, indent=2)
        
    print(f"✨ Registry Aligned for {current_state} state + Prerequisites.")
    
    # Log the action
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": "DEPENDENCY_ALIGNMENT",
        "state": current_state,
        "completed_context": list(completed_ids),
        "result": "Dynamic Multi-Chain Synchronization Completed"
    }
    
    with open(OPTIMIZER_LOG, 'w') as f:
        json.dump(log_entry, f, indent=2)

if __name__ == "__main__":
    if os.path.exists(OMNITRACKER_PATH):
        run_evolution()
    else:
        print("❌ Error: OmniTracker Registry not found.")
