#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

# Canonical Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
STATE_PATH = f"{ROOT}/06_System/State/current_context.json"
VAULT_PATH = f"{ROOT}/04_Intelligence_Vault/Hardship_Chronicles"
CODE_PATH = f"{ROOT}/01_Areas/Codebases"
ALLIANCE_PATH = f"{ROOT}/AI-MasterMind-Alliance"
LOG_DIR = f"{ROOT}/logs/context_memory"

# Mode-to-Path Mapping
ROUTING_MAP = {
    "SCHOLAR": VAULT_PATH,
    "CODE": CODE_PATH,
    "STRATEGY": ALLIANCE_PATH,
    "REST": f"{ROOT}/logs"
}

def get_current_mode():
    try:
        with open(STATE_PATH, 'r') as f:
            data = json.load(f)
            return data.get("active_mode", "REST")
    except Exception:
        return "REST"

def sort_work(title, content, tags=[]):
    mode = get_current_mode()
    target_dir = ROUTING_MAP.get(mode, f"{ROOT}/logs")
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)
        
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    safe_title = title.replace(" ", "_").lower()
    filename = f"{timestamp}_{safe_title}.md"
    
    # Ensure a local 'Memories' or 'Logs' folder exists in the target
    sub_dir = os.path.join(target_dir, "Context_Logs")
    os.makedirs(sub_dir, exist_ok=True)
    
    filepath = os.path.join(sub_dir, filename)
    
    # Prepare Content
    wrapped_content = f"""# Contextual Archive: {title}
- **Date**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
- **System Mode**: {mode}
- **Tags**: {', '.join(tags)}

---

{content}

---
*Automatically sorted by Nexus Memory Bridge*
"""
    
    with open(filepath, 'w') as f:
        f.write(wrapped_content)
        
    # Append to a Master Transcript for that mode
    transcript_path = os.path.join(target_dir, "TRANSCRIPT.md")
    with open(transcript_path, 'a') as f:
        f.write(f"- [{datetime.now().strftime('%H:%M')}] [{mode}] {title} ([{filename}](file://{filepath}))\n")
        
    print(f"✅ Successfully sorted work to: {filepath}")
    return filepath

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 auto_context_sorter.py '<title>' '<content>' '[tag1,tag2]'")
        sys.exit(1)
        
    title_arg = sys.argv[1]
    content_arg = sys.argv[2]
    tags_arg = sys.argv[3].split(",") if len(sys.argv) > 3 else []
    
    sort_work(title_arg, content_arg, tags_arg)
