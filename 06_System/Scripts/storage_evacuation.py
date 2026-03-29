import shutil
import os
import sys
import time
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [STORAGE-BREAKER] %(message)s")

# Threshold: 10 GB (in bytes)
CRITICAL_THRESHOLD = 10 * (1024 ** 3)
PRIMARY_DRIVE = "/"
EXTERNAL_DRIVE = "/Volumes/XDriveAlpha"
AILCC_ROOT = "/Users/infinite27/AILCC_PRIME"

# Directories we consider safe to evacuate when memory runs out
EVACUATE_TARGETS = [
    os.path.join(AILCC_ROOT, "04_Intelligence_Vault/Raw_Ingestion"),
    os.path.join(AILCC_ROOT, "01_Areas/Codebases/ailcc/dashboard/.next/cache"),
    # Any heavy log dump directories
    "/Users/infinite27/.npm/_cacache",
]

def check_disk_space(path):
    try:
        total, used, free = shutil.disk_usage(path)
        return free
    except Exception as e:
        logging.error(f"Failed to check disk space on {path}: {e}")
        return 0

def execute_evacuation():
    logging.warning("⚠️ CRITICAL STORAGE DETECTED! Initiating emergency evacuation to XDriveAlpha.")
    
    # Check if external drive exists
    if not os.path.exists(EXTERNAL_DRIVE):
        logging.error("❌ XDriveAlpha is NOT mounted. Cannot evacuate! System freezing imminent.")
        return False
        
    evac_root = os.path.join(EXTERNAL_DRIVE, f"AILCC_Evacuation_{int(time.time())}")
    os.makedirs(evac_root, exist_ok=True)
    
    total_freed = 0
    
    for target in EVACUATE_TARGETS:
        if os.path.exists(target):
            try:
                logging.info(f"Evacuating {target}...")
                target_size = sum(os.path.getsize(os.path.join(dirpath, filename)) for dirpath, _, filenames in os.walk(target) for filename in filenames)
                
                dest = os.path.join(evac_root, os.path.basename(target))
                shutil.move(target, dest)
                
                total_freed += target_size
                logging.info(f"✅ Moved {target_size / (1024**2):.2f} MB to {dest}")
            except Exception as e:
                logging.error(f"Failed to move {target}: {e}")
                
    logging.info(f"🔱 Evacuation complete. Freed {total_freed / (1024**3):.2f} GB of space.")
    return True

if __name__ == "__main__":
    logging.info("Starting Autonomous Storage Circuit Breaker...")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--force":
        logging.info("Force evacuation triggered.")
        execute_evacuation()
        sys.exit(0)
    
    while True:
        free_space = check_disk_space(PRIMARY_DRIVE)
        logging.debug(f"Current free space: {free_space / (1024**3):.2f} GB")
        
        if free_space < CRITICAL_THRESHOLD:
            execute_evacuation()
            
        # Sleep for 1 hour to prevent constant read looping
        time.sleep(3600)
