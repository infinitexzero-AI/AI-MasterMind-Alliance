import os
import json
import requests
import datetime
import logging

# Configure Logging
log_file = "06_System/Logs/airtable_sync.log"
os.makedirs(os.path.dirname(log_file), exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("AirtableSync")

# Configuration (Load from Env)
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = "Mission Manifest"

ROADMAP_PATH = "01_Areas/Codebases/ailcc/dashboard/server/data/mission_roadmap.json"

def sync_to_airtable():
    logger.info("📡 Initiating Airtable Synchronization...")
    
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        logger.warning("⚠️ AIRTABLE credentials missing. Running in DRY-RUN mode.")
        dry_run = True
    else:
        dry_run = False

    # 1. Load Roadmap
    if not os.path.exists(ROADMAP_PATH):
        logger.error(f"Roadmap file missing at {ROADMAP_PATH}")
        return

    with open(ROADMAP_PATH, 'r') as f:
        data = json.load(f)

    progression = data.get("progression", 0)
    
    # 2. Prepare Payload
    payload = {
        "fields": {
            "Mission": "The Universal Handshake",
            "Status": "ACTIVE",
            "Progression": progression,
            "Last Sync": datetime.datetime.now().isoformat(),
            "System Context": "macOS - AILCC Prime"
        }
    }

    if dry_run:
        logger.info(f"DRY-RUN Payload: {json.dumps(payload, indent=2)}")
        logger.info("✓ Airtable Sync (Simulated) Complete.")
        return

    # 3. Push to Airtable
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        # Note: This is an UPSERT simulation. We'd normally use a specific record ID.
        # For this prototype, we're just creating a new log record of the state.
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logger.info("✅ Airtable Sync Successful.")
    except Exception as e:
        logger.error(f"Airtable Sync Failed: {e}")

if __name__ == "__main__":
    sync_to_airtable()
