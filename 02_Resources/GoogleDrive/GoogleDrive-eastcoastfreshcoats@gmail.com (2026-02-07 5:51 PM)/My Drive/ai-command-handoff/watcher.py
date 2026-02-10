#!/usr/bin/env python3
import time
import os
import sys

# Valentine Watcher - Healing Script
# Purpose: Stop the launchd Errno 2 spam and provide a minimal heartbeat.
# If the original watcher.py is found, it should replace this file.

LOG_FILE = "/Users/infinite27/Desktop/ai-command-handoff/watcher.log"

def main():
    print(f"Valentine Watcher (Healer) started. PID: {os.getpid()}")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{time.ctime()}] Watcher healing protocol active. Monitoring heartbeat...\n")
    
    try:
        while True:
            # Minimal activity to stay alive and satisfy launchd 'KeepAlive'
            time.sleep(300) 
            with open(LOG_FILE, "a") as f:
                f.write(f"[{time.ctime()}] Heartbeat stable.\n")
    except KeyboardInterrupt:
        print("Shutting down...")

if __name__ == "__main__":
    main()
