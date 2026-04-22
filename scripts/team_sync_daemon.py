#!/usr/bin/env python3
import os
import json
import requests
import time
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Import the existing Linear integration logically
import sys
from pathlib import Path

# Add multiple potential paths for integrations
script_dir = Path(__file__).parent.resolve()
potential_paths = [
    script_dir.parent / "01_Areas/Codebases/ailcc/automations/integrations",
    Path("/Volumes/XDriveBeta/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/integrations")
]

for p in potential_paths:
    if p.exists():
        sys.path.append(str(p))

try:
    import linear_integration as linear
except ImportError:
    print("❌ Critical: linear_integration.py not found in path.")
    sys.exit(1)

# --- Configuration ---
RELAY_URL = os.getenv("RELAY_URL", "http://localhost:3001/api/system/tasks")
BRIEFING_PATH = Path("/Volumes/XDriveBeta/AILCC_PRIME/06_System/State/team_briefing.md")
CHECK_INTERVAL = 300  # 5 minutes

def detect_input_gap(issue):
    """
    Logic to detect if a task is 'Blocking' the AI and needs Human Input.
    Mimics 'Next Highest Level Input' detection from advanced agentic frameworks.
    """
    title = issue.get('title', '').upper()
    desc = issue.get('description', '') or ''
    state = issue.get('state', {}).get('name', '').upper()
    
    # Trigger 1: Explicit labels or keywords
    labels = [l.get('name', '').upper() for l in issue.get('labels', {}).get('nodes', [])]
    if "NEEDS_INPUT" in labels or "BLOCKED" in labels or "AWAITING_PRIME" in labels:
        return "Explicitly flagged in Linear for Prime intervention."
    
    # Trigger 2: High priority but ambiguous description
    priority = issue.get('priority', 0)
    if priority >= 2 and len(desc) < 10:
        return "High priority project but missing tactical constraints. Please define objective."
    
    # Trigger 3: Transition state
    if state == "TRIAGED" or state == "BACKLOG":
        if "research" in title:
           return "Awaiting context on research scope or specific sources."
           
    return None

def sync_to_relay(tasks):
    """Push local-mapped tasks to the Persistent Neural Bus."""
    print(f"📡 Syncing {len(tasks)} tasks to Sovereign Relay...")
    success_count = 0
    for task in tasks:
        try:
            res = requests.post(RELAY_URL, json=task, timeout=5)
            if res.status_code == 200:
                success_count += 1
        except Exception as e:
            print(f"⚠️ Failed to sync task {task['id']}: {e}")
    print(f"✅ Sync complete. {success_count}/{len(tasks)} records updated.")

def generate_briefing(tasks):
    """Synthesizes the 'Next Highest Level Human Input Needed' report."""
    needs_input = [t for t in tasks if t['status'] == 'awaiting_input']
    
    lines = [
        "# Sovereign Command Briefing",
        f"**Timestamp**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "\n## 🚨 Next Highest Level Inputs Needed",
        "The following blocks require your strategic intervention to resume swarm autonomy:\n"
    ]
    
    if not needs_input:
        lines.append("- ✅ **Swarm Clear**: No immediate strategic blocks detected. En-Route on all primary objectives.")
    else:
        for t in needs_input:
            lines.append(f"- **[{t['agent_owner']}] {t['title']}**")
            lines.append(f"  - ⚡ *Lever: {t['next_leveraged_input']}*")
            lines.append(f"  - [Link]({t.get('external_url', '#')})")
    
    lines.append("\n## 🎼 Pulse Summary")
    status_counts = {}
    for t in tasks:
        status_counts[t['status']] = status_counts.get(t['status'], 0) + 1
    
    for status, count in status_counts.items():
        lines.append(f"- {status.upper().replace('_', ' ')}: {count}")

    BRIEFING_PATH.write_text("\n".join(lines))
    print(f"📝 Briefing updated: {BRIEFING_PATH}")

def run_sync():
    print(f"🚀 [Team Sync] Initializing Sovereign Bridge...")
    
    while True:
        try:
            # 1. Pull from Linear
            print("🔍 Fetching from Linear AI Mastermind Alliance...")
            linear_data = linear.get_team_issues()
            if not linear_data or 'data' not in linear_data:
                print("⚠️ Linear data unavailable. Retrying...")
                time.sleep(30)
                continue
                
            issues = linear_data['data'].get('team', {}).get('issues', {}).get('nodes', [])
            
            # 2. Map to Sovereign Schema
            mapped_tasks = []
            for issue in issues:
                input_needed = detect_input_gap(issue)
                
                status_map = {
                    "DONE": "complete",
                    "COMPLETED": "complete",
                    "IN_PROGRESS": "enroute",
                    "STARTED": "enroute",
                    "TRIAGED": "yet_to_begin",
                    "BACKLOG": "yet_to_begin",
                    "CANCELED": "complete"
                }
                
                state_name = issue.get('state', {}).get('name', '').upper()
                mapped_status = status_map.get(state_name, "yet_to_begin")
                if input_needed:
                    mapped_status = "awaiting_input"

                task = {
                    "id": f"linear_{issue['id']}",
                    "external_id": issue['id'],
                    "title": issue['title'],
                    "description": issue.get('description', ''),
                    "status": mapped_status,
                    "assignee": issue.get('assignee', {}).get('name', 'unassigned') if issue.get('assignee') else 'unassigned',
                    "priority": ["none", "low", "medium", "high", "urgent"][issue.get('priority', 0)],
                    "next_leveraged_input": input_needed,
                    "agent_owner": "Linear/Alliance",
                    "external_url": issue.get('url')
                }
                mapped_tasks.append(task)
            
            # 3. Persistence & Briefing
            sync_to_relay(mapped_tasks)
            generate_briefing(mapped_tasks)
            
        except Exception as e:
            print(f"❌ Critical Failure in Sync Loop: {e}")
            
        print(f"💤 Sleeping for {CHECK_INTERVAL}s...")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_sync()
