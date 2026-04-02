import tarfile
import os
import time
import logging
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [LegacyVault] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage"
VAULT_OUTPUT_DIR = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/external_drives"

class LegacyVaultBackuper:
    """
    Epoch 35 Cold Storage Protocol.
    Compresses the entire Hippocampus (Chroma Vectors, SQLite DBs, Ledger) 
    into a time-stamped, immutable .tar.gz archive.
    Designed for M-Disc mathematical permanence.
    """
    @staticmethod
    def execute_backup():
        if not os.path.exists(HIPPOCAMPUS_DIR):
            logger.error(f"Hippocampus Directory missing: {HIPPOCAMPUS_DIR}")
            return False
            
        os.makedirs(VAULT_OUTPUT_DIR, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"AILCC_Vault_Archive_{timestamp}.tar.gz"
        output_path = os.path.join(VAULT_OUTPUT_DIR, output_filename)
        
        logger.info(f"Initiating Cryo-Stasis on {HIPPOCAMPUS_DIR}...")
        
        try:
            # Compress using gzip format
            with tarfile.open(output_path, "w:gz") as tar:
                # Add the directory recursively
                tar.add(HIPPOCAMPUS_DIR, arcname=os.path.basename(HIPPOCAMPUS_DIR))
                
            archive_size = os.path.getsize(output_path) / (1024 * 1024)
            logger.info(f"✅ Legacy Vault Archive secured: {output_filename} ({archive_size:.2f} MB)")
            logger.info("Ready for physical M-Disc extraction.")
            return True
        except Exception as e:
            logger.error(f"Cryo-Stasis failure: {e}")
            return False

if __name__ == "__main__":
    logger.info("Booting Archon Legacy Vault Compression Matrix...")
    LegacyVaultBackuper.execute_backup()
