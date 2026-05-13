import os
import subprocess
import time
import requests
from datetime import datetime

# ==============================================================================
# AILCC Browser Delegate Setup (Persistent Profile Strategy)
# ==============================================================================
# Purpose: Launch Google Chrome with a persistent user data directory and
#          remote debugging enabled to allow autonomous agentic control
#          without triggering headless security locks.
# ==============================================================================

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
USER_DATA_DIR = "/Users/infinite27/Library/Application Support/Google/Chrome/AntigravityProfile"
DEBUG_PORT = 9222
LOG_FILE = "/Volumes/XDriveBeta/AILCC_PRIME/logs/browser_delegate.log"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] [BROWSER_DELEGATE] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

def check_existing_instance():
    try:
        response = requests.get(f"http://localhost:{DEBUG_PORT}/json/version", timeout=2)
        if response.status_code == 200:
            log("Existing Chrome debug instance detected.")
            return True
    except:
        pass
    return False

def launch_chrome():
    log(f"Launching Chrome with persistent profile at {USER_DATA_DIR}...")
    
    # Ensure profile directory exists
    os.makedirs(USER_DATA_DIR, exist_ok=True)
    
    cmd = [
        CHROME_PATH,
        f"--remote-debugging-port={DEBUG_PORT}",
        f"--user-data-dir={USER_DATA_DIR}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-client-side-phishing-detection",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-popup-blocking",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--safebrowsing-disable-auto-update",
        "about:blank"
    ]
    
    # Launch as a separate process
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Wait for startup
    for i in range(10):
        time.sleep(1)
        if check_existing_instance():
            log("✅ Chrome Delegate launched successfully.")
            return True
    
    log("❌ Failed to launch Chrome Delegate.")
    return False

if __name__ == "__main__":
    log("Initiating Browser Delegation Sequence...")
    if not check_existing_instance():
        launch_chrome()
    else:
        log("Browser Delegate is already active.")
