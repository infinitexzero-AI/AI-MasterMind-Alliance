import json
import os

def generate_master_context():
    # Paths
    raw_transcript_path = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\full_transcript_raw.txt"
    institutional_rules_path = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\institutional_rules.json" # We'll create this

    # Academic Rules for MTA 2026
    rules = {
        "degree": "Bachelor of Arts (BA)",
        "major_1": "Psychology",
        "major_2": "Biology (Secondary/Add. Major)",
        "certificate": "Biopsychology Certificate",
        "graduation_threshold": 120,
        "certificate_requirements": {
            "core": ["BIOL 2811", "PSYC 2101"],
            "electives": {
                "total": 12,
                "bio_list": ["BIOL 3211", "BIOL 3401", "BIOL 3471", "BIOL 4311"],
                "psyc_list": ["PSYC 3101", "PSYC 3211", "PSYC 4101"]
            }
        },
        "target": "GPA Recovery (Scholar Convergence 2027) -> Med School 2028"
    }

    # Read Raw Transcript
    with open(raw_transcript_path, 'r', encoding='utf-8') as f:
        transcript_text = f.read()

    context = {
        "mission": "Definitive Graduation Audit & GPA Optimization",
        "institutional_rules": rules,
        "transcript_raw": transcript_text,
        "confirmed_policies": {
            "grade_replacement": "ENABLED (Retakes replace previous grade in CGPA)"
        }
    }

    output_path = r"c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc\hippocampus_storage\academic_matrix\master_planning_context.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(context, f, indent=2)
    
    print(f"Master Planning Context generated at {output_path}")

if __name__ == "__main__":
    generate_master_context()
