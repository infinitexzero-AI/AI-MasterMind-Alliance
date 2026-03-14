import os
import json
import redis
import logging
from datetime import datetime

# Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
SCHOLAR_DATA_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/scholar_data.json"

# Container awareness for state path
if os.path.exists("/app/06_System/State/scholar_data.json"):
     SCHOLAR_DATA_PATH = "/app/06_System/State/scholar_data.json"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def perform_handshake():
    logging.info("🚀 Starting Transcript Handshake Protocol...")
    
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
        
        # 1. Fetch latest scholar reports from Redis
        report_keys = r.keys("scholar:report:*")
        if not report_keys:
            logging.info("No new scholar reports found in buffer.")
            return

        # Load current state
        if not os.path.exists(SCHOLAR_DATA_PATH):
            logging.error(f"State file {SCHOLAR_DATA_PATH} not found.")
            return
            
        with open(SCHOLAR_DATA_PATH, 'r') as f:
            scholar_data = json.load(f)

        updated = False
        for key in report_keys:
            report_data = json.loads(r.get(key))
            mission_id = report_data.get('mission_id')
            findings = report_data.get('findings', '').lower()
            
            logging.info(f"Processing Report: {mission_id}")
            
            # Simple keyword matching for enrollment verification
            for course in scholar_data['courses']:
                if course['code'].lower() in findings:
                    if "enrolled" in findings or "active" in findings or "registered" in findings:
                        if not course['enrolled']:
                            course['enrolled'] = True
                            course['status'] = "VERIFIED_ACTIVE"
                            logging.info(f"✅ Handshake Success: {course['code']} verified as ENROLLED.")
                            updated = True
                    elif "not enrolled" in findings or "dropped" in findings:
                        if course['enrolled']:
                            course['enrolled'] = False
                            course['status'] = "VERIFIED_DROPPED"
                            logging.info(f"⚠️ Handshake Alert: {course['code']} verified as NOT ENROLLED.")
                            updated = True
            
            # Move report to archive or delete from active buffer
            r.delete(key)
            logging.info(f"Archived report {mission_id}")

        if updated:
            scholar_data['last_updated'] = datetime.utcnow().isoformat() + "Z"
            with open(SCHOLAR_DATA_PATH, 'w') as f:
                json.dump(scholar_data, f, indent=2)
            logging.info("🏁 Global scholar state updated.")
        else:
            logging.info("No changes required to scholar state.")

    except Exception as e:
        logging.error(f"Handshake failed: {str(e)}")

if __name__ == "__main__":
    perform_handshake()
