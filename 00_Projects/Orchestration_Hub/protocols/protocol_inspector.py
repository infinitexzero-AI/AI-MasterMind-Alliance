#!/usr/bin/env python3
"""
Antigravity Protocol Inspector
------------------------------
Bridges the JSON storage contract with shell scripts and agents.
Usage:
  ./protocol_inspector.py --action check_health
  ./protocol_inspector.py --action get_patterns --class rebuildable
  ./protocol_inspector.py --action update_audit --agent system_cleanup.sh
"""

import json
import os
import sys
import argparse
import shutil
from datetime import datetime

PROTOCOL_PATH = "/Users/infinite27/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/storage_protocol.json"

def load_protocol():
    with open(PROTOCOL_PATH, 'r') as f:
        return json.load(f)

def save_protocol(data):
    with open(PROTOCOL_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def check_health(data, mount_point="/"):
    # Get thresholds
    health_cfg = data['health']['ssd_hot']
    yellow_pct = health_cfg['yellow_percent']
    red_pct = health_cfg['red_percent']
    min_safe_gb = health_cfg.get('min_safe_gb', 15)

    # Get Disk Usage
    try:
        total, used, free = shutil.disk_usage(mount_point)
    except FileNotFoundError:
        print(json.dumps({"error": f"Mount point {mount_point} not found"}))
        sys.exit(1)
    
    # Convert to GB
    free_gb = free / (1024**3)
    total_gb = total / (1024**3)
    free_pct = (free / total) * 100

    status = "GREEN"
    exit_code = 0
    details = f"Free: {free_gb:.2f}GB ({free_pct:.1f}%)"

    if free_pct < red_pct or free_gb < min_safe_gb:
        status = "RED"
        exit_code = 2
    elif free_pct < yellow_pct:
        status = "YELLOW"
        exit_code = 1
    
    print(json.dumps({
        "status": status,
        "free_gb": round(free_gb, 2),
        "free_pct": round(free_pct, 1),
        "thresholds": {
            "yellow_pct": yellow_pct,
            "red_pct": red_pct,
            "min_safe_gb": min_safe_gb
        }
    }))
    sys.exit(exit_code)

def get_patterns(data, class_name):
    patterns = data['path_patterns'].get(class_name, [])
    # Return as space-separated string for easy shell loop or array
    print(" ".join(patterns))

def update_audit(data, agent_name):
    now = datetime.now().isoformat()
    if 'audit' not in data:
        data['audit'] = {}
    
    data['audit']['last_enforced'] = now
    data['audit']['last_enforced_by'] = agent_name
    save_protocol(data)
    print(f"Audit log updated: {now} by {agent_name}")

def generate_snapshot(data, mount_point="/"):
    # Protocol Metadata
    proto_name = data.get("protocol", "Antigravity_Storage")
    proto_ver = data.get("version", "1.0.0")

    # Get Health Status
    health_cfg = data['health']['ssd_hot']
    min_safe_gb = health_cfg.get('min_safe_gb', 15)
    
    try:
        total, used, free = shutil.disk_usage(mount_point)
    except FileNotFoundError:
        print(f"Error: Mount point {mount_point} not found.")
        return

    free_gb = free / (1024**3)
    free_pct = (free / total) * 100

    if free_pct < health_cfg['red_percent'] or free_gb < min_safe_gb:
        status_icon = "🔴"
        status_text = "RED"
    elif free_pct < health_cfg['yellow_percent']:
        status_icon = "🟡"
        status_text = "YELLOW"
    else:
        status_icon = "🟢"
        status_text = "GREEN"

    # Get Audit Info
    audit = data.get('audit', {})
    last_run = audit.get('last_enforced', 'Never')
    last_by = audit.get('last_enforced_by', 'N/A')

    # Generate Markdown
    md = f"""# Storage Health Snapshot
**Protocol:** {proto_name} ({proto_ver})
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Target:** `{mount_point}`
**Status:** {status_icon} **{status_text}** (Free: {free_gb:.2f} GB, {free_pct:.1f}%)

## Protocol State
- **Active Profile:** `ssd_hot` (`~/Projects/ACTIVE`)
- **Retention Policy:** Archive > 30 days, Delete Rebuildable > 7 days.
- **Last Enforcement:** {last_run} (by `{last_by}`)

## Immediate Actions
"""
    if status_text == "RED":
        md += "- [ ] **CRITICAL:** Immediate offload required. Active development blocked.\n"
        md += "- [ ] Check `large_static` candidates for move to LaCie.\n"
    elif status_text == "YELLOW":
        md += "- [ ] **WARNING:** Plan offload of `ssd_cool` projects.\n"
    else:
        md += "- [x] System Nominal. No action required.\n"

    print(md)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--action", required=True, choices=['check_health', 'get_patterns', 'update_audit', 'snapshot'])
    parser.add_argument("--class-name", help="Class name for get_patterns (e.g., rebuildable)")
    parser.add_argument("--agent", help="Agent name for audit logging")
    parser.add_argument("--mount", default="/", help="Mount point to check (default: /)")
    
    args = parser.parse_args()
    
    try:
        data = load_protocol()
    except Exception as e:
        print(f"Error loading protocol: {e}")
        sys.exit(1)

    if args.action == "check_health":
        check_health(data, args.mount)
    elif args.action == "get_patterns":
        if not args.class_name:
            print("Error: --class-name required for get_patterns")
            sys.exit(1)
        get_patterns(data, args.class_name)
    elif args.action == "update_audit":
        if not args.agent:
            print("Error: --agent required for update_audit")
            sys.exit(1)
        update_audit(data, args.agent)
    elif args.action == "snapshot":
        generate_snapshot(data, args.mount)
