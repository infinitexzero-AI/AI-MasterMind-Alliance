import os
import re
from datetime import datetime

# Paths
SYNC_DIR = "/Users/infinite27/AILCC_PRIME/06_System/Synapses"
TASK_MD = "/Users/infinite27/.gemini/antigravity/brain/8c93ab2c-64d6-419b-9eaa-bf2aa404b007/task.md"

def integrate_synapse(file_path):
    print(f"🧠 Integrating Synapse from: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    with open(file_path, 'r') as f:
        content = f.read()

    # Extract directives: DIRECTIVE: `action`
    directives = re.findall(r"DIRECTIVE: `(.+?)`", content)
    
    if not directives:
        print("⚠️ No directives found in synapse file.")
        return

    print(f"🎯 Found {len(directives)} directives.")

    # Apply directives to task.md
    if os.path.exists(TASK_MD):
        with open(TASK_MD, 'r') as f:
            task_content = f.read()

        # Find the Mode 8 section or just append to the end for now
        # For simplicity, we'll add a new section "External Directives" if it doesn't exist
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        new_entries = f"\n\n### External Directives ({timestamp})\n"
        for directive in directives:
            new_entries += f"- [ ] {directive}\n"

        # Try to insert after the last completed item or at the end
        updated_content = task_content + new_entries
        
        with open(TASK_MD, 'w') as f:
            f.write(updated_content)
            
        print(f"✅ Integrated {len(directives)} directives into task.md")
    else:
        print(f"❌ task.md not found at {TASK_MD}")

if __name__ == "__main__":
    # In a real scenario, this would be triggered with a specific file
    # For now, it searches for the latest synapse file if one is not provided
    import sys
    if len(sys.argv) > 1:
        integrate_synapse(sys.argv[1])
    else:
        synapses = [os.path.join(SYNC_DIR, d) for d in os.listdir(SYNC_DIR) if d.startswith("synapse_")]
        if synapses:
            latest_synapse = max(synapses, key=os.path.getmtime)
            integrate_synapse(latest_synapse)
        else:
            print("🛑 No synapse files found to integrate.")
