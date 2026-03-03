#!/usr/bin/env python3
"""Pomodoro study timer with session logging to the Intelligence Vault."""
import time, sys, os, json
from datetime import datetime

VAULT_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault"
LOG_FILE = os.path.join(VAULT_PATH, "study_sessions.jsonl")

def notify(title, message):
    """macOS notification."""
    os.system(f'osascript -e \'display notification "{message}" with title "{title}" sound name "Glass"\'')

def run_timer(minutes, label):
    print(f"\n{'='*40}")
    print(f"  {label}: {minutes} minutes")
    print(f"{'='*40}")
    
    total = minutes * 60
    start = time.time()
    
    try:
        while True:
            elapsed = time.time() - start
            remaining = total - elapsed
            if remaining <= 0:
                break
            mins, secs = divmod(int(remaining), 60)
            print(f"\r  [{mins:02d}:{secs:02d}] remaining", end="", flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        elapsed = time.time() - start
        print(f"\n  Stopped early at {int(elapsed//60)}m {int(elapsed%60)}s")
        return int(elapsed)
    
    print(f"\r  [00:00] DONE!              ")
    notify("OpenClaw Study Timer", f"{label} complete!")
    return int(total)

def log_session(subject, focus_mins, breaks, total_elapsed):
    entry = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M"),
        "subject": subject,
        "focus_minutes": focus_mins,
        "breaks": breaks,
        "total_seconds": total_elapsed,
        "agent": "SCHOLAR"
    }
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
    print(f"\n  Session logged to Intelligence Vault")

def main():
    subject = input("  Subject (e.g. HLTH 1011): ").strip() or "General Study"
    sessions = int(input("  Number of focus blocks (default 4): ").strip() or "4")
    focus = int(input("  Focus length in minutes (default 25): ").strip() or "25")
    short_break = int(input("  Short break in minutes (default 5): ").strip() or "5")
    
    print(f"\n  Plan: {sessions}x {focus}min focus + {short_break}min breaks")
    print(f"  Total: ~{sessions * focus + (sessions-1) * short_break} minutes")
    input("  Press Enter to start...")
    
    total_focus = 0
    total_elapsed = 0
    
    for i in range(sessions):
        elapsed = run_timer(focus, f"Focus Block {i+1}/{sessions} - {subject}")
        total_focus += elapsed // 60
        total_elapsed += elapsed
        
        if i < sessions - 1:
            b = run_timer(short_break, f"Break {i+1}")
            total_elapsed += b
    
    print(f"\n{'='*40}")
    print(f"  SESSION COMPLETE")
    print(f"  Total focus: {total_focus} minutes")
    print(f"  Subject: {subject}")
    print(f"{'='*40}")
    
    log_session(subject, total_focus, sessions - 1, total_elapsed)

if __name__ == "__main__":
    print("\n  OPENCLAW STUDY TIMER")
    print("  Pomodoro with Vault Logging\n")
    main()
