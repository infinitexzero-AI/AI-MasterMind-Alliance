#!/usr/bin/env python3
"""
Daily Nudge Notification System
Sends macOS native notifications at key times to maintain daily consistency.

Usage:
  python3 daily_nudge.py morning   # 8:00 AM nudge
  python3 daily_nudge.py midday    # 1:00 PM nudge
  python3 daily_nudge.py evening   # 9:00 PM nudge
  python3 daily_nudge.py install   # Install launchd schedules
"""

import sys, os, json, subprocess
from datetime import datetime
from pathlib import Path

VAULT = Path("/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault")
DAILY_FILE = VAULT / "daily_entries.json"

NUDGES = {
    "morning": {
        "title": "☀️ Morning Plan",
        "message": "What's your #1 task today? Open Daily System to set your intention.",
        "sound": "Glass",
    },
    "midday": {
        "title": "⚡ Energy Check",
        "message": "How's your energy? Adjust your load. Protect your focus blocks.",
        "sound": "Purr",
    },
    "evening": {
        "title": "🌙 Evening Reflect",
        "message": "3-min reflection: What did you win today? Complete your shutdown ritual.",
        "sound": "Heroine",
    },
}

def notify(title, message, sound="Glass"):
    subprocess.run([
        "osascript", "-e",
        f'display notification "{message}" with title "{title}" sound name "{sound}"'
    ])

def get_streak():
    if not DAILY_FILE.exists():
        return 0
    try:
        data = json.loads(DAILY_FILE.read_text())
        entries = data.get("entries", {})
        streak = 0
        today = datetime.now()
        for i in range(365):
            d = today.replace(hour=0, minute=0, second=0)
            from datetime import timedelta
            d = d - timedelta(days=i)
            key = d.strftime("%Y-%m-%d")
            entry = entries.get(key, {})
            if entry.get("topTask") or entry.get("shutdownComplete"):
                streak += 1
            elif i > 0:
                break
        return streak
    except:
        return 0

def send_nudge(nudge_type):
    if nudge_type not in NUDGES:
        print(f"Unknown nudge type: {nudge_type}")
        return
    
    nudge = NUDGES[nudge_type]
    streak = get_streak()
    
    message = nudge["message"]
    if streak > 0:
        message += f" 🔥 {streak}-day streak!"
    
    notify(nudge["title"], message, nudge["sound"])
    print(f"[{datetime.now().strftime('%H:%M')}] Sent {nudge_type} nudge (streak: {streak})")

def install_launchd():
    """Install launchd plists for automated scheduling."""
    plist_dir = Path.home() / "Library" / "LaunchAgents"
    plist_dir.mkdir(exist_ok=True)
    
    schedules = {
        "morning": {"Hour": 8, "Minute": 0},
        "midday": {"Hour": 13, "Minute": 0},
        "evening": {"Hour": 21, "Minute": 0},
    }
    
    script_path = os.path.abspath(__file__)
    
    for name, time in schedules.items():
        label = f"com.ailcc.daily-nudge.{name}"
        plist = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{label}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>{script_path}</string>
        <string>{name}</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>{time['Hour']}</integer>
        <key>Minute</key>
        <integer>{time['Minute']}</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/daily_nudge_{name}.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/daily_nudge_{name}.log</string>
</dict>
</plist>"""
        
        plist_path = plist_dir / f"{label}.plist"
        plist_path.write_text(plist)
        
        # Unload if exists, then load
        subprocess.run(["launchctl", "unload", str(plist_path)], capture_output=True)
        subprocess.run(["launchctl", "load", str(plist_path)])
        print(f"  Installed: {name} nudge at {time['Hour']:02d}:{time['Minute']:02d}")
    
    print("\n  All 3 daily nudges scheduled!")
    print("  They will fire even after restarts.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 daily_nudge.py [morning|midday|evening|install]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "install":
        print("\n  Installing daily nudge schedules...\n")
        install_launchd()
    else:
        send_nudge(cmd)
