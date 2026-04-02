import os
import glob
import json
import shutil
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
import redis.asyncio as redis

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [VaultBackup] - %(message)s')
logger = logging.getLogger("VaultBackup")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
HIPPOCAMPUS = AILCC_ROOT / "hippocampus_storage"

# The native macOS iCloud Drive direct sync path
ICLOUD_DRIVE = Path(os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/AILCC_Backups"))
TMP_ZIP_DIR = AILCC_ROOT / "automations" / "spool"

# Ensure directories exist
ICLOUD_DRIVE.mkdir(parents=True, exist_ok=True)
TMP_ZIP_DIR.mkdir(parents=True, exist_ok=True)

class VaultBackupDaemon:
    """
    Epoch 32 Core Resilience Matrix (Tasks 24-25):
    Compresses the massive 3D intelligence arrays, PDFs, and timelines stored in 
    the Hippocampus down into a single high-efficiency `.zip` archive. 
    It physically dumps this into the macOS iCloud Drive, where the OS silently 
    pushes it to the Apple ecosystem natively without AWS fees.
    """
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379", decode_responses=True)

    async def prune_archives(self):
        """Mathematically deletes `.zip` archives older than 7 days to preserve iCloud limit."""
        logger.info("🧹 Initiating 7-day temporal pruning sweep of iCloud Drive...")
        now = datetime.now()
        archives = list(ICLOUD_DRIVE.glob("AILCC_Hippocampus_Backup_*.zip"))
        
        pruned_count = 0
        for archive in archives:
            # File modified timestamp
            mtime = datetime.fromtimestamp(archive.stat().st_mtime)
            if now - mtime > timedelta(days=7):
                logger.info(f"🗑️ Pruning stale archive: {archive.name}")
                archive.unlink()
                pruned_count += 1
                
        if pruned_count > 0:
            logger.info(f"✅ Pruning Complete. Eliminated {pruned_count} obsolete backups.")

    async def execute_backup(self):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_name = f"AILCC_Hippocampus_Backup_{timestamp}"
        zip_temp_path = TMP_ZIP_DIR / zip_name
        
        logger.info(f"🔒 Engaging Cryptographic Compression on {HIPPOCAMPUS.name}...")
        
        try:
            # Physically compress the data layer
            archive_path = shutil.make_archive(
                base_name=str(zip_temp_path),
                format='zip',
                root_dir=str(HIPPOCAMPUS.parent),
                base_dir=HIPPOCAMPUS.name
            )
            
            logger.info("📦 Compression achieved. Migrating array to Apple iCloud infrastructure...")
            
            # Move exact physical file to iCloud bounds
            final_icloud_path = ICLOUD_DRIVE / Path(archive_path).name
            shutil.move(archive_path, str(final_icloud_path))
            
            size_mb = final_icloud_path.stat().st_size / (1024 * 1024)
            success_msg = f"Vault successfully backed up to iCloud. Array Size: {size_mb:.2f} MB"
            
            logger.info(f"✅ {success_msg}")
            
            # Fire successful payload block to War Room Dashboard
            await self.redis.publish("NEURAL_SYNAPSE", json.dumps({
                "signal_id": f"backup-{timestamp}",
                "type": "SYSTEM_EVENT",
                "message": f"🛡️ {success_msg}",
                "timestamp": datetime.now().isoformat()
            }))
            
        except Exception as e:
            logger.critical(f"FATAL: Mastermind compression matrix failed: {e}")
            await self.redis.publish("NEURAL_SYNAPSE", json.dumps({
                "type": "SYSTEM_EVENT",
                "message": f"❌ CRITICAL BACKUP FAILURE: {e}",
                "timestamp": datetime.now().isoformat()
            }))

    async def sequence(self):
        await self.redis.ping()
        logger.info("⚡ Sovereign Resilience Loop Online.")
        await self.execute_backup()
        await self.prune_archives()

if __name__ == "__main__":
    daemon = VaultBackupDaemon()
    asyncio.run(daemon.sequence())
