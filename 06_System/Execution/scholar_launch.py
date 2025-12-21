import webbrowser
import os
import subprocess
import time
import logging

# Configure Logging
log_file = "06_System/Logs/scholar_launch.log"
os.makedirs(os.path.dirname(log_file), exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ScholarLauncher")

# Configuration
SCHOLAR_TABS = [
    "https://scholar.google.com",
    "https://ieeexplore.ieee.org",
    "https://arxiv.org",
    "https://chat.openai.com", 
    "http://localhost:3000/scholar"
]

LOCAL_DOCS = [
    "/Users/infinite27/AILCC_PRIME/01_Areas/Scholar/Study_Plan.md"
]

def launch_scholar_mode():
    logger.info("🎓 Activating Scholar Mode: Deep Focus Protocol...")
    
    # 1. Open Browser Tabs
    for url in SCHOLAR_TABS:
        logger.info(f"   Opening Scout portal: {url}")
        webbrowser.open(url)
        time.sleep(0.5) # Prevent browser overwhelming
        
    # 2. Open Local Documents
    for doc in LOCAL_DOCS:
        if os.path.exists(doc):
            logger.info(f"   Provisioning document: {doc}")
            # Use 'open' command on macOS for default application
            subprocess.run(["open", doc])
        else:
            logger.warning(f"   Document missing: {doc} - Creating placeholder.")
            os.makedirs(os.path.dirname(doc), exist_ok=True)
            with open(doc, 'w') as f:
                f.write("# 🎓 Scholar Study Plan\n\n- [ ] Task 1: Complete literature review.")
            subprocess.run(["open", doc])

    logger.info("✅ Scholar Mode Synchronized. Focus level optimal.")

if __name__ == "__main__":
    launch_scholar_mode()
