import time
import requests
import json
import datetime

def simulate_plan():
    url = "http://localhost:5005/api/system/command"
    plan_id = f"test_plan_{int(time.time())}"
    
    # Step 1: Send the blueprint schema
    payload = {
        "id": plan_id,
        "title": "Mastermind Synergy: Sovereign Agency",
        "status": "IN_PROGRESS",
        "steps": [
            {"id": "step_0", "title": "mcp_gateway (pull_documentation)", "status": "pending"},
            {"id": "step_1", "title": "blackboard_daemon (peer_review_architecture)", "status": "pending"},
            {"id": "step_2", "title": "neural_skill_forge (execute_codebase)", "status": "pending"},
            {"id": "step_3", "title": "ghostwriter_daemon (generate_readme)", "status": "pending"}
        ]
    }
    
    print("Broadcasting initial blueprint...")
    requests.post(url, json={"command": "ACTION_PLAN", "data": payload})
    
    steps = payload["steps"]
    
    for i in range(len(steps)):
        print(f"Simulating Step {i} execution...")
        time.sleep(2)  # Wait 2 seconds between updates
        
        # Mark current step as in-progress
        steps[i]["status"] = "in_progress"
        requests.post(url, json={"command": "ACTION_PLAN", "data": payload})
        
        time.sleep(2)  # Simulating work
        
        # Mark current step as completed
        steps[i]["status"] = "completed"
        requests.post(url, json={"command": "ACTION_PLAN", "data": payload})
        
    print("Simulation complete.")

if __name__ == "__main__":
    simulate_plan()
