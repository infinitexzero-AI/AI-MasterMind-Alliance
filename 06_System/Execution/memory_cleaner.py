import os
import subprocess
import logging

# Configure Logging
log_file = "06_System/Logs/memory_cleaner.log"
os.makedirs(os.path.dirname(log_file), exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MemoryCleaner")

VAULT_ROOT = "/Users/infinite27/AILCC_PRIME"

def purge_artifacts():
    logger.info("🧹 Initiating System Memory Purge...")
    
    # 1. Clean .DS_Store
    logger.info("   Removing .DS_Store ghosts...")
    cmd_ds = f"find {VAULT_ROOT} -name '.DS_Store' -delete"
    subprocess.run(cmd_ds, shell=True)
    
    # 2. Clean Node Modules (Optional - dangerous, let's just do cache)
    # logger.info("   Pruning temporary build caches...")
    # cmd_cache = f"find {VAULT_ROOT} -name '.next' -type d -exec rm -rf {{}} +"
    
    # 3. Clean Python Cache
    logger.info("   Exorcizing __pycache__ spirits...")
    cmd_py = f"find {VAULT_ROOT} -name '__pycache__' -type d -exec rm -rf {{}} +"
    subprocess.run(cmd_py, shell=True)

    logger.info("✨ System Memory Sanitized.")

if __name__ == "__main__":
    purge_artifacts()
