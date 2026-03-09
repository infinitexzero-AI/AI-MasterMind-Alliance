import os
import json
import sys
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
HANDOFF_DIR = os.path.join(ROOT, "06_System/AILCC/handoffs/reflection")
SYMBOLS = ["✅", "🚧", "🚀", "🧠"]

def capture_reflection():
    print(f"🌙 AILCC Evening Reflection - {datetime.now().strftime('%Y-%m-%d')}")
    print("-" * 40)
    
    # 1. Pull metrics from Stability Report
    stability_file = os.path.join(ROOT, "06_System/State/stability_report.json")
    vitals_summary = "Metrics unknown."
    if os.path.exists(stability_file):
        with open(stability_file, 'r') as f:
            data = json.load(f)
            vitals_summary = f"RAM: {data.get('ram_mb')}MB | Heat: {data.get('thermal_proxy')}"

    print(f"{SYMBOLS[2]} System Vitals: {vitals_summary}")
    
    # 2. Interactive Capture
    win = input(f"{SYMBOLS[0]} What was your BIGGEST win today? ")
    blocker = input(f"{SYMBOLS[1]} What was the main roadblock? ")
    focus_tomorrow = input(f"{SYMBOLS[3]} Primary focus for tomorrow? ")

    reflection_data = {
        "timestamp": datetime.now().isoformat(),
        "vitals": vitals_summary,
        "win": win,
        "blocker": blocker,
        "focus_tomorrow": focus_tomorrow,
        "phase": "Phase XVI"
    }

    # Save to handoffs for RAG ingestion
    os.makedirs(HANDOFF_DIR, exist_ok=True)
    filename = f"reflection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join(HANDOFF_DIR, filename)
    
    with open(filepath, 'w') as f:
        json.dump(reflection_data, f, indent=2)

    print("-" * 40)
    print(f"✅ Reflection captured and stored in {filename}.")
    print("Goodnight, Commander. All systems standing by.")

if __name__ == "__main__":
    capture_reflection()
