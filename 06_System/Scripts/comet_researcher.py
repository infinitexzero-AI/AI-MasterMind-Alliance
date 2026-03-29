import subprocess
import json
import os
import sys

# Paths
OMNITRACKER_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/tasks/omnitracker_registry.json"
NATIVE_BRIDGE_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/integrations/comet_native_bridge.py"

def run_research(task_desc):
    print(f"🕵️ Starting Autonomous Research via Comet Bridge: '{task_desc}'")
    
    # Construct the query for the Comet Assistant
    query = f"Research the latest 2026 documentation and implementation best practices for: {task_desc}. Summarize the core logic to be used in the AI Mastermind Alliance codebase."
    
    try:
        # Call the native bridge
        # Note: This uses osascript and will physically control the Mac UI
        result = subprocess.run(
            ["python3", NATIVE_BRIDGE_PATH, "--query", query],
            capture_output=True,
            text=True
        )
        print(f"✅ Research Command Dispatched to Comet Bridge: {result.stdout}")
    except Exception as e:
        print(f"❌ Error during Comet Research: {e}")

def main():
    if not os.path.exists(OMNITRACKER_PATH):
        print("❌ Registry not found.")
        return

    with open(OMNITRACKER_PATH, 'r') as f:
        registry = json.load(f)

    # Find the first pending task in Wave 21 or 22
    target_tasks = []
    for wave in registry.get("waves", []):
        if wave["wave_id"] in [21, 22]:
            for task in wave.get("tasks", []):
                if task["status"] in ["pending", "pending_approval"]:
                    target_tasks.append(task)
    
    if not target_tasks:
        print("📭 No pending tasks to research.")
        return

    # Select the first one for autonomous research
    task_to_research = target_tasks[0]
    run_research(task_to_research["description"])

if __name__ == "__main__":
    main()
