import os
import shutil
import subprocess
from datetime import datetime

# Configuration
SOURCE_TARGETS = [
    "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases",
    "/Users/infinite27/Library/Application Support/Google/Chrome",
    "/Users/infinite27/Library/Mail",
    "/Users/infinite27/Library/Application Support/Antigravity"
]
DESTINATION_HUB = "/Volumes/XDriveAlpha/Vault/Migration_Archive"
LOG_FILE = "/Users/infinite27/AILCC_PRIME/06_System/Logs/migration_pulse.log"

def log_event(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"[{timestamp}] {message}")

def check_disk_space(path):
    total, used, free = shutil.disk_usage(path)
    return free // (2**30) # GB

def migrate_data():
    log_event("🚀 Starting Dual-Drive Nexus Migration...")
    
    if not os.path.exists(DESTINATION_HUB):
        try:
            os.makedirs(DESTINATION_HUB)
            log_event(f"✅ Created destination hub: {DESTINATION_HUB}")
        except Exception as e:
            log_event(f"❌ Failed to create destination hub: {e}")
            return

    for source in SOURCE_TARGETS:
        if not os.path.exists(source):
            log_event(f"⚠️ Source not found, skipping: {source}")
            continue

        basename = os.path.basename(source)
        dest = os.path.join(DESTINATION_HUB, basename)
        
        log_event(f"📦 Migrating {source} -> {dest}...")
        
        # Using rsync for safe transfer
        try:
            subprocess.run(["rsync", "-av", "--progress", source, DESTINATION_HUB], check=True)
            log_event(f"✅ Successfully copied {source}")
            
            # Post-migration cleanup (Optional, can be uncommented after manual verification)
            # shutil.rmtree(source)
            # log_event(f"🧹 Cleaned up source: {source}")
            
        except subprocess.CalledProcessError as e:
            log_event(f"❌ Rsync failed for {source}: {e}")

    log_event("🏁 Migration Pulse Complete.")

if __name__ == "__main__":
    migrate_data()
