import json
import os
from datetime import datetime

STATE_DIR = "/Users/infinite27/AILCC_PRIME/06_System/State"
CONFIG_PATH = "/Users/infinite27/AILCC_PRIME/antigravity_config.json"

class PersistenceManager:
    @staticmethod
    def save_state(name, data):
        path = os.path.join(STATE_DIR, f"{name}.json")
        data['last_persisted'] = datetime.now().isoformat()
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"💾 State saved: {name}")

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
