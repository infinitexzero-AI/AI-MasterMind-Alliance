import os
import json
import shutil
import logging
from datetime import datetime

# Path Configuration
BASE_PATH = "/Users/infinite27/AILCC_PRIME"
MOODLE_DROP_PATH = os.path.join(BASE_PATH, "02_Resources/Academics/00_Moodle_Drops")
ACADEMIC_BASE = os.path.join(BASE_PATH, "02_Resources/Academics")
SCHOLAR_DATA_PATH = os.path.join(BASE_PATH, "06_System/State/scholar_data.json")

# Logging Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def intel_sync():
    logging.info("🚀 Starting Scholar Intelligence Sync...")
    
    if not os.path.exists(MOODLE_DROP_PATH):
        os.makedirs(MOODLE_DROP_PATH)
        logging.info(f"Created drop directory at {MOODLE_DROP_PATH}")

    # Load Scholar State
    with open(SCHOLAR_DATA_PATH, 'r') as f:
        scholar_data = json.load(f)

    courses = [c['code'] for c in scholar_data.get('courses', [])]
    # Add manual codes if missing in the data but present in the file system
    if "GENS-2101" not in courses: courses.append("GENS-2101")
    if "HLTH-1011" not in courses: courses.append("HLTH-1011")

    files_found = os.listdir(MOODLE_DROP_PATH)
    if not files_found:
        logging.info("No new materials found in Moodle Drops.")
        return

    for filename in files_found:
        if filename == ".DS_Store": continue
        
        source_path = os.path.join(MOODLE_DROP_PATH, filename)
        moved = False
        
        # Determine destination based on filename keywords
        for course_code in courses:
            # Normalize for comparison
            clean_code = course_code.replace(" ", "-").upper()
            if clean_code in filename.upper() or course_code.upper().replace(" ", "") in filename.upper().replace("-", ""):
                dest_dir = os.path.join(ACADEMIC_BASE, course_code.replace(" ", "-"))
                if not os.path.exists(dest_dir):
                    os.makedirs(dest_dir)
                
                dest_path = os.path.join(dest_dir, filename)
                shutil.move(source_path, dest_path)
                logging.info(f"✅ Ingested: {filename} -> {course_code}")
                
                # Emit Event
                try:
                    from unified_event_bus import UnifiedEventBus
                    UnifiedEventBus.emit(
                        event_type="ACADEMIC_INGESTION",
                        source="Scholar",
                        message=f"New course material ingested: {filename}",
                        payload={"filename": filename, "course": course_code},
                        priority=3
                    )
                except ImportError:
                    logging.warning("UnifiedEventBus not found, skipping notification.")
                
                moved = True
                break
        
        if not moved:
            logging.warning(f"❓ Could not categorize: {filename}. Staying in drops for manual review.")

    # Update Global State
    scholar_data['last_updated'] = datetime.utcnow().isoformat() + "Z"
    with open(SCHOLAR_DATA_PATH, 'w') as f:
        json.dump(scholar_data, f, indent=2)
    
    logging.info("🏁 Sync Complete. Scholar state updated.")

if __name__ == "__main__":
    intel_sync()
