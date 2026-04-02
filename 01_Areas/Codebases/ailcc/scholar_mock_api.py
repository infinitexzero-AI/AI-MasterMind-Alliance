import json
import os
from datetime import datetime

# AILCC Scholar Bridge: Mock API Layer
# Connects the Scholar agent to simulated MTA and NSLSC data.

BASE_DIR = "/Users/infinite27/AILCC_PRIME"
CREDIT_MAP_PATH = f"{BASE_DIR}/01_Areas/Codebases/ailcc/registries/CREDIT_MAP.json"
SCHOLAR_DATA_PATH = f"{BASE_DIR}/06_System/State/scholar_data.json"
LOG_FILE = f"{BASE_DIR}/06_System/Logs/scholar_api_mock.log"

def log_api_call(endpoint, status="200 OK"):
    timestamp = datetime.now().isoformat()
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] [API_MOCK] {endpoint} -> {status}\n")

class ScholarAPI:
    @staticmethod
    def get_mta_transcript():
        log_api_call("/mta/v1/transcript")
        with open(CREDIT_MAP_PATH, 'r') as f:
            return json.load(f)

    @staticmethod
    def get_nslsc_status():
        log_api_call("/nslsc/v1/funding_status")
        # Mocking NSLSC data based on academic standing
        return {
            "loan_status": "Certificate of Eligibility Issued",
            "study_period": "Winter 2026",
            "funding_confirmed": True,
            "next_disbursement": "2026-01-15",
            "requirements": ["Course Load Verification Required"]
        }

    @staticmethod
    def verify_enrollment(course_code):
        log_api_call(f"/mta/v1/enrollment/verify?code={course_code}")
        with open(SCHOLAR_DATA_PATH, 'r') as f:
            data = json.load(f)
        
        # Check if course is in remaining courses vs current courses
        for course in data['degree_progress']['remaining_courses_needed']:
            if course_code in course:
                return {"code": course_code, "status": "REGISTERED", "term": "Winter 2026"}
        
        return {"code": course_code, "status": "NOT_FOUND"}

if __name__ == "__main__":
    # Test Mock API
    print("--- Testing Scholar API Mocks ---")
    print("Transcript Data:", ScholarAPI.get_mta_transcript()['credits'])
    print("Funding Status:", ScholarAPI.get_nslsc_status()['loan_status'])
    print("Enrollment MATH 1311:", ScholarAPI.verify_enrollment("MATH 1311"))
