import subprocess
import os

ROOT = "/Users/infinite27/AILCC_PRIME"
CRON_COMMENT_START = "# --- AILCC SCHEDULE START ---"
CRON_COMMENT_END = "# --- AILCC SCHEDULE END ---"

JOBS = [
    # 🌅 Morning Pulse: Daily Sync & Briefing Prep (8:00 AM)
    "0 8 * * * python3 /Users/infinite27/AILCC_PRIME/06_System/Execution/daily_intelligence_sync.py",
    
    # 🌙 Evening Reflection: Reminder Notification (9:00 PM)
    "0 21 * * * osascript -e 'display notification \"Time for AIMmA Evening Reflection\" with title \"AILCC Nexus\"'",
    
    # 🛡️ Weekly Sentinel: Sunday Maintenance (11:59 PM)
    "59 23 * * 0 /bin/bash /Users/infinite27/AILCC_PRIME/06_System/Execution/system_sentinel.sh"
]

def get_current_crontab():
    try:
        return subprocess.check_output(['crontab', '-l'], stderr=subprocess.STDOUT).decode()
    except subprocess.CalledProcessError:
        return ""

def update_crontab(new_content):
    with subprocess.Popen(['crontab', '-'], stdin=subprocess.PIPE) as proc:
        proc.communicate(input=new_content.encode())

def setup_schedule():
    current = get_current_crontab()
    
    # Filter out existing AILCC block if present
    lines = current.splitlines()
    new_lines = []
    in_block = False
    for line in lines:
        if line.strip() == CRON_COMMENT_START:
            in_block = True
            continue
        if line.strip() == CRON_COMMENT_END:
            in_block = False
            continue
        if not in_block:
            new_lines.append(line)
            
    # Add new block
    print("⏳ Synchronizing AILCC Schedules...")
    final_lines = new_lines + ["", CRON_COMMENT_START] + JOBS + [CRON_COMMENT_END, ""]
    
    update_crontab("\n".join(final_lines))
    print("✅ Crontab updated successfully.")
    print("📋 Active AILCC Jobs:")
    for job in JOBS:
        print(f"   - {job}")

if __name__ == "__main__":
    setup_schedule()
