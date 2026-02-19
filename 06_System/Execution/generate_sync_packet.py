import json
import os
from datetime import datetime

# Paths
WORKSPACE_ROOT = "/Users/infinite27/AILCC_PRIME"
REGISTRY_FILE = os.path.join(WORKSPACE_ROOT, "01_Areas/Codebases/ailcc/registries/agents_registry.json")
EVENT_BUS_LOG = os.path.join(WORKSPACE_ROOT, "06_System/Logs/event_bus.jsonl")
TASK_MD = "/Users/infinite27/.gemini/antigravity/brain/8c93ab2c-64d6-419b-9eaa-bf2aa404b007/task.md"
PLAN_MD = "/Users/infinite27/.gemini/antigravity/brain/8c93ab2c-64d6-419b-9eaa-bf2aa404b007/implementation_plan.md"
OUTPUT_PATH = os.path.join(WORKSPACE_ROOT, "06_System/Synapses/current_system_packet.json")

def read_file(path, lines=None):
    if not os.path.exists(path):
        return None
    try:
        with open(path, 'r') as f:
            if lines:
                return f.readlines()[-lines:]
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"

def generate_packet():
    print("🛰️  Generating System Intelligence Packet...")
    
    packet = {
        "timestamp": datetime.now().isoformat(),
        "registry": None,
        "recent_events": [],
        "active_task": None,
        "implementation_plan": None
    }
    
    # Load Registry
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, 'r') as f:
            packet["registry"] = json.load(f)
            
    # Load Events
    event_lines = read_file(EVENT_BUS_LOG, lines=20)
    if event_lines:
        packet["recent_events"] = [json.loads(line) for line in event_lines if line.strip()]
        
    # Load Task & Plan
    packet["active_task"] = read_file(TASK_MD)
    packet["implementation_plan"] = read_file(PLAN_MD)
    
    # Save output
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(packet, f, indent=2)
        
    print(f"✅ Packet consolidated at: {OUTPUT_PATH}")
    return OUTPUT_PATH

if __name__ == "__main__":
    generate_packet()
