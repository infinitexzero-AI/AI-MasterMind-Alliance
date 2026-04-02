import json
import os
from datetime import datetime
from core.integrations.google_bridge import GoogleBridge

# Configuration
COURSES_FILE = os.path.join("modes", "mode-1-student", "current_courses.json")
SHEET_TITLE = "Scholar Tracker"

def sync_courses():
    print(f"ScholarBridge: Syncing {COURSES_FILE} to Cloud...")
    
    # 1. Read Local Data
    if not os.path.exists(COURSES_FILE):
        print(f"❌ Error: Course file not found at {COURSES_FILE}")
        return False
        
    try:
        with open(COURSES_FILE, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        return False

    # 2. Authenticate
    bridge = GoogleBridge()
    if not bridge.authenticate():
        return False

    # 3. Resolve Sheet
    # For now, we simply create a new one or append to existing if we tracked IDs.
    # To keep it simple for this sprint, we'll creates a BRAND NEW one every time 
    # OR we could search for one. Let's create one for safety and explicit output.
    
    sheet_id = bridge.create_sheet(f"{SHEET_TITLE} - {datetime.now().strftime('%Y-%m-%d')}")
    if not sheet_id:
        return False
        
    # 4. Prepare Data
    # Header
    bridge.append_row(sheet_id, ["Code", "Name", "Status", "Professor", "Exam Date", "Next Deliverable"])
    
    for course in data.get('courses', []):
        code = course.get('code', 'N/A')
        name = course.get('name', 'N/A')
        status = course.get('status', 'N/A')
        prof = course.get('professor', 'N/A')
        exam = course.get('exam_date', 'N/A')
        
        # simple logic for next deliverable
        next_deliv = "None"
        for d in course.get('deliverables', []):
            if d.get('status') != 'Completed':
                next_deliv = f"{d.get('title')} ({d.get('due_date')})"
                break
        
        row = [code, name, status, prof, exam, next_deliv]
        bridge.append_row(sheet_id, row)

    print(f"✅ Scholar Data Synced to Sheet ID: {sheet_id}")
    return True
