import json
import os
import random
from datetime import datetime

# Paths
COURSE_DATA = "/Users/infinite27/AILCC_PRIME/01_Areas/modes/mode-1-student/current_courses.json"
VAULT_QUIZZES = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/quizzes"

if not os.path.exists(VAULT_QUIZZES):
    os.makedirs(VAULT_QUIZZES)

def generate_readiness_report():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🎓 Initiating Exam Readiness Protocol...")
    
    with open(COURSE_DATA, 'r') as f:
        data = json.load(f)
        
    for course in data['courses']:
        active = course.get('active_topics', [])
        covered = course.get('covered_topics', [])
        
        readiness = (len(covered) / len(active)) * 100 if active else 0
        
        print(f"📚 Course: {course['code']} - {course['name']}")
        print(f"📊 Readiness Level: {readiness:.1f}%")
        
        if readiness < 100:
            remaining = [t for t in active if t not in covered]
            target_topic = random.choice(remaining)
            print(f"🎯 Target for today: COVER {target_topic}")
            
            # Generate a mock quiz for the target topic
            quiz = {
                "course": course['code'],
                "topic": target_topic,
                "timestamp": datetime.now().isoformat(),
                "questions": [
                    {"q": f"Define the core principles of {target_topic}.", "type": "essay"},
                    {"q": f"How does {target_topic} relate to previous modules?", "type": "analysis"}
                ]
            }
            
            quiz_file = os.path.join(VAULT_QUIZZES, f"quiz_{course['code']}_{int(datetime.now().timestamp())}.json")
            with open(quiz_file, 'w') as qf:
                json.dump(quiz, qf, indent=2)
            print(f"📝 Mock Quiz generated: {os.path.basename(quiz_file)}")
        else:
            print("✅ 100% READY. Proceed to Final Review.")

if __name__ == "__main__":
    generate_readiness_report()
