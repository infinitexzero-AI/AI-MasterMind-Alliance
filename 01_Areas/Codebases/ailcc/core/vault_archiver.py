import os
import shutil
import logging
import time
from datetime import datetime

# Vault Archiver (Phase 21)
# Proactively moves old or large vault entries to secondary storage (Cold Vault) 
# to maintain SSD health and performance.

logging.basicConfig(level=logging.INFO, format="%(asctime)s [VaultArchiver] %(message)s")
logger = logging.getLogger(__name__)

VAULT_PATH = "/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT"
COLD_VAULT_PATH = "/Volumes/XDriveAlpha/AILCC_COLD_VAULT"
DISK_THRESHOLD_GB = 10.0  # Trigger archiving if < 10GB free

def get_free_space_gb(path: str) -> float:
    """Returns free space in GB."""
    stat = os.statvfs(path)
    return (stat.f_bavail * stat.f_frsize) / (1024**3)

def run_archive_cycle():
    """Checks disk space and moves files if threshold reached."""
    free_gb = get_free_space_gb("/")
    logger.info(f"System Health: {free_gb:.2f} GB available on Primary SSD.")

    if free_gb < DISK_THRESHOLD_GB:
        logger.warning(f"Disk threshold reached ({DISK_THRESHOLD_GB} GB). Initiating cold storage offload...")
        
        if not os.path.exists(COLD_VAULT_PATH):
            os.makedirs(COLD_VAULT_PATH, exist_ok=True)

        if not os.path.exists(VAULT_PATH):
            logger.error("Primary Vault path not found.")
            return

        # Archive logic: Move files older than 30 days or specifically large log files
        files_archived = 0
        for f in os.listdir(VAULT_PATH):
            file_path = os.path.join(VAULT_PATH, f)
            if not os.path.isfile(file_path):
                continue

            stats = os.stat(file_path)
            age_days = (time.time() - stats.st_mtime) / 86400

            # Archive if older than 30 days OR if it's a large JSON/LOG file (> 50MB)
            should_archive = age_days > 30 or (f.endswith(('.json', '.log', '.jsonl')) and stats.st_size > 50 * 1024 * 1024)

            if should_archive:
                try:
                    target_path = os.path.join(COLD_VAULT_PATH, f)
                    shutil.move(file_path, target_path)
                    logger.info(f"Archived: {f} -> Cold Vault")
                    files_archived += 1
                except Exception as e:
                    logger.error(f"Failed to archive {f}: {e}")

        logger.info(f"Archive cycle complete. {files_archived} items offloaded.")
    else:
        logger.info("SSD levels optimal. No archiving required.")

if __name__ == "__main__":
    while True:
        try:
            run_archive_cycle()
        except Exception as e:
            logger.error(f"Vault Archiver error: {e}")
        
        # Check every 6 hours
        time.sleep(6 * 3600)
