import json
import os
import shutil
from pathlib import Path

# Paths
AUDIT_RESULTS = "/Users/infinite27/AILCC_PRIME/06_System/State/hippocampus_audit_results.json"
TARGET_BASE = "/Volumes/XDriveAlpha/Archive/iCloud_Deep_Archive"
ICLOUD_PREFIX = "/Users/infinite27/Library/Mobile Documents/com~apple~CloudDocs"

def migrate():
    if not os.path.exists(AUDIT_RESULTS):
        print("Audit results not found.")
        return

    with open(AUDIT_RESULTS, 'r') as f:
        data = json.load(f)

    candidates = [
        f for f in data.get("archival_candidates", []) 
        if f['age_days'] > 365 and f['path'].startswith(ICLOUD_PREFIX)
    ]
    
    # Also check large files
    candidates += [
        f for f in data.get("large_files", [])
        if f['age_days'] > 365 and f['path'].startswith(ICLOUD_PREFIX)
    ]

    print(f"Found {len(candidates)} candidates for year-old migration.")
    
    os.makedirs(TARGET_BASE, exist_ok=True)
    
    success_count = 0
    fail_count = 0
    
    for item in candidates:
        src = item['path']
        # Maintain relative structure within deep archive
        rel_path = os.path.relpath(src, ICLOUD_PREFIX)
        dst = os.path.join(TARGET_BASE, rel_path)
        
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        
        try:
            print(f"Moving: {rel_path} ({item['size_mb']} MB)...")
            shutil.move(src, dst)
            success_count += 1
        except Exception as e:
            print(f"Failed to move {rel_path}: {e}")
            fail_count += 1

    print(f"\nMigration Summary:")
    print(f"Successfully moved: {success_count}")
    print(f"Failed (likely not downloaded): {fail_count}")

if __name__ == "__main__":
    migrate()
