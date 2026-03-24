import os
import json
import time
import requests
from pathlib import Path
from datetime import datetime

ICLOUD_SHORTCUT_PATH = Path(os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Shortcuts/AILCC_Bio_Ingest"))
AILCC_DATA_PATH = Path("/Users/infinite27/AILCC_PRIME/data/bio_pulse.json")
RELAY_URL = "http://127.0.0.1:5005/api/system/telemetry"

def calculate_energy_state(sleep, hrv, rhr):
    if sleep >= 7.5 and hrv > 50 and rhr < 65:
        return "PEAK"
    elif sleep >= 6.0 and hrv > 40:
        return "FOCUS"
    else:
        return "RECOVERY"

def process_health_export():
    export_file = ICLOUD_SHORTCUT_PATH / "health_export.json"
    if not export_file.exists():
        return False
        
    try:
        with open(export_file, 'r') as f:
            raw_data = json.load(f)
            
        sleep = float(raw_data.get("sleep_hours", 7.0))
        hrv = int(raw_data.get("hrv_ms", 45))
        rhr = int(raw_data.get("rhr_bpm", 60))
        
        sleep_score = min(100, int((sleep / 8.0) * 100))
        energy_state = calculate_energy_state(sleep, hrv, rhr)
        
        compiled_data = {
            "timestamp": datetime.now().isoformat(),
            "hrv": hrv,
            "resting_hr": rhr,
            "sleep_score": sleep_score,
            "energy_state": energy_state,
            "score_rationale": f"Calculated autonomously based on {sleep}h sleep, {hrv}ms HRV, and {rhr} RHR."
        }
        
        # Save to dashboard json file (for initial page load)
        os.makedirs(AILCC_DATA_PATH.parent, exist_ok=True)
        with open(AILCC_DATA_PATH, 'w') as f:
            json.dump(compiled_data, f, indent=2)
            
        # Emit to Relay (for instant Socket.io updates)
        payload = {
            "type": "BIO_PULSE",
            "data": compiled_data
        }
        
        try:
            requests.post(RELAY_URL, json=payload, timeout=2)
        except Exception as e:
            print(f"Failed to echo BIO_PULSE to Master Relay: {e}")
            
        print(f"✅ Bio-Pulse Processed: {compiled_data['energy_state']} (HRV {hrv})")
        
        # Acknowledge by renaming
        processed_file = ICLOUD_SHORTCUT_PATH / "health_export_processed.json"
        
        # Remove old processed file if exists
        if processed_file.exists():
            processed_file.unlink()
            
        export_file.rename(processed_file)
        return True
        
    except Exception as e:
        print(f"❌ Error processing health export: {e}")
        return False

if __name__ == "__main__":
    print("🫀 BIOSENSOR DAEMON: Monitoring iCloud for iOS Health Exports...")
    if not ICLOUD_SHORTCUT_PATH.exists():
        print(f"Creating missing iCloud ingest path at {ICLOUD_SHORTCUT_PATH}...")
        os.makedirs(ICLOUD_SHORTCUT_PATH, exist_ok=True)
        
    while True:
        process_health_export()
        time.sleep(15)
