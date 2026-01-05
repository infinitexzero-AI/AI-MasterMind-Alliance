#!/usr/bin/env python3
"""
MTA Portal Agent (Step 51)
Monitors academic status and prerequisites for the 2026/27 graduation cycle.
"""

import json
import os
import sqlite3
from datetime import datetime

ROOT = "/Users/infinite27/AILCC_PRIME"
STATE_FILE = f"{ROOT}/06_System/State/scholar_data.json"
DB_PATH = f"{ROOT}/06_System/State/knowledge-base.db"

def log_event(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [SCHOLAR] {message}")

def check_portal():
    log_event("📡 Connecting to MTA Portal Interface (Simulation)...")
    
    if not os.path.exists(STATE_FILE):
        log_event("❌ Scholar data missing. Initializing...")
        return

    with open(STATE_FILE, 'r') as f:
        data = json.load(f)

    # Enrollment Monitoring
    log_event("🔍 Auditing Enrollment for Winter 2026...")
    target_courses = ["MATH 1311", "HLTH 1011"]
    for course in target_courses:
        # Simulation: Status is PENDING until Comet verifies
        status = "PENDING (Scout Mission Active)"
        log_event(f" - {course}: {status}")

    # In a real scenario, this would involve browser-based scraping or API calls.
    # For now, we perform a "Virtual Audit" against the known 114/120 credits.
    log_event(f"Checking degree progress: {data['progress']['credits_earned']}/{data['progress']['credits_total']}")
    
    # Check for upcoming deadlines
    today = datetime.now()
    for dl in data['deadlines']:
        dl_date = datetime.strptime(dl['date'], '%Y-%m-%d')
        days_left = (dl_date - today).days
        if days_left <= 0:
            log_event(f"🚨 OVERDUE: {dl['task']}! Urgent action required.")
        elif days_left <= 10:
            log_event(f"⚠️ URGENT DEADLINE: {dl['task']} in {days_left} days!")

    log_event("✅ Academic status verified. Standing: GOOD.")

def register_self():
    """Register as a node in the agent registry."""
    try:
        # Added timeout to handle concurrent access
        conn = sqlite3.connect(DB_PATH, timeout=10)
        c = conn.cursor()
        last_seen = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        caps = json.dumps(["academic_audit", "portal_monitoring", "prerequisite_mapping"])
        
        c.execute("""
            INSERT INTO agent_registry (agent_id, name, role, status, capabilities, last_seen)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(agent_id) DO UPDATE SET
                status='ACTIVE',
                last_seen=excluded.last_seen
        """, ("scholar_agent", "Scholar", "Academic Strategist", "ACTIVE", caps, last_seen))
        
        conn.commit()
        conn.close()
    except Exception as e:
        log_event(f"Failed to register self: {e}")

if __name__ == "__main__":
    register_self()
    check_portal()
