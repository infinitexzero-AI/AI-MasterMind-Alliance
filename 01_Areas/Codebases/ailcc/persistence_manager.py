import json
import os
from datetime import datetime

STATE_DIR = "/Users/infinite27/AILCC_PRIME/06_System/State"
CONFIG_PATH = "/Users/infinite27/AILCC_PRIME/antigravity_config.json"

class PersistenceManager:
    @staticmethod
    def save_state(name, data, backup=True):
        path = os.path.join(STATE_DIR, f"{name}.json")
        data['last_persisted'] = datetime.now().isoformat()
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"💾 State saved: {name}")
        
        if backup:
            PersistenceManager.backup_to_cloud(name, data)

    @staticmethod
    def backup_to_cloud(name, data):
        # Optimized for Jan 2026: Syncing to iCloud/Vault
        cloud_path = f"/Users/infinite27/Library/Mobile Documents/com~apple~CloudDocs/AI_Mastermind/State/{name}.json"
        try:
            os.makedirs(os.path.dirname(cloud_path), exist_ok=True)
            with open(cloud_path, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"☁️ Cloud backup synced: {name}")
        except Exception as e:
            print(f"⚠️ Cloud sync failed: {e}")

    @staticmethod
    def update_config(updates):
        with open(CONFIG_PATH, 'r+') as f:
            config = json.load(f)
            # Deep update logic could go here
            for key, value in updates.items():
                if isinstance(value, dict) and key in config:
                    config[key].update(value)
                else:
                    config[key] = value
            f.seek(0)
            json.dump(config, f, indent=2)
            f.truncate()
        print("⚙️ Configuration updated and saved.")

if __name__ == "__main__":
    # Test
    PersistenceManager.save_state("test_persistence", {"status": "ok"})
