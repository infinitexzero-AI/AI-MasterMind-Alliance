import re
import json
import os
from pathlib import Path

AILCC_ROOT = Path("C:/Users/infin/AILCC_PRIME")
TASK_MD = AILCC_ROOT / "task.md"
REGISTRY_JSON = AILCC_ROOT / "tasks/consolidated_task_registry.json"

def parse_task_md():
    if not TASK_MD.exists():
        return []
    
    with open(TASK_MD, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Simple regex to find tasks like "- [x] Task Title" or "- [ ] Task Title"
    pattern = r"- \[([ x/])\] \*\*?(.*?)\*\*?"
    matches = re.findall(pattern, content)
    
    tasks = []
    for i, (status_char, title) in enumerate(matches):
        status = "completed" if status_char == "x" else "in_progress" if status_char == "/" else "pending"
        tasks.append({
            "id": f"task_{i}",
            "title": title.strip(),
            "status": status,
            "priority": "high", # Default
            "narrative": "Synced from local task.md"
        })
    
    return tasks

def sync():
    tasks = parse_task_md()
    registry = {
        "last_sync": "2026-04-08T15:00:00Z", # Placeholder
        "registry": tasks
    }
    
    os.makedirs(REGISTRY_JSON.parent, exist_ok=True)
    with open(REGISTRY_JSON, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)
    
    print(f"[*] Synced {len(tasks)} tasks to {REGISTRY_JSON}")

if __name__ == "__main__":
    sync()
