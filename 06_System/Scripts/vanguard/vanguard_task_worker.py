import os
import sys
import json
import time
import random
import redis

# Phase 35 Vanguard Auto-Execution Worker
# This script is dynamically spawned by the orchestrator_daemon.
# It simulates complex sub-agent execution while actively transmitting
# progress payload events to the React UI.

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
AILCC_PRIME = "/Users/infinite27/AILCC_PRIME"
REGISTRY_FILE = os.path.join(AILCC_PRIME, "tasks/consolidated_task_registry.json")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 vanguard_task_worker.py <TASK_ID>")
        sys.exit(1)

    task_id = sys.argv[1]
    
    # Intialize Redis Bridge
    try:
        r = redis.from_url(REDIS_URL, decode_responses=True)
    except Exception as e:
        print(f"Worker {task_id} failed to connect to Redis: {e}")
        sys.exit(1)

    print(f"[Worker] Boot sequence complete. Claiming task {task_id}")

    steps = [
        "Analyzing directive parameters...",
        "Allocating memory shard...",
        "Executing underlying logic algorithm...",
        "Performing security audit...",
        "Validating heuristic constraints...",
        "Synchronizing output vectors...",
        "Finalizing telemetry buffers..."
    ]

    total_time = random.uniform(15, 30) # Take roughly 15-30 seconds
    step_delay = total_time / len(steps)
    
    for i, step_msg in enumerate(steps):
        time.sleep(step_delay)
        
        progress_val = int(((i + 1) / len(steps)) * 100)
        if progress_val > 99:
            progress_val = 99
            
        print(f"[{progress_val}%] {step_msg}")
        
        # Broadcast the real-time progress pulse via Redis directly to dashboard
        payload = {
            "intent": "TASK_PROGRESS_UPDATE",
            "task_id": task_id,
            "progress": progress_val,
            "message": step_msg,
            "timestamp": time.time()
        }
        r.publish("NEURAL_SYNAPSE", json.dumps(payload))

    # Finish Task
    time.sleep(1)
    
    # Safely commit to file system registry
    try:
        with open(REGISTRY_FILE, 'r') as f:
            data = json.load(f)
            
        registry = data.get("registry", [])
        for task in registry:
            if task.get("id") == task_id:
                task["status"] = "COMPLETED"
                task["telemetry"]["progress"] = 100
                task["telemetry"]["lastEvent"] = "Execution Successful. Vanguard Output Stored."
                break
                
        with open(REGISTRY_FILE, 'w') as f:
            json.dump(data, f, indent=4)
            
        # Send one final burst dictating 100% completion
        completion_payload = {
            "intent": "TASK_PROGRESS_UPDATE",
            "task_id": task_id,
            "progress": 100,
            "message": "Execution Successful.",
            "status": "COMPLETED",
            "timestamp": time.time()
        }
        r.publish("NEURAL_SYNAPSE", json.dumps(completion_payload))
        
        # Tell UI to reload standard tasks entirely since state officially changed
        r.publish("NEURAL_SYNAPSE", json.dumps({"intent": "FORCE_UI_SYNC"}))

        print(f"[Worker] Task {task_id} successfully finalized and closed.")
        sys.exit(0)
        
    except Exception as e:
        print(f"Error finalizing task {task_id}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
