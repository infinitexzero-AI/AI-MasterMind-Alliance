import os
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- CONFIGURATION ---
WATCH_PATH = r"C:\Users\infin\AILCC_PRIME"
SYNC_SCRIPT = r"C:\Users\infin\AILCC_PRIME\scripts\vanguard_sync.ps1"
DEBOUNCE_SECONDS = 60
IGNORE_DIRS = [".git", ".next", "node_modules", "__pycache__", "logs", "tmp"]

class SyncHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_sync_time = 0

    def on_any_event(self, event):
        if event.is_directory:
            return
        
        # Check if file is in ignored directory
        path_parts = event.src_path.split(os.sep)
        if any(ignored in path_parts for ignored in IGNORE_DIRS):
            return

        current_time = time.time()
        if (current_time - self.last_sync_time) > DEBOUNCE_SECONDS:
            print(f"🔄 [Vanguard Daemon] Change detected: {event.src_path}")
            self.trigger_sync()
            self.last_sync_time = current_time

    def trigger_sync(self):
        print("🚀 [Vanguard Daemon] Triggering Automated Mesh Alignment...")
        try:
            # Run the powershell sync script
            subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", SYNC_SCRIPT], check=True)
            print("✅ [Vanguard Daemon] Mesh Synchronized Successfully.")
        except Exception as e:
            print(f"❌ [Vanguard Daemon] Sync Failed: {e}")

if __name__ == "__main__":
    print(f"📡 [Vanguard Daemon] Starting Mesh Alignment Watcher...")
    print(f"📁 Path: {WATCH_PATH}")
    print(f"⏲️ Debounce: {DEBOUNCE_SECONDS}s")
    
    event_handler = SyncHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_PATH, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
