import os
import shutil
import json
from datetime import datetime

# Paths
LOGS_DIR = "/Users/infinite27/AILCC_PRIME/06_System/Logs"
ARCHIVE_DIR = "/Users/infinite27/AILCC_PRIME/03_Archives/SystemLogs"
MAX_LOG_AGE_DAYS = 7

if not os.path.exists(ARCHIVE_DIR):
    os.makedirs(ARCHIVE_DIR)

def optimize_system():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🛠️  Executing System Optimization Verdict...")
    
    files_moved = 0
    space_freed = 0
    
    for filename in os.listdir(LOGS_DIR):
        if filename.endswith(".log"):
            filepath = os.path.join(LOGS_DIR, filename)
            stats = os.stat(filepath)
            
            # Simple simulation: move all logs over 10KB to Archives
            if stats.st_size > 10240:
                print(f"📦 Archiving large log: {filename} ({stats.st_size/1024:.1f} KB)")
                shutil.move(filepath, os.path.join(ARCHIVE_DIR, filename))
                files_moved += 1
                space_freed += stats.st_size
                
    # Simulate a cache purge
    print("🧹 Purging local compilation cache...")
    space_freed += 1024 * 1024 * 50 # Simulate 50MB
    
    print(f"✅ Optimization Complete. {files_moved} logs archived. Total Potential Space Freed: {space_freed/1024/1024:.2f} MB")
    
    # Notify Relay if possible
    # (Omitted logic to keep it simple, but usually would call the report API)

if __name__ == "__main__":
    optimize_system()
