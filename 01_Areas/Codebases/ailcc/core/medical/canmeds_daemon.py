import json
import os
import time
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so Next.js on :3000/3001 can seamlessly ingest the CanMEDS payload
CORS(app)

# The physical path to the local CanMEDS logging arrays
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__canmeds_daemon_path()), "../../hippocampus_storage/academic_matrix/canmeds_hours.json"))

def __canmeds_daemon_path():
    return __file__

def load_local_canmeds_state():
    """Reads the JSON cluster from hippocampus_storage to sync clinical hours."""
    # Defaults in case the file hasn't been instantiated yet
    baseline_telemetry = {
        "Professional": 45,
        "Communicator": 12,
        "Collaborator": 110,
        "Leader": 30,
        "Health Advocate": 75
    }
    
    try:
        if os.path.exists(DB_PATH):
            with open(DB_PATH, 'r') as f:
                data = json.load(f)
                return data
        else:
            # Auto-generate baseline payload if offline
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            with open(DB_PATH, 'w') as f:
                json.dump(baseline_telemetry, f, indent=4)
            return baseline_telemetry
    except Exception as e:
        print(f"[CANMEDS_PANIC] Matrix Read Failure: {e}")
        return baseline_telemetry

@app.route('/api/medical/canmeds', methods=['GET'])
def get_canmeds_telemetry():
    """Intercepts the useSWR React polling from academics.tsx"""
    try:
        hours_matrix = load_local_canmeds_state()
        print(f"[OBSERVER_TELEMETRY] Broadcasted Medical State -> Leader: {hours_matrix.get('Leader', 0)}h")
        return jsonify(hours_matrix), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/system/academics/live', methods=['GET'])
def get_institutional_matrix():
    """Returns the live course/assignment tracking structure."""
    return jsonify({
        "semester": {
            "id": "WINTER_2026",
            "label": "Winter 2026",
            "start_date": "2026-01-05",
            "end_date": "2026-04-30",
            "gpa_snapshot": 3.8,
            "courses": [
                {
                    "id": "GENS2101",
                    "title": "Intro to Natural Resource Management (SYNCED)",
                    "instructor": "Dr. Larry Swatuk",
                    "credits": 3,
                    "meeting_times": ["Mon 10:30", "Wed 10:30", "Fri 10:30"],
                    "room": "Avard-Dixon 112",
                    "links": {
                        "moodle": "https://moodle.mta.ca/course/view.php?id=1234",
                        "onedrive": "https://onedrive.live.com/gens2101"
                    },
                    "syllabus_parsed": True,
                    "assignments": [
                        { "id": "a1", "course_id": "GENS2101", "title": "Treaty Rights Position Paper", "type": "PAPER", "weight_percentage": 20, "due_date": "2026-03-23T23:59:00Z", "status": "IN_PROGRESS" }
                    ]
                },
                {
                    "id": "HLTH1011",
                    "title": "Foundations of Health Inquiry (SYNCED)",
                    "instructor": "Dr. San Patten",
                    "credits": 3,
                    "meeting_times": ["Tue 14:30", "Thu 14:30"],
                    "room": "Flemington 220",
                    "links": {
                        "moodle": "https://moodle.mta.ca/course/view.php?id=5678",
                        "self_service": "https://selfservice.mta.ca/"
                    },
                    "syllabus_parsed": True,
                    "assignments": [
                        { "id": "a3", "course_id": "HLTH1011", "title": "Cortisol Measurement Lab", "type": "PROJECT", "weight_percentage": 15, "due_date": "2026-03-10T17:00:00Z", "status": "SUBMITTED", "grade": 92 }
                    ]
                }
            ]
        }
    }), 200

if __name__ == '__main__':
    print("=========================================================")
    print(" VANGUARD MEDICAL CANMEDS DAEMON: ONLINE (Port 5005) ")
    print(" Listening for React useSWR payload bursts... ")
    print("=========================================================")
    # Next.js `academics.tsx` pings this physical port universally
    app.run(host='0.0.0.0', port=5005, debug=False)
