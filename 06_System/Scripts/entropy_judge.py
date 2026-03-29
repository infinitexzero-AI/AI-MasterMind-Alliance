import os
import time
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format="%(asctime)s [ENTROPY-JUDGE] %(message)s")

PRIME_DIR = "/Users/infinite27/AILCC_PRIME"
LOG_DIR = os.path.join(PRIME_DIR, "logs")
STALE_THRESHOLD_DAYS = 7
LARGE_LOG_THRESHOLD_MB = 50

def analyze_stale_logs():
    """Finds and optionally archives/deletes logs that haven't been touched recently."""
    if not os.path.exists(LOG_DIR):
        logging.info(f"Log directory {LOG_DIR} does not exist. Skipping log scan.")
        os.makedirs(LOG_DIR, exist_ok=True)
        return

    now = datetime.now()
    stale_count = 0
    large_count = 0
    
    for root, _, files in os.walk(LOG_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                stat = os.stat(file_path)
                mtime = datetime.fromtimestamp(stat.st_mtime)
                size_mb = stat.st_size / (1024 * 1024)
                
                # Check for absolute staleness
                if (now - mtime).days > STALE_THRESHOLD_DAYS:
                    logging.warning(f"[STALE] Log untouched for > {STALE_THRESHOLD_DAYS} days: {file_path}")
                    stale_count += 1
                    
                # Check for extreme size bloat
                if size_mb > LARGE_LOG_THRESHOLD_MB:
                    logging.warning(f"[BLOAT] Log file has grown too large ({size_mb:.1f} MB): {file_path}")
                    large_count += 1
            except Exception as e:
                logging.error(f"Error reading file stat {file_path}: {e}")

    if stale_count == 0 and large_count == 0:
        logging.info("System Entropy is low. Logs are clean and actively rotating.")
    else:
        logging.info(f"Detecting System Entropy: {stale_count} stale logs, {large_count} bloated logs.")

def scan_dead_code():
    """Deep inspection for unused components, mocked endpoints, or deprecated flags."""
    # Searching specifically in the Dashboard UI for unused imports/files
    dashboard_dir = os.path.join(PRIME_DIR, "01_Areas", "Codebases", "ailcc", "dashboard")
    dead_flags = 0
    
    if not os.path.exists(dashboard_dir):
        return
        
    for root, _, files in os.walk(dashboard_dir):
        # Skip node_modules and .next directories
        if 'node_modules' in root or '.next' in root:
            continue
            
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        for i, line in enumerate(lines):
                            if "TODO:" in line.upper() or "FIXME:" in line.upper():
                                logging.warning(f"[TECHNICAL_DEBT] Flagged in {file}:{i+1} -> {line.strip()}")
                                dead_flags += 1
                            if "console.log" in line and not line.strip().startswith("//"):
                                logging.warning(f"[ENTROPY_LEAK] Active console.log in UI code: {file}:{i+1}")
                                dead_flags += 1
                except Exception:
                    pass
                    
    logging.info(f"Codebase scan complete. {dead_flags} indicators of systemic entropy or debt found.")

def run_judge_cycle():
    logging.info("Court is in Session. Scanning AILCC ecosystem for entropy...")
    analyze_stale_logs()
    scan_dead_code()
    logging.info("Judgment passed. Waiting for next cycle.")

if __name__ == "__main__":
    run_judge_cycle()
