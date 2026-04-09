import os
import time
import json
import shutil
import glob
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from PIL import Image, ImageChops, ImageStat
import requests
import hashlib


# ---------------- CONFIGURATION ----------------
AILCC_ROOT = Path("C:/Users/infin/AILCC_PRIME")
ENV_PATH = AILCC_ROOT / "01_Areas/Codebases/ailcc/.env"
INBOX_DIR = Path("C:/Users/infin/Desktop/Screenshots")
ARCHIVE_DIR = AILCC_ROOT / "snapshots/academic_vision"
OUT_BASE_DIR = AILCC_ROOT / "02_Resources/Academics"

# Cortex API Config
API_BASE = "http://localhost:8000/api/v1"
SYNC_INTERVAL = 300 # Sync config every 5 mins
last_sync_time = 0


# Load API Key from the specified AILCC .env
load_dotenv(ENV_PATH)
API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    print("CRITICAL: GOOGLE_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=API_KEY)
# Using gemini-2.5-flash as the primary multimodal model
model = genai.GenerativeModel('gemini-2.5-flash')

LAST_IMAGE = None
DIFF_THRESHOLD = 5.0 # Initial fallback value
ACTIVE_COURSES = ["GENS-2101", "HLTH-1011"]

def sync_config():
    global DIFF_THRESHOLD, ACTIVE_COURSES, last_sync_time
    try:
        resp = requests.get(f"{API_BASE}/vision/config", timeout=2)
        if resp.status_code == 200:
            config = resp.json()
            DIFF_THRESHOLD = config.get("diff_threshold", DIFF_THRESHOLD)
            ACTIVE_COURSES = config.get("active_courses", ACTIVE_COURSES)
            last_sync_time = time.time()
            print(f"[*] Cortex Config Synced: Threshold={DIFF_THRESHOLD}%, Courses={ACTIVE_COURSES}")
    except Exception as e:
        print(f"  [SIGNAL ERROR] Failed to sync config from Cortex: {e}")

# -----------------------------------------------



def init_dirs():
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_BASE_DIR.mkdir(parents=True, exist_ok=True)

def process_image(img_path):
    global LAST_IMAGE, last_sync_time
    
    # Periodically sync config
    if time.time() - last_sync_time > SYNC_INTERVAL:
        sync_config()

    print(f"[*] Checking {img_path.name}...")

    
    # --- FRAME DIFFING (PRE-ANALYSIS) ---
    try:
        current_img = Image.open(img_path).convert('RGB')
        if LAST_IMAGE is not None:
            # Compare current with last
            diff = ImageChops.difference(current_img, LAST_IMAGE)
            stat = ImageStat.Stat(diff)
            # Calculate percentage of change based on rms (root mean square)
            diff_ratio = (sum(stat.rms) / (3 * 255)) * 100
            
            if diff_ratio < DIFF_THRESHOLD:
                print(f"  [SKIP] Visual change only {diff_ratio:.2f}% (Threshold: {DIFF_THRESHOLD}%)")
                # Move to archive without processing
                shutil.move(str(img_path), str(ARCHIVE_DIR / img_path.name))
                return
            
            print(f"  [SIGNAL] Visual change detected: {diff_ratio:.2f}%")
        
        # Update last image for next comparison
        LAST_IMAGE = current_img.copy()
    except Exception as e:
        print(f"  [DIFF ERROR] Failed to compare images: {e}")

    # --- DEEP SYNERGY CACHE CHECK ---

    API_BASE = "http://localhost:8000/api/v1"
    try:
        # 1. Ask FastAPI Cortex if we've seen this image before
        check_resp = requests.post(f"{API_BASE}/vision/analyze", json={"image_path": str(img_path)})
        if check_resp.status_code == 200:
            data = check_resp.json()
            if data.get("status") != "cache_miss":
                print(f"  [CACHE HIT] Using existing analysis for {img_path.name}")
                save_and_move(img_path, data)
                return
            img_hash = data.get("hash")
    except Exception as e:
        print(f"  [SIGNAL ERROR] Failed to connect to FastAPI Cortex: {e}")
        img_hash = None

    # --- GEMINI ANALYSIS (If Cache Miss) ---
    courses_str = ", ".join([f"'{c}'" for c in ACTIVE_COURSES])
    prompt = f"""
    You are an expert academic assistant at Mount Allison University. 
    Analyze this screenshot.
    1. Categorize it. Is it one of {courses_str}, or 'Misc_Other'? 
    2. Transcribe and summarize the visual content clearly using Markdown formatting.
    
    Output exactly in this strictly formatted JSON structure without any surrounding codeblocks or Markdown ticks.
    {{
       "category": "HLTH-1011",
       "content": "# Slide Title\\n- Bullet 1\\n- Bullet 2"
    }}
    """

    
    try:
        with Image.open(img_path) as img:
            response = model.generate_content([prompt, img])
            res_text = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(res_text)
            
            # --- CACHE NEW RESULT ---
            if img_hash:
                requests.post(f"{API_BASE}/vision/cache", params={"img_hash": img_hash}, json=data)
            
            save_and_move(img_path, data)
        
    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "Quota exceeded" in err_msg:
            print(f"  [QUOTA] Rate limit hit. Sleeping for 60s... {err_msg}")
            time.sleep(60)
        else:
            print(f"  [FAIL] Failed to process {img_path.name}. {err_msg}")

def save_and_move(img_path, data):
    cat = data.get("category", "Misc_Other")
    content = data.get("content", "")
    
    cat_dir = OUT_BASE_DIR / cat
    cat_dir.mkdir(parents=True, exist_ok=True)
    
    out_file = cat_dir / f"{img_path.stem}.md"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"  [OK] Extracted -> {cat_dir.name}/{out_file.name}")
    shutil.move(str(img_path), str(ARCHIVE_DIR / img_path.name))


class ScreenshotHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
            time.sleep(2) # Buffer to let the OS finish saving the file completely
            process_image(path)

def backfill():
    images = glob.glob(str(INBOX_DIR / "*.png")) + glob.glob(str(INBOX_DIR / "*.jpg"))
    if not images:
        print("No backlog images found. Desktop is clean!")
        return
    print(f"Found {len(images)} raw screenshots in backlog. Initiating extraction process...")
    for img in images:
        process_image(Path(img))
        time.sleep(10) # Respect general free-tier API rate limits (conservative)

def start_watcher():
    event_handler = ScreenshotHandler()
    observer = Observer()
    observer.schedule(event_handler, str(INBOX_DIR), recursive=False)
    observer.start()
    print("\n[STREAMING] Automated Screenshot Stream daemon is now active.")
    print("Any new screenshots hitting the Desktop will be piped directly into the Academic Database.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    print("=== VANGUARD ACADEMIC VISION STREAM ===")
    init_dirs()
    backfill()
    start_watcher()
