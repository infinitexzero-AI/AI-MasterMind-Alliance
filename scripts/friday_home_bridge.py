import json
import sys
from datetime import datetime

class FridayHomeBridge:
    def __init__(self):
        self.log_file = "/Users/infinite27/AILCC_PRIME/logs/home_bridge.log"

    def set_environment_scene(self, state):
        scenes = {
            "PEAK": {"lights": "Cold White 100%", "mode": "Performance", "color": "#00FFFF"},
            "FOCUS": {"lights": "Neutral White 80%", "mode": "Deep Work", "color": "#818CF8"},
            "RECOVERY": {"lights": "Warm Amber 40%", "mode": "Restorative", "color": "#FBBF24"},
            "CRITICAL": {"lights": "Crimson Dim 20%", "mode": "Forced Rest", "color": "#EF4444"}
        }

        scene = scenes.get(state, scenes["FOCUS"])
        
        log_entry = f"[{datetime.now().isoformat()}] 🏠 [HOME-BRIDGE] Setting Scene: {state} | {scene['lights']} | Mode: {scene['mode']}\n"
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry)
            
        print(log_entry.strip())
        return scene

if __name__ == "__main__":
    bridge = FridayHomeBridge()
    if len(sys.argv) > 1:
        bridge.set_environment_scene(sys.argv[1].upper())
    else:
        print("🏠 Friday Home Bridge Active. Usage: python friday_home_bridge.py [STATE]")
