import requests
import json
import time

RELAY_URL = "http://localhost:5005/api/chrome/research"
MOODLE_DASHBOARD = "https://moodle.mta.ca/my/"

def trigger_moodle_sidecart():
    print(f"🚀 [Moodle Side-Cart] Engaging Comet Playwright Relay against {MOODLE_DASHBOARD}...")
    payload = {
        "url": MOODLE_DASHBOARD,
        "extractionGoal": "Extract all active assignments, upcoming deadlines, and recent course announcements specifically for HLTH1011 and GENS2101."
    }
    print("⏳ Waiting for Comet Browser extension to physically index the DOM...")
    try:
        response = requests.post(RELAY_URL, json=payload, timeout=90)
        if response.status_code == 200:
            data = response.json()
            vault_path = data.get("vaultPath")
            print(f"✅ [Moodle Side-Cart] Extraction Complete!")
            print(f"💾 Ingested to AILCC Vault: {vault_path}")
            print("🧠 The assignment arrays are now localized in the Neural Synapse.")
        else:
            print(f"❌ [Moodle Side-Cart] Relay rejected request: {response.text}")
    except Exception as e:
        print(f"❌ [Moodle Side-Cart] Connection to Master Relay failed. Is the Comet extension active on port 3333? Error: {e}")

if __name__ == "__main__":
    trigger_moodle_sidecart()
