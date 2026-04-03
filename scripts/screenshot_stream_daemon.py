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
from PIL import Image

# ---------------- CONFIGURATION ----------------
AILCC_ROOT = Path("C:/Users/infin/AILCC_PRIME")
ENV_PATH = AILCC_ROOT / "01_Areas/Codebases/ailcc/.env"
DESKTOP = Path("C:/Users/infin/Desktop")
INBOX_DIR = DESKTOP / "Screenshots"
ARCHIVE_DIR = DESKTOP / "Screenshots_Archive"
OUT_BASE_DIR = AILCC_ROOT / "02_Resources/Academics"

# Load API Key from the specified AILCC .env
load_dotenv(ENV_PATH)
API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    print("CRITICAL: GOOGLE_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=API_KEY)
# Using gemini-2.5-flash as the primary multimodal model
model = genai.GenerativeModel('gemini-2.5-flash')
# -----------------------------------------------

def init_dirs():
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_BASE_DIR.mkdir(parents=True, exist_ok=True)

def process_image(img_path):
    print(f"[*] Analyzing {img_path.name}...")
    
    prompt = """
    You are an expert academic assistant at Mount Allison University. 
    Analyze this screenshot.
    1. Categorize it. Is it 'GENS-2101', 'HLTH-1011' (Systematic reviews, health bias, research), 'Misc_Gaming' (e.g. League of Legends), or 'Misc_Other'? 
    2. Transcribe and summarize the visual content clearly using Markdown formatting.
    
    Output exactly in this strictly formatted JSON structure without any surrounding codeblocks or Markdown ticks.
    {
       "category": "HLTH-1011",
       "content": "# Slide Title\\n- Bullet 1\\n- Bullet 2"
    }
    """
    
    try:
        # Use context manager to ensure the file handle is released before moving
        with Image.open(img_path) as img:
            response = model.generate_content([prompt, img])
            res_text = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(res_text)
            
            cat = data.get("category", "Misc_Other")
            content = data.get("content", "")
            
            # Save transcription
            cat_dir = OUT_BASE_DIR / cat
            cat_dir.mkdir(parents=True, exist_ok=True)
            
            out_file = cat_dir / f"{img_path.stem}.md"
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(content)
            
            print(f"  [OK] Extracted -> {cat_dir.name}/{out_file.name}")
        
        # Move processed file to archive - now safe from WinError 32
        shutil.move(str(img_path), str(ARCHIVE_DIR / img_path.name))
        
    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "Quota exceeded" in err_msg:
            print(f"  [QUOTA] Rate limit hit. Sleeping for 60s... {err_msg}")
            time.sleep(60)
        else:
            print(f"  [FAIL] Failed to process {img_path.name}. {err_msg}")

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
