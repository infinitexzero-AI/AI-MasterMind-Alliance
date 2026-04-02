#!/usr/bin/env python3
"""
academic_reconciliator_daemon.py — Academic Transcript Reconciliator (Scholar Module)
=====================================================================================
Parses an academic transcript export (CSV format) and mapping it against
a defined Degree Requirements JSON profile.

Calculates:
- Total Credits Completed vs Required
- Cumulative GPA
- Missing Required Courses ("Knowledge Gaps")
- Elective Completion Status

Outputs a 'scholar_progress.json' payload to the Hippocampus, consumed
by the OmniTracker and Dashboards for visualizing degree velocity.

Usage:
    python3 academic_reconciliator_daemon.py --run ~/Downloads/transcript.csv
    python3 academic_reconciliator_daemon.py --status
"""

import os
import csv
import json
import logging
import argparse
import hashlib
from pathlib import Path
from datetime import datetime
from collections import defaultdict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [TranscriptReconciliator] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
SCHOLAR_REPORTS = HIPPOCAMPUS_DIR / "scholar_reports"
PROGRESS_JSON   = SCHOLAR_REPORTS / "academic_progress.json"

# Example Degree Audit Map (In production, this could be an external JSON file)
DEGREE_REQUIREMENTS = {
    "program": "BSc Psychology / Neuroscience",
    "total_credits_required": 120,
    "core_requirements": [
        "PSYC1001", "PSYC1002", "BIOL1001", "BIOL1201",
        "PSYC2001", "PSYC2101", "BIOL2011", "BIOL2811",
        "PSYC3101", "PSYC3131", "PSYC3211", "BIOL3201",
        "PSYC4101", "PSYC4990" # Hon. Thesis
    ],
    "elective_credits_required": {
        "science": 18,
        "arts": 12,
        "open": 30
    }
}

# Letter Grade to Point Mappings (Standard 4.3 Scale)
GRADE_POINTS = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0,
    "PASS": None, "CR": None, "W": None # Non-GPA impacting
}


def parse_transcript(filepath: Path) -> list:
    """Parse generic university transcript CSV."""
    courses = []
    try:
        with open(filepath, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            headers = [h.lower().strip() for h in (reader.fieldnames or [])]
            
            logger.info(f"Detected Headers: {headers[:4]}...")

            for row in reader:
                norm_row = {k.lower().strip(): v.strip() for k, v in row.items() if k}
                
                # Extract fields with common synonyms
                code = norm_row.get("course code", norm_row.get("subject", ""))
                if "course num" in norm_row:
                    code = f"{code}{norm_row['course num']}".replace(" ", "")
                else:
                    code = code.replace(" ", "")

                title = norm_row.get("title", norm_row.get("description", "Unknown Title"))
                grade = norm_row.get("grade", norm_row.get("letter grade", ""))
                credits = norm_row.get("credits", norm_row.get("earned", "0"))

                try:
                    c_float = float(credits)
                except ValueError:
                    c_float = 0.0

                if code and grade:
                    courses.append({
                        "code": code.upper(),
                        "title": title,
                        "grade": grade.upper(),
                        "credits": c_float
                    })

    except Exception as e:
        logger.error(f"Error parsing transcript {filepath.name}: {e}")
    
    return courses


def reconcile_degree(courses: list) -> dict:
    """Compare completed courses against degree requirements."""
    completed_codes = {c["code"]: c for c in courses if c["grade"] not in ("F", "W", "FAIL")}
    
    # 1. GPA calculation
    total_points = 0.0
    gpa_credits = 0.0
    total_earned = sum(c["credits"] for c in completed_codes.values())

    for c in completed_codes.values():
        pts = GRADE_POINTS.get(c["grade"])
        if pts is not None:
            total_points += pts * c["credits"]
            gpa_credits += c["credits"]

    cgpa = round(total_points / gpa_credits, 2) if gpa_credits > 0 else 0.0

    # 2. Core Requirements Match
    core_reqs = set(DEGREE_REQUIREMENTS["core_requirements"])
    completed_cores = core_reqs.intersection(set(completed_codes.keys()))
    missing_cores = list(core_reqs - completed_cores)

    # 3. Simple Elective Estimation (for demo, any non-core is an elective)
    non_core_credits = sum(c["credits"] for code, c in completed_codes.items() if code not in core_reqs)
    total_elective_req = sum(DEGREE_REQUIREMENTS["elective_credits_required"].values())

    # Build Reconciliator Payload
    report = {
        "program": DEGREE_REQUIREMENTS["program"],
        "cumulative_gpa": cgpa,
        "credits": {
            "completed": total_earned,
            "required": DEGREE_REQUIREMENTS["total_credits_required"],
            "progress_pct": round((total_earned / DEGREE_REQUIREMENTS["total_credits_required"]) * 100, 1) if DEGREE_REQUIREMENTS["total_credits_required"] > 0 else 0
        },
        "core_courses": {
            "completed_count": len(completed_cores),
            "required_count": len(core_reqs),
            "missing_gaps": missing_cores
        },
        "electives": {
            "estimated_completed": non_core_credits,
            "total_required": total_elective_req
        },
        "last_reconciled": datetime.now().isoformat()
    }

    return report


def deposit_report(report: dict, filepath: Path):
    os.makedirs(SCHOLAR_REPORTS, exist_ok=True)
    
    PROGRESS_JSON.write_text(json.dumps(report, indent=2))
    logger.info(f"✅ Scholar Progress Reconciled: {cgpa_to_emoji(report['cumulative_gpa'])} {report['cumulative_gpa']} GPA | {report['credits']['progress_pct']}% Degree Complete")
    logger.info(f"💾 Deposited payload to {PROGRESS_JSON.name}")
    
    if report["core_courses"]["missing_gaps"]:
        logger.warning(f"⚠️ Knowledge Gaps Found ({len(report['core_courses']['missing_gaps'])} core missing): {', '.join(report['core_courses']['missing_gaps'][:5])}...")


def cgpa_to_emoji(gpa: float) -> str:
    if gpa >= 4.0: return "🌟"
    if gpa >= 3.7: return "🟢"
    if gpa >= 3.0: return "🟡"
    return "🔴"


def print_status():
    if not PROGRESS_JSON.exists():
        print("\\n📊 Academic Transcript: No data reconciled yet. Run --run [transcript.csv] to integrate.\\n")
        return
    
    try:
        data = json.loads(PROGRESS_JSON.read_text())
        print(f"\\n🎓 Academic Transcript Reconciliator ({data.get('program')})")
        print(f"   Last Reconciled : {data.get('last_reconciled')[:16].replace('T', ' ')}")
        print(f"   Cumulative GPA  : {data.get('cumulative_gpa')} {cgpa_to_emoji(data.get('cumulative_gpa'))}")
        
        pct = data.get('credits', {}).get('progress_pct', 0)
        bar = "█" * int(pct/5) + "░" * (20 - int(pct/5))
        print(f"   Degree Progress : [{bar}] {pct}% ({data['credits']['completed']} / {data['credits']['required']} Cr)")
        
        gaps = data.get('core_courses', {}).get('missing_gaps', [])
        if gaps:
            print(f"   Knowledge Gaps  : {len(gaps)} Core Courses Missing")
            for gap in gaps[:5]:
                print(f"                     - {gap}")
            if len(gaps) > 5:
                print(f"                     ...and {len(gaps)-5} more.")
        else:
            print("   Knowledge Gaps  : None! All Core Requirements Met. 🎉")
        print()
    except Exception as e:
        print(f"Error reading JSON: {e}")

# Generate a mock transcript if none provided for testing
def generate_mock_transcript(filepath: Path):
    csv_data = [
        "Term,Course Code,Course Num,Title,Credits,Grade",
        "Fall 2021,PSYC,1001,Intro Psychology I,3.0,A",
        "Fall 2021,BIOL,1001,Foundations of Biology,3.0,A-",
        "Fall 2021,ENGL,1201,Lit & Comp,3.0,B+",
        "Winter 2022,PSYC,1002,Intro Psychology II,3.0,A+",
        "Winter 2022,BIOL,1201,Cellular Bio,3.0,B",
        "Fall 2022,PSYC,2001,Research Methods,3.0,A",
        "Fall 2022,SOCI,1001,Intro Sociology,3.0,A-",
        "Winter 2023,PSYC,2101,Biopsychology,3.0,B+",
        "Winter 2023,BIOL,2011,Anatomy,3.0,A"
    ]
    filepath.write_text("\\n".join(csv_data))
    logger.info(f"Created mock transcript at {filepath}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Academic Transcript Reconciliator — Scholar Module")
    parser.add_argument("--run", metavar="FILE", help="Parse transcript CSV against Degree Map")
    parser.add_argument("--mock", action="store_true", help="Generate a mock transcript and process it")
    parser.add_argument("--status", action="store_true", help="Show current reconciled degree status")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.mock:
        mock_path = Path.home() / "Downloads" / "mock_transcript.csv"
        generate_mock_transcript(mock_path)
        courses = parse_transcript(mock_path)
        if courses:
            report = reconcile_degree(courses)
            deposit_report(report, mock_path)
            print_status()
    elif args.run:
        fp = Path(args.run)
        if not fp.exists():
            print(f"❌ File not found: {fp}")
        else:
            courses = parse_transcript(fp)
            if courses:
                report = reconcile_degree(courses)
                deposit_report(report, fp)
                print_status()
    else:
        print_status()
