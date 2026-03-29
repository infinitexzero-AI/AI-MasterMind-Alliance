import requests
import re
import json
import os

API_URL = "http://localhost:8090/memory/ingest"
TASK_FILE = "/Users/infinite27/.gemini/antigravity/brain/9f35f193-c35c-431e-9bb4-7ea474dd4086/task.md"

def parse_task_md(file_path):
    """
    Simple parser to convert task.md into a structured Dictionary.
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return {}

    with open(file_path, "r") as f:
        content = f.readlines()

    phases = []
    current_phase = None
    
    for line in content:
        line = line.strip()
        # Detect Phase Headers
        phase_match = re.match(r"^- \[(x| |/)\] \*\*(Phase \d+: .*?)\*\*", line)
        if phase_match:
            status_char = phase_match.group(1)
            phase_title = phase_match.group(2)
            
            status_map = {'x': 'completed', ' ': 'pending', '/': 'in-progress'}
            current_phase = {
                "title": phase_title,
                "status": status_map.get(status_char, 'unknown'),
                "items": []
            }
            phases.append(current_phase)
            continue
            
        # Detect Task Items
        item_match = re.match(r"^- \[(x| |/|!)\] (.*)", line)
        if item_match and current_phase:
            status_char = item_match.group(1)
            item_text = item_match.group(2)
            
            status_map = {'x': 'completed', ' ': 'pending', '/': 'in-progress', '!': 'blocked'}
            current_phase["items"].append({
                "description": item_text,
                "status": status_map.get(status_char, 'unknown')
            })

    return phases

def seed_memory():
    print(f"Parsing {TASK_FILE}...")
    task_data = parse_task_md(TASK_FILE)
    
    if not task_data:
        print("No data parsed.")
        return

    payload = {
        "category": "project",
        "key": "tasks",
        "value": {"phases": task_data}
    }
    
    print("Sending to Hippocampus...")
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print("✅ Success! Memory seeded.")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed. Status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")

if __name__ == "__main__":
    seed_memory()
