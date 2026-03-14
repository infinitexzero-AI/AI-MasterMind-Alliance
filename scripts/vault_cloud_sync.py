#!/usr/bin/env python3
import os
import shutil
import logging
import time
from datetime import datetime

# Configuration
CLOUD_SOURCES = [
    os.path.expanduser("~/Desktop"),
    os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/01-Projects"),
    os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/02-Areas")
]
VAULT_TARGET = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/Cloud_Mirror"
EXTENSIONS = [".md", ".pdf", ".txt", ".json"]

logging.basicConfig(level=logging.INFO, format='%(asctime)s [CLOUD-SYNC] %(message)s')

def sync_cloud_to_vault():
    logging.info("☁️ Starting Cloud-to-Vault Mirroring Protocol...")
    
    if not os.path.exists(VAULT_TARGET):
        os.makedirs(VAULT_TARGET)
        logging.info(f"Created Vault mirror directory: {VAULT_TARGET}")

    sync_count = 0
    error_count = 0
    missing_local = 0

    for source in CLOUD_SOURCES:
        if not os.path.exists(source):
            logging.warning(f"Source path not found: {source}")
            continue

        logging.info(f"Scanning: {source}")
        for root, dirs, files in os.walk(source):
            for file in files:
                # Detect iCloud stub files (evicted files)
                if file.startswith(".") and file.endswith(".icloud"):
                    missing_local += 1
                    logging.debug(f"File evicted from local storage: {file}")
                    continue

                if any(file.lower().endswith(ext) for ext in EXTENSIONS):
                    source_path = os.path.join(root, file)
                    # Create a flat name based on path to avoid collisions
                    rel_path = os.path.relpath(source_path, source).replace("/", "_")
                    target_path = os.path.join(VAULT_TARGET, f"{os.path.basename(source)}_{rel_path}")

                    try:
                        # Only copy if different or new
                        if not os.path.exists(target_path) or os.path.getmtime(source_path) > os.path.getmtime(target_path):
                            shutil.copy2(source_path, target_path)
                            sync_count += 1
                            logging.info(f"✅ Synced: {file}")
                    except Exception as e:
                        error_count += 1
                        logging.error(f"Failed to sync {file}: {str(e)}")

    logging.info("🏁 Cloud Sync Cycle Complete.")
    logging.info(f"   - Synced: {sync_count} files")
    logging.info(f"   - Evicted/iCloud Errors: {missing_local} files")
    logging.info(f"   - Failed: {error_count} files")

if __name__ == "__main__":
    sync_cloud_to_vault()
