#!/usr/bin/env python3
"""
health_sync_daemon.py — Bio-Sync Ingestion Engine (Sovereign Module)
====================================================================
Parses physical health metrics (Sleep Duration, Recovery Score, Strain)
from JSON/CSV exports (via Apple Health/Whoop).

Deposits a daily `sovereign_health_status.json` into the Hippocampus
to dynamically adjust the Conductor routine.

Usage:
    python3 health_sync_daemon.py --run
    python3 health_sync_daemon.py --mock   (Generate mock bio-data)
"""

import os
import json
import logging
import argparse
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [BioSync] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
SOVEREIGN_REPORTS = HIPPOCAMPUS_DIR / "sovereign_reports"
HEALTH_JSON_PATH = SOVEREIGN_REPORTS / "sovereign_health_status.json"
DOWNLOADS_DIR = Path.home() / "Downloads"
RAW_BIO_FILE = DOWNLOADS_DIR / "apple_health_export_mock.json"

def generate_mock_biodata():
    """Generates a mock Whoop/Apple Health JSON export."""
    mock_data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "sleep_metrics": {
            "hours_slept": 4.5,
            "rem_percentage": 15,
            "deep_sleep_percentage": 10
        },
        "recovery_score": 28,  # Out of 100
        "hrv": 35,
        "resting_heart_rate": 62,
        "strain": 14.2
    }
    RAW_BIO_FILE.write_text(json.dumps(mock_data, indent=2))
    logger.info(f"Created mock bio-sync data at {RAW_BIO_FILE}")

def parse_health_file():
    """Parses the raw JSON to extract actionable biology metrics."""
    if not RAW_BIO_FILE.exists():
        logger.warning(f"No health export found at {RAW_BIO_FILE}")
        return None

    try:
        raw_data = json.loads(RAW_BIO_FILE.read_text())
        
        recovery = raw_data.get("recovery_score", 100)
        hours_slept = raw_data.get("sleep_metrics", {}).get("hours_slept", 8.0)
        
        # Determine biological urgency state
        state = "OPTIMAL"
        if recovery < 30 or hours_slept < 5:
            state = "COMPROMISED"
        elif recovery < 60:
            state = "WARNING"

        cleaned_data = {
            "last_sync": datetime.now().isoformat(),
            "bio_state": state,
            "recovery_score": recovery,
            "hours_slept": hours_slept,
            "hrv": raw_data.get("hrv", 0),
            "strain_accumulated": raw_data.get("strain", 0)
        }
        
        return cleaned_data
    except Exception as e:
        logger.error(f"Error parsing health data: {e}")
        return None

def deposit_health_status(data: dict):
    os.makedirs(SOVEREIGN_REPORTS, exist_ok=True)
    HEALTH_JSON_PATH.write_text(json.dumps(data, indent=2))
    logger.info(f"💾 Bio-Sync state deposited to {HEALTH_JSON_PATH.name} (State: {data['bio_state']})")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="store_true", help="Parse daily health file")
    parser.add_argument("--mock", action="store_true", help="Create a mock low-recovery export")
    args = parser.parse_args()

    if args.mock:
        generate_mock_biodata()
    
    if args.run or args.mock:
        data = parse_health_file()
        if data:
            deposit_health_status(data)
