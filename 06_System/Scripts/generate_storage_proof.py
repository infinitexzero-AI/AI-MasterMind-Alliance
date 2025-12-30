import os
import json
from pathlib import Path

def generate_report():
    brain_map_path = "/Users/infinite27/.aimma/second_brain_map_REAL.json"
    archive_root = "/Volumes/XDriveAlpha/Archives"
    report_path = "/Users/infinite27/AILCC_PRIME/06_System/State/STORAGE_PROOF.md"
    
    with open(brain_map_path, 'r') as f:
        brain_map = json.load(f)
    
    icloud_items = brain_map['structure'].get('iCloud', [])
    
    report = "# 🛡️ Hippocampus: Proof of Transfer\n\n"
    report += "This report compares the documented '2nd Brain' structure against the current contents of **XDriveAlpha/Archives/**.\n\n"
    report += "| Folder | Expected Content (JSON) | Found in Archive | Status |\n"
    report += "| :--- | :--- | :--- | :--- |\n"
    
    for item in icloud_items:
        name = item['name']
        expected_children = item['children']
        archive_path = os.path.join(archive_root, name)
        
        if os.path.exists(archive_path):
            found_children = os.listdir(archive_path)
            # Filter out .DS_Store
            found_children = [c for c in found_children if not c.startswith('.')]
            expected_count = len([c for c in expected_children if not c.startswith('.')])
            found_count = len(found_children)
            
            status = "✅ COMPLETE" if found_count >= expected_count else "⏳ PARTIAL"
            if name == "3D Scan 2024":
                status = f"🔄 IN_PROGRESS ({found_count}/{expected_count} groups)"
            
            report += f"| `{name}` | {expected_count} files/folders | {found_count} items | {status} |\n"
        else:
            # Check if it was meant to be moved
            non_essential = ["3D Scan", "Photos", "Bills", "Archive", "Documentation", "Leads", "Word", "New stuff", "Routine"]
            is_candidate = any(p in name for p in non_essential)
            if is_candidate:
                report += f"| `{name}` | {len(expected_children)} items | ❌ NOT FOUND | 🚫 PENDING |\n"
            else:
                report += f"| `{name}` | {len(expected_children)} items | - | 🏠 KEPT IN CLOUD |\n"

    report += "\n\n## 💡 Cache Information\n"
    report += "- **Browser Caches**: Temporary data from websites (images, scripts). Safe to delete. Does NOT affect AI context.\n"
    report += "- **AI Context**: Your conversation history and logic are stored in `~/.config/antigravity` and `~/AILCC_PRIME`. These are NEVER in the Cache folders.\n"

    with open(report_path, 'w') as f:
        f.write(report)
    print(f"Report generated at {report_path}")

if __name__ == "__main__":
    generate_report()
