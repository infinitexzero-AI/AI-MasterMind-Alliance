#!/usr/bin/env python3
"""
the_conductor_daemon.py — Routine Generation Engine (Sovereign Module)
======================================================================
"The Conductor" is the Mastermind OS constraint-based scheduling engine.
It accepts inputs: [Energy Level], [Hours Available], [Financial Constraint].
It then pulls all pending tasks from the OmniTracker (Scholar, Tycoon, Sovereign),
prioritizes them using an algorithmic constraint solver, and outputs a 
non-negotiable daily schedule timeline.

It generates an `.ics` calendar file to bi-sync with Apple/Google Calendar,
pushing the routine directly to the user's phone.

Usage:
    python3 the_conductor_daemon.py --generate --energy HIGH --hours 8
    python3 the_conductor_daemon.py --status
"""

import os
import json
import logging
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timedelta

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [TheConductor] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
CONDUCTOR_DIR   = HIPPOCAMPUS_DIR / "calendar_matrix"
ICS_EXPORT_PATH = CONDUCTOR_DIR / "mastermind_routine.ics"
ROUTINE_JSON    = CONDUCTOR_DIR / "daily_routine.json"
HEALTH_JSON_PATH = HIPPOCAMPUS_DIR / "bio_state.json"

# Urgency weights for sorting
URGENCY_WEIGHTS = {"CRITICAL": 100, "HIGH": 50, "ROUTINE": 10, "LOW": 1}

# Task Cost Estimation (hours needed per task type, roughly)
TASK_COSTS = {
    "SCHOLAR": 2.0,
    "TYCOON": 1.5,
    "SOVEREIGN": 1.0,
    "DEFAULT": 1.0
}


def load_omni_tasks() -> list:
    """Load real tasks from scholar_data.json and biological state."""
    logger.info("Ingesting tasks from OmniTracker (scholar_data.json)...")
    SCHOLAR_DATA = Path("/Users/infinite27/AILCC_PRIME/06_System/State/scholar_data.json")
    
    tasks = []
    if SCHOLAR_DATA.exists():
        try:
            data = json.loads(SCHOLAR_DATA.read_text())
            # Convert courses/missions to tasks
            for mission in data.get("missions", []):
                if mission.get("status") != "COMPLETED":
                    tasks.append({
                        "id": mission.get("id", "M1"),
                        "title": f"Complete {mission.get('mission', 'Research')}",
                        "domain": "SCHOLAR",
                        "urgency": "HIGH" if "Exam" in mission.get("mission", "") else "ROUTINE"
                    })
        except Exception as e:
            logger.error(f"Failed to parse scholar_data: {e}")

    # Phase 141 (Task 1): Inject WEF 2025 Winning Biological Habits
    tasks.extend([
        {"id": "HABIT_1", "title": "Wake Up Early (06:00 AM) & Plan Day", "domain": "SOVEREIGN", "urgency": "CRITICAL"},
        {"id": "HABIT_2", "title": "Gratitude/Reflection Journaling", "domain": "SOVEREIGN", "urgency": "HIGH"},
        {"id": "HABIT_3", "title": "Physical Exercise (Running/Weights/Yoga)", "domain": "SOVEREIGN", "urgency": "CRITICAL"},
        {"id": "HABIT_4", "title": "15-25 Min Mindfulness Meditation", "domain": "SOVEREIGN", "urgency": "HIGH"},
        {"id": "HABIT_5", "title": "Deep Reading (Scholar Node Array)", "domain": "SCHOLAR", "urgency": "HIGH"},
        {"id": "HABIT_6", "title": "Academic & Creative Writing", "domain": "SCHOLAR", "urgency": "HIGH"},
    ])
    
    # Phase 142 (Task 3): Homeostatic VTA Override
    bio_dir = Path(os.path.expanduser("~")) / "AILCC_PRIME/hippocampus_storage/bio_data"
    pfc_score = 100
    vta_score = 0
    try:
        if bio_dir.exists():
            import glob
            files = glob.glob(str(bio_dir / "wef_metrics_*.json"))
            if files:
                latest_bio = max(files, key=os.path.getmtime)
                with open(latest_bio, 'r') as f:
                    metrics = json.load(f).get("metrics", {})
                    vta_score = metrics.get('vta_sensitization', 0)
                    pfc_score = metrics.get('pfc_executive_control', 100)
    except Exception as e:
        logger.error(f"Failed to scan biometric constraints: {e}")
        
    if vta_score > 70 or pfc_score < 40:
        logger.warning(f"🚨 MALADAPTIVE NEUROPLASTICITY DETECTED (VTA: {vta_score} | PFC: {pfc_score}). Forcing Homeostatic Override.")
        tasks.append({"id": "DETOX_1", "title": "Dopamine Detox: Extended 45-Min Meditation", "domain": "SOVEREIGN", "urgency": "MAX"})
        tasks.append({"id": "DETOX_2", "title": "Dopamine Detox: Absolute Cold Exposure", "domain": "SOVEREIGN", "urgency": "MAX"})
        # Filter out low urgencies to force absolute mental recovery
        tasks = [t for t in tasks if t["domain"] == "SOVEREIGN" or t["urgency"] in ("HIGH", "CRITICAL", "MAX")]
    
    return tasks


def optimize_schedule(tasks: list, energy: str, hours: float) -> list:
    """Constraint solver for daily routine generation."""
    # 1. Filter out high-cognitive tasks if energy is LOW
    if energy.upper() == "LOW":
        tasks = [t for t in tasks if not (t["domain"] == "SCHOLAR" and t["urgency"] == "ROUTINE")]
        logger.info("Low Energy mode: filtering out routine deep-work.")

    # 2. Sort by Urgency Weight (highest first)
    tasks.sort(key=lambda x: URGENCY_WEIGHTS.get(x["urgency"], 0), reverse=True)

    schedule = []
    time_used = 0.0

    # 3. Greedy packing based on available hours
    start_time = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    if start_time < datetime.now(): 
        # Start from next top-of-hour if it's already past 9am
        start_time = datetime.now().replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

    current_slot = start_time

    for task in tasks:
        cost = TASK_COSTS.get(task["domain"], TASK_COSTS["DEFAULT"])
        
        # If adding this task exceeds available hours, skip it
        if time_used + cost > hours:
            continue

        end_slot = current_slot + timedelta(hours=cost)
        
        schedule.append({
            "task_id": task["id"],
            "title": task["title"],
            "domain": task["domain"],
            "start": current_slot.isoformat(),
            "end": end_slot.isoformat(),
            "duration_hrs": cost
        })

        time_used += cost
        # Add 15 min buffer between tasks
        current_slot = end_slot + timedelta(minutes=15)

    return schedule

def get_biological_context() -> dict:
    """Read the latest biological state ingested from Apple Health."""
    if HEALTH_JSON_PATH.exists():
        try:
            data = json.loads(HEALTH_JSON_PATH.read_text())
            readiness = data.get("metrics", {}).get("readiness_score", 100)
            bio_state = "COMPROMISED" if readiness < 40 else "OPTIMAL"
            return {"bio_state": bio_state, "recovery_score": readiness}
        except Exception as e:
            logger.warning(f"Could not read biological context: {e}")
    return {"bio_state": "OPTIMAL", "recovery_score": 100}


def generate_ics_file(schedule: list):
    """Generate an iCalendar (.ics) file for Apple/Google Calendar Bi-Sync."""
    os.makedirs(CONDUCTOR_DIR, exist_ok=True)

    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Mastermind OS//The Conductor//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]

    for item in schedule:
        dtstart = datetime.fromisoformat(item["start"]).strftime("%Y%m%dT%H%M%S")
        dtend   = datetime.fromisoformat(item["end"]).strftime("%Y%m%dT%H%M%S")
        now     = datetime.now().strftime("%Y%m%dT%H%M%S")

        ics_lines.extend([
            "BEGIN:VEVENT",
            f"DTSTAMP:{now}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"SUMMARY:[{item['domain']}] {item['title']}",
            f"UID:mastermind-os-{item['task_id']}@ailcc",
            "DESCRIPTION:Auto-scheduled by The Conductor (Vanguard Swarm)\\nNon-negotiable.",
            "BEGIN:VALARM",
            "TRIGGER:-PT10M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Reminder",
            "END:VALARM",
            "END:VEVENT"
        ])

    ics_lines.append("END:VCALENDAR")

    ICS_EXPORT_PATH.write_text("\\n".join(ics_lines))
    ROUTINE_JSON.write_text(json.dumps({
        "generated_at": datetime.now().isoformat(),
        "schedule": schedule
    }, indent=2))
    
    logger.info(f"✅ Routine synced to {ICS_EXPORT_PATH.name}")


def print_status():
    if not ROUTINE_JSON.exists():
        print("\\n📊 The Conductor: No routine scheduled yet. Run --generate.\\n")
        return
    
    data = json.loads(ROUTINE_JSON.read_text())
    print("\\n🎼 The Conductor (Routine Generation Engine)")
    print(f"   Generated  : {data.get('generated_at')[:16].replace('T', ' ')}")
    print(f"   Export     : {ICS_EXPORT_PATH}")
    
    print("\\n   🗓️ Today's Non-Negotiable Timeline:")
    for item in data.get("schedule", []):
        st = datetime.fromisoformat(item['start']).strftime("%I:%M %p")
        en = datetime.fromisoformat(item['end']).strftime("%I:%M %p")
        print(f"   {st} - {en} | [{item['domain']:<9}] {item['title']}")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="The Conductor — Constraint-Based Scheduling")
    parser.add_argument("--generate", action="store_true", help="Generate today's routine")
    parser.add_argument("--energy", type=str, default="HIGH", choices=["HIGH", "MED", "LOW"], help="Current Energy Level")
    parser.add_argument("--hours", type=float, default=8.0, help="Hours available for scheduling")
    parser.add_argument("--status", action="store_true", help="View current schedule")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.generate:
        # 1. First, invoke the Scraper Daemon autonomously
        logger.info("🚀 Engaging Autonomous Institutional Scraper Daemon before scheduling...")
        try:
            scraper_script = Path(__file__).parent / "institutional_scraper_daemon.py"
            subprocess.run(["python3", str(scraper_script), "--run"], check=True, capture_output=True)
            logger.info("✅ Institutional matrix hydration complete. Matrix fresh.")
        except subprocess.CalledProcessError as e:
            logger.error(f"⚠️ Scraper execution failed (Exit {e.returncode}). Check logs. Falling back to stale matrix.")
        except Exception as e:
            logger.error(f"⚠️ Failed to launch scraper logic: {e}. Falling back to stale matrix.")

        # 1.5 Sync biological state before scheduling
        logger.info("🧬 Engaging Bio-Telemetry Daemon to process Apple Health data...")
        try:
            bio_script = Path(__file__).parent / "bio_telemetry_daemon.py"
            subprocess.run(["python3", str(bio_script), "--sweep"], check=True, capture_output=True)
            logger.info("✅ Biometric state updated.")
        except subprocess.CalledProcessError as e:
            logger.error(f"⚠️ Bio-Telemetry sweep failed (Exit {e.returncode}). Using cached state.")
        except Exception as e:
            logger.error(f"⚠️ Failed to launch Bio-Telemetry daemon: {e}. Using cached state.")
            
        # 1.7 Task 23 Override: Trigger 7-Day Pre-Cognition Synthesis
        logger.info("🧠 Engaging Autonomous Deep-Dive Pre-Cognition Array...")
        try:
            deep_dive_script = Path(__file__).parent / "moodle_deep_dive.py"
            subprocess.run(["python3", str(deep_dive_script)], check=True, capture_output=True)
            logger.info("✅ Institutional Deep-Dive synthesis executed successfully.")
        except Exception as e:
            logger.error(f"⚠️ Pre-Cognition Array Failed: {e}")
            
        # 2. Dynamically ingest biological constraints
        bio = get_biological_context()
        energy_level = args.energy
        hours_avail = args.hours

        if bio["bio_state"] == "COMPROMISED" or bio["recovery_score"] < 40:
            logger.warning(f"⚠️ Biological State is COMPROMISED (Recovery: {bio['recovery_score']}%)")
            logger.warning("Auto-lowering energy constraint to LOW and capping work to 4 hours.")
            energy_level = "LOW"
            hours_avail = 4.0

        logger.info(f"⚙️ Running Conductor. Constraints: Energy={energy_level}, Hours={hours_avail}")
        tasks = load_omni_tasks()
        schedule = optimize_schedule(tasks, energy=energy_level, hours=hours_avail)
        generate_ics_file(schedule)
        print_status()
    else:
        print_status()
