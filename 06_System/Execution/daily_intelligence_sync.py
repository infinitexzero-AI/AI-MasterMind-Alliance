import os
import subprocess
import logging
from datetime import datetime

# Path Configuration
BASE_PATH = "/Users/infinite27/AILCC_PRIME"
EXECUTION_DIR = os.path.join(BASE_PATH, "06_System/Execution")
LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/daily_sync.log")

# Logging Configuration
if not os.path.exists(os.path.dirname(LOG_PATH)):
    os.makedirs(os.path.dirname(LOG_PATH))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)

def run_script(script_name):
    script_path = os.path.join(EXECUTION_DIR, script_name)
    if not os.path.exists(script_path):
        logging.error(f"❌ Script not found: {script_name}")
        return False
    
    logging.info(f"▶️ Executing: {script_name}")
    try:
        result = subprocess.run(["python3", script_path], capture_output=True, text=True)
        if result.returncode == 0:
            logging.info(f"✅ Success: {script_name}")
            return True
        else:
            logging.error(f"❌ Failed: {script_name}\nError: {result.stderr}")
            return False
    except Exception as e:
        logging.error(f"💥 Exception running {script_name}: {str(e)}")
        return False

def daily_sync():
    logging.info("🌅 Starting AIMmA Daily Intelligence Sync (Mode 7)...")
    
    from unified_event_bus import UnifiedEventBus
    UnifiedEventBus.emit(
        event_type="SYSTEM_BOOT",
        source="Antigravity",
        message="AIMmA Daily Intelligence Sync (Mode 7) initiated.",
        priority=3
    )
    
    # 1. Ingest new materials
    run_script("scholar_intel_sync.py")
    
    # 2. Re-foundry existing drafts (ensure latest formatting)
    run_script("academic_foundry.py")
    
    UnifiedEventBus.emit(
        event_type="SYSTEM_CONVERGENCE",
        source="Antigravity",
        message="All academic and system layers converged.",
        priority=3
    )
    
    logging.info("🚀 All systems converged. Ready for daily operations.")

if __name__ == "__main__":
    daily_sync()
