#!/usr/bin/env python3
"""
Step 142: Tactical Storage Migration
Moves large, archival-ready files from iCloud/CloudDocs to a local archive 
to optimize sync performance and free up cloud space.
"""

import os
import json
import shutil
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
ARCHIVE_ROOT = f"{ROOT}/04_Intelligence_Vault/Archive"
AUDIT_FILE = f"{ROOT}/06_System/State/hippocampus_audit_results.json"
LOG_FILE = f"{ROOT}/06_System/Logs/storage_migration.log"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] [STORAGE] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def run_migration():
    log("🚀 Initiating Tactical Storage Migration...")
    
    if not os.path.exists(AUDIT_FILE):
        log("❌ Audit file not found. Run storage audit first.")
        return

    with open(AUDIT_FILE, 'r') as f:
        audit_data = json.load(f)

    large_files = audit_data.get("large_files", [])
    migration_count = 0
    space_freed = 0

    # Define candidates for migration (e.g., > 50MB and > 365 days old)
    for item in large_files:
        path = item['path']
        size = item['size_mb']
        age = item['age_days']

        if size > 50 and age > 365:
            if os.path.exists(path):
                dest_path = os.path.join(ARCHIVE_ROOT, os.path.basename(path))
                
                # Check for duplicates in archive
                if os.path.exists(dest_path):
                    # Append timestamp to avoid overwrite
                    dest_path = f"{dest_path.replace('.zip', '').replace('.obj', '')}_{datetime.now().strftime('%Y%m%d')}{os.path.splitext(path)[1]}"

                log(f"📦 Migrating: {os.path.basename(path)} ({size:.2f} MB, {age:.0f} days old)")
                try:
                    os.makedirs(ARCHIVE_ROOT, exist_ok=True)
                    # For local-to-local on Mac, os.rename is atomic and fast.
                    # If cross-volume, shutil.move handles it.
                    shutil.move(path, dest_path)
                    log(f"✅ Successfully archived to {dest_path}")
                    migration_count += 1
                    space_freed += size
                except Exception as e:
                    log(f"❌ Migration failed for {path}: {e}")

    log(f"✨ Storage Migration Pulse Complete. Migrated {migration_count} files, staged {space_freed:.2f} MB for cloud reclamation.")

if __name__ == "__main__":
    run_migration()
