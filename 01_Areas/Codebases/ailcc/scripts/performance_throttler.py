import os
import psutil
import time
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [PerformanceThrottler] %(message)s")
logger = logging.getLogger(__name__)

# Config: Define heavy AI processes
HEAVY_PROCESSES = ["ollama", "qdrant", "python", "node", "openclaw"] # Python is broad but handles our daemons
PROJECT_ROOT = Path(__file__).resolve().parents[1]

def get_performance_mode():
    return os.getenv("PERFORMANCE_MODE", "BALANCED")

def suppress_load():
    """
    Suppresses heavy processes to preserve hardware for gaming/high-priority tasks.
    In SUPPRESSED mode, we aggressively lower the priority of non-critical AILCC daemons.
    """
    logger.info("⚠️ COMPUTE SUPPRESSION ACTIVE: Prioritizing gaming/hardware stability.")
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            name = proc.info['name'].lower()
            if any(hp in name for hp in HEAVY_PROCESSES):
                # Don't kill, just CPU throttle (Niceness)
                if os.name == 'nt':
                    proc.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
                else:
                    proc.nice(10)
                logger.debug(f"Throttled process: {name} (PID: {proc.info['pid']})")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

def release_load():
    """
    Releases the throttles and allows the AILCC to use 100% of the hardware.
    """
    logger.info("🚀 PEAK PERFORMANCE MODE: Offloading all AI constraints.")
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            name = proc.info['name'].lower()
            if any(hp in name for hp in HEAVY_PROCESSES):
                if os.name == 'nt':
                    proc.nice(psutil.NORMAL_PRIORITY_CLASS)
                else:
                    proc.nice(0)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

def monitor_loop():
    logger.info(f"Performance Throttler Active on node: {os.environ.get('COMPUTERNAME', 'Unknown')}")
    last_mode = "BALANCED"
    
    while True:
        current_mode = get_performance_mode()
        
        if current_mode != last_mode:
            if current_mode == "SUPPRESSED":
                suppress_load()
            elif current_mode == "PEAK":
                release_load()
            
            last_mode = current_mode
            
        # Self-optimization: If CPU > 95% and not gaming, slightly throttle background collectors
        cpu_load = psutil.cpu_percent(interval=1)
        if cpu_load > 95 and current_mode != "PEAK":
            logger.warning(f"High CPU Load ({cpu_load}%). Initiating safety throttle.")
            suppress_load()
            
        time.sleep(10)

if __name__ == "__main__":
    monitor_loop()
