import os
import time
import json
import redis
import google.generativeai as genai
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

# ==========================================
# AILCC VANGUARD: LECTURE VISION DAEMON
# Purpose: Autonomous Google Drive OCR Pipeline
# ==========================================

# 1. Configuration
from dotenv import load_dotenv
load_dotenv()

GOOGLE_DRIVE_PATH = "/Users/infinite27/Library/CloudStorage/GoogleDrive-eastcoastfreshcoats@gmail.com/My Drive/Screenshots"


OUTPUT_DIR = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/academic_matrix/Lectures"
PROCESSED_LOG = "/Users/infinite27/AILCC_PRIME/06_System/Logs/vision_processed.json"

# API Initialization
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    print("❌ ERROR: GOOGLE_API_KEY environment variable missing.")
    exit(1)

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Redis Connection for Live Dashboard Telemetry
try:
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    r.ping()
    REDIS_ACTIVE = True
except Exception:
    REDIS_ACTIVE = False
    print("⚠️ Redis offline. Dashboard telemetry disabled.")

# Ensure directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
if not os.path.exists(PROCESSED_LOG):
    with open(PROCESSED_LOG, 'w') as f:
        json.dump([], f)

def load_processed_files():
    try:
        with open(PROCESSED_LOG, 'r') as f:
            return set(json.load(f))
    except:
        return set()

def save_processed_file(filename):
    processed = load_processed_files()
    processed.add(filename)
    with open(PROCESSED_LOG, 'w') as f:
        json.dump(list(processed), f)

def broadcast_telemetry(msg_type, content, severity="ROUTINE"):
    if not REDIS_ACTIVE: return
    try:
        synapse = {
            "intent": content,
            "agent": "COMET_VISION",
            "type": msg_type,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }
        r.publish('NEURAL_SYNAPSE', json.dumps(synapse))
        # Support generic events too for Dashboard backwards compatibility
        if severity == "CRITICAL" or msg_type == "SUCCESS":
            r.publish('NEURAL_SYNAPSE', json.dumps({
                "type": "SYSTEM_EVENT",
                "id": f"vis-{int(time.time())}",
                "msg": content,
                "timestamp": datetime.now().isoformat()
            }))
    except Exception as e:
        print(f"Telemetry broadcast failed: {e}")

class LectureSlideHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        
        file_ext = os.path.splitext(event.src_path)[1].lower()
        if file_ext in ['.png', '.jpg', '.jpeg']:
            print(f"📸 New Slide Detected: {os.path.basename(event.src_path)}")
            # Give Google Drive a moment to complete the file download
            time.sleep(3)
            self.process_slide(event.src_path)

    def process_slide(self, filepath):
        filename = os.path.basename(filepath)
        processed = load_processed_files()
        
        if filename in processed:
            return
            
        print(f"🧠 Initiating Flash 1.5 OCR on: {filename}")
        broadcast_telemetry("LOG", f"Ingesting slide: {filename}", "ROUTINE")

        try:
            # Upload to Gemini
            gemini_file = genai.upload_file(filepath)
            
            prompt = """
            You are an elite academic transcription module for the AILCC Swarm.
            Analyze this lecture slide screenshot. 
            
            1. Determine the likely course based on context (e.g. Health = HLTH1011, Science/Environment = GENS2101). Note: The user's current semester focuses heavily on these two.
            2. Extract ALL text from the slide perfectly.
            3. Summarize any visible diagrams, charts, or images in a highly descriptive paragraph.
            4. Format the output in strict Markdown with clear H1, H2, and bullet points. Do not include introductory fluff like 'Here is the extraction'.
            """
            
            response = model.generate_content([gemini_file, prompt])
            
            # Save Output
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = filename.replace(' ', '_').replace('.png', '').replace('.jpg', '')
            out_file = os.path.join(OUTPUT_DIR, f"Transc_{safe_name}_{timestamp}.md")
            
            with open(out_file, 'w', encoding='utf-8') as f:
                f.write(response.text)
                
            print(f"✅ Extracted and Synthesized to: {out_file}")
            broadcast_telemetry("SUCCESS", f"Slide OCR Complete! Saved to Vault.", "ROUTINE")
            
            # Mark as processed
            save_processed_file(filename)

            # ==========================================
            # PHASE 75: COMET RESEARCH DISPATCH
            # ==========================================
            try:
                # Heuristic: Extract the first 50 chars of the transcription as a topic or look for keywords
                # In a more advanced version, we'd ask Gemini for a specific 'Search Query'
                research_topic = filename.split('.')[0]
                dispatch_cmd = [
                    "python3", 
                    "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/comet_framework/antigravity_bridge.py",
                    "--task",
                    f"Deep research the core concepts found in the lecture slide: '{filename}'. Focus on extracting definitions and real-world examples for the key terms identified in the transcript: {out_file}"
                ]
                subprocess.Popen(dispatch_cmd)
                print(f"☄️  Comet Research Dispatched for: {filename}")
                broadcast_telemetry("RESEARCH_DISPATCH", f"Comet investigating slide topics...", "ROUTINE")
            except Exception as re:
                print(f"⚠️ Comet Dispatch failed: {re}")
            
            # Cleanup remote File resource
            gemini_file.delete()
            
        except Exception as e:
            print(f"❌ OCR Failure on {filename}: {e}")
            broadcast_telemetry("ERROR", f"Vision pipeline failure: {filename}", "CRITICAL")


if __name__ == "__main__":
    print(f"🚀 [AILCC COMET VISION] Initializing Google Drive Bridge Observer...")
    
    # Attempt to create the Google Drive path if it strictly doesn't exist yet, 
    # though usually Google Drive manages this. Still good for avoiding hard crashes.
    try:
        os.makedirs(GOOGLE_DRIVE_PATH, exist_ok=True)
    except Exception as e:
        print(f"⚠️ Warning: Could not verify Google Drive path locally: {e}")
        print("Ensure Google Drive Desktop is running and the Windows folder is syncing.")

    event_handler = LectureSlideHandler()
    observer = Observer()
    
    # Check if path exists before scheduling
    if os.path.exists(GOOGLE_DRIVE_PATH):
        observer.schedule(event_handler, path=GOOGLE_DRIVE_PATH, recursive=False)
        observer.start()
        print(f"👁️  Monitoring Cloud Directory: {GOOGLE_DRIVE_PATH}")
        broadcast_telemetry("STARTUP", "Comet Vision Daemon engaged. Monitoring Google Drive Bridge.", "ROUTINE")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()
    else:
        print(f"🔴 CRITICAL ERROR: Target directory not found. Waiting for Google Drive to mount...")
        print(f"Path queried: {GOOGLE_DRIVE_PATH}")
        # Soft busy-wait so PM2 doesn't hyper-loop crash if the mount is just delayed
        while not os.path.exists(GOOGLE_DRIVE_PATH):
            time.sleep(30)
        
        print(f"🟢 Path discovered! Rebooting observer loop via PM2...")
        exit(0)
