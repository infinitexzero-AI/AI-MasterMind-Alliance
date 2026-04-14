import json
import os
from datetime import datetime

# Paths
HISTORY_PATH = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\academic_history.json"
PROFILE_PATH = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\competency_profile.json"
SUMMER_PATH = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\summer_2026.json"
TASK_REGISTRY_PATH = r"c:\Users\infin\AILCC_PRIME\tasks\consolidated_task_registry.json"

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def sync():
    history = load_json(HISTORY_PATH)
    profile = load_json(PROFILE_PATH)
    summer = load_json(SUMMER_PATH)
    registry = load_json(TASK_REGISTRY_PATH)

    # 1. Update Profile Stats
    profile["pillars"][0]["completed_credits"] = 0.0 # Bio-Systems
    profile["pillars"][1]["completed_credits"] = 0.0 # Cognitive
    profile["pillars"][2]["completed_credits"] = 0.0 # Foundations

    bio_courses = ["BIOL", "CHEM", "BIOC"]
    psy_courses = ["PSYC"]
    found_courses = ["MATH", "PHYS", "GENS", "PHIL", "ENGL", "CLAS"]

    for course in history["history"]:
        if course["credits_completed"] > 0:
            code = course["code"].split('-')[0]
            if code in bio_courses:
                profile["pillars"][0]["completed_credits"] += course["credits_completed"]
            elif code in psy_courses:
                profile["pillars"][1]["completed_credits"] += course["credits_completed"]
            else:
                profile["pillars"][2]["completed_credits"] += course["credits_completed"]

    # 2. Update Summer 2026
    summer["semester"]["gpa_snapshot"] = history["stats"]["cumulative_gpa"]
    summer["last_sync"] = datetime.now().isoformat()
    
    # Check for CLAS-2501 record
    clas_prev = [c for c in history["history"] if c["code"] == "CLAS-2501"]
    if clas_prev:
        for c in summer["semester"]["courses"]:
            if c["id"] == "CLAS-2501":
                c["last_attempt_grade"] = clas_prev[-1]["grade"]
                c["status"] = "RETAKE_PRIORITY_HIGH"

    # 3. Inject Agent Tasks
    new_tasks = [
        {
            "id": f"task_acad_{len(registry['registry'])}",
            "title": "CLAS-2501 Archaeological Context Mapping",
            "status": "pending",
            "priority": "high",
            "narrative": "Autonomous scouting for introductory archaeology resources. High priority due to previous attempt status.",
            "assigned_to": "Comet"
        },
        {
            "id": f"task_acad_{len(registry['registry']) + 1}",
            "title": "MATH-1151 Calculus Application Aggregate",
            "status": "pending",
            "priority": "medium",
            "narrative": "Aggregate biological applications of calculus (Wolfram integration).",
            "assigned_to": "Research Assistant"
        }
    ]
    
    # Check if already exists to avoid duplicates
    existing_titles = [t["title"] for t in registry["registry"]]
    for nt in new_tasks:
        if nt["title"] not in existing_titles:
            registry["registry"].append(nt)

    # 4. Capability Spikes (Grade Recovery Detection)
    # Detect courses that went from D/F to A/B
    grades_by_course = {}
    for c in history["history"]:
        if c["code"] not in grades_by_course:
            grades_by_course[c["code"]] = []
        grades_by_course[c["code"]].append(c["grade"])
    
    for code, grades in grades_by_course.items():
        if len(grades) > 1:
            first = grades[0]
            last = grades[-1]
            if first in ['D', 'F', 'C-'] and last in ['A', 'A-', 'B+', 'B']:
                new_spike = {
                    "skill": f"Academic Recovery: {code}",
                    "evidence": f"Successfully transitioned from {first} to {last}. Demonstrates cognitive resilience and protocol adaptation."
                }
                if new_spike["skill"] not in [s["skill"] for s in profile["capability_spikes"]]:
                    profile["capability_spikes"].append(new_spike)

    # Save all
    save_json(PROFILE_PATH, profile)
    save_json(SUMMER_PATH, summer)
    save_json(TASK_REGISTRY_PATH, registry)
    
    return "Synchronization complete. Academic matrix and task registry updated."

if __name__ == "__main__":
    print(sync())
