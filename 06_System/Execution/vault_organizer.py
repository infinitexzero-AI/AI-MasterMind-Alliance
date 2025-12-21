import os
import shutil
import logging
from datetime import datetime

# Configure Logging
log_file = "06_System/Logs/vault_organizer.log"
os.makedirs(os.path.dirname(log_file), exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("VaultOrganizer")

# Configuration
VAULT_ROOT = "/Users/infinite27/AILCC_PRIME"
DOWNLOADS_DIR = os.path.join(VAULT_ROOT, "Downloads")

# Classification Mapping
CLASSIFICATION = {
    "02_Resources/Media": [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".svg"],
    "02_Resources/Data": [".csv", ".json", ".xlsx", ".pdf", ".txt", ".md"],
    "06_System/Execution": [".py", ".sh", ".js", ".ts", ".tsx"],
    "04_Intelligence_Vault/Traces": [".jsonl", ".log"],
    "00_Projects": [".zip", ".tar.gz", ".dmg"]
}

def organize_vault():
    logger.info("🚀 Starting Vault Organization Ceremony...")
    
    if not os.path.exists(DOWNLOADS_DIR):
        logger.warning(f"Downloads directory not found: {DOWNLOADS_DIR}")
        return

    files = [f for f in os.listdir(DOWNLOADS_DIR) if os.path.isfile(os.path.join(DOWNLOADS_DIR, f))]
    
    if not files:
        logger.info("✓ Downloads vault is already pristine.")
        return

    for filename in files:
        file_ext = os.path.splitext(filename)[1].lower()
        moved = False
        
        for target_rel_path, extensions in CLASSIFICATION.items():
            if file_ext in extensions:
                target_dir = os.path.join(VAULT_ROOT, target_rel_path)
                os.makedirs(target_dir, exist_ok=True)
                
                source_path = os.path.join(DOWNLOADS_DIR, filename)
                target_path = os.path.join(target_dir, filename)
                
                # Check for collisions
                if os.path.exists(target_path):
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    target_path = os.path.join(target_dir, f"{timestamp}_{filename}")
                
                try:
                    shutil.move(source_path, target_path)
                    logger.info(f"Delegated {filename} -> {target_rel_path}")
                    moved = True
                except Exception as e:
                    logger.error(f"Failed to move {filename}: {e}")
                break
        
        if not moved:
            logger.info(f"Skipping unclassified file: {filename}")

    logger.info("✅ Vault Organization Complete.")

if __name__ == "__main__":
    organize_vault()
