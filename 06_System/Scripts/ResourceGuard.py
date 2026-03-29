#!/usr/bin/env python3
import os
import shutil
import subprocess
import time
import argparse
import logging
from datetime import datetime

# Configuration
MIN_DISK_GB = 10.0
MAX_DOCKER_RAW_GB = 40.0
DOCKER_RAW_PATH = os.path.expanduser("~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ResourceGuard:
    def __init__(self):
        self.initial_usage = self.get_free_gb()

    def get_free_gb(self):
        total, used, free = shutil.disk_usage("/")
        return free / (1024**3)

    def run_command(self, cmd, shell=False):
        try:
            subprocess.run(cmd, shell=shell, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return True
        except Exception as e:
            logging.error(f"Command failed: {cmd} - {str(e)}")
            return False

    def clean_zombies(self):
        logging.info("🔱 Executing Zombie Cleanup Protocol...")
        # Chrome/Puppeteer processes
        self.run_command(["pkill", "-9", "-f", "Google Chrome"], shell=False)
        self.run_command(["pkill", "-9", "-f", "puppeteer"], shell=False)
        # Orphaned Node workers
        self.run_command("ps aux | grep node | grep -E '(playwright|puppeteer|browserless)' | grep -v grep | awk '{print $2}' | xargs kill -9", shell=True)
        logging.info("   ✓ Zombie sweep complete.")

    def clean_safe(self):
        logging.info("🧹 Executing Safe Cleanup Protocol...")
        
        # 1. Empty Trash
        trash_path = os.path.expanduser("~/.Trash")
        if os.path.exists(trash_path):
            self.run_command(f"rm -rf {trash_path}/*", shell=True)
        
        # 2. System Caches
        caches_path = os.path.expanduser("~/Library/Caches")
        if os.path.exists(caches_path):
            self.run_command(f"rm -rf {caches_path}/*", shell=True)

        # 3. Chrome Caches
        chrome_cache = os.path.expanduser("~/Library/Application Support/Google/Chrome/Default/Cache")
        if os.path.exists(chrome_cache):
            self.run_command(f"rm -rf \"{chrome_cache}\"/*", shell=True)

        # 4. Docker Prune
        if shutil.which("docker"):
            logging.info("🐳 Pruning Docker systems...")
            self.run_command(["docker", "system", "prune", "-af", "--volumes"], shell=False)

        # 5. App specific caches
        apps = ["zoom.us/Cache", "Mail"]
        for app in apps:
            app_path = os.path.expanduser(f"~/Library/Application Support/{app}")
            if os.path.exists(app_path):
                self.run_command(f"rm -rf \"{app_path}\"/*", shell=True)

        logging.info("   ✓ Safe cleanup complete.")

    def clean_aggressive(self):
        logging.info("☢️ WARNING: Initiating Aggressive Cleanup (Docker VM Reset)...")
        self.clean_safe()
        
        if os.path.exists(DOCKER_RAW_PATH):
            logging.info("   Stopping Docker Desktop...")
            self.run_command(["osascript", "-e", 'quit app "Docker"'], shell=False)
            time.sleep(5)
            logging.info(f"   Removing {DOCKER_RAW_PATH}...")
            os.remove(DOCKER_RAW_PATH)
            logging.info("   ✓ Docker VM reset. Please restart Docker Desktop manualy.")
        else:
            logging.info("   Docker.raw not found, skipping reset.")

    def monitor(self):
        logging.info(f"🕵️ ResourceGuard Monitoring Active: {datetime.now()}")
        free_gb = self.get_free_gb()
        logging.info(f"   Internal SSD: {free_gb:.2f} GB free")

        if free_gb < MIN_DISK_GB:
            logging.warning(f"   Disk space critical ({free_gb:.2f}GB)! Auto-triggering safe cleanup...")
            self.clean_zombies()
            self.clean_safe()
        
        if os.path.exists(DOCKER_RAW_PATH):
            docker_size_gb = os.path.getsize(DOCKER_RAW_PATH) / (1024**3)
            logging.info(f"   Docker.raw size: {docker_size_gb:.2f} GB")
            if docker_size_gb > MAX_DOCKER_RAW_GB:
                logging.warning(f"   Docker.raw is bloated ({docker_size_gb:.2f}GB).")

    def report_savings(self):
        final_usage = self.get_free_gb()
        freed = final_usage - self.initial_usage
        logging.info(f"✨ Solidification complete. Freed {freed:.2f} GB.")

def main():
    parser = argparse.ArgumentParser(description="ResourceGuard: Unified AIMmA Health Service")
    parser.add_argument("--safe", action="store_true", help="Run safe cleanup")
    parser.add_argument("--zombie", action="store_true", help="Run zombie process cleanup")
    parser.add_argument("--aggressive", action="store_true", help="Run aggressive cleanup (reset Docker)")
    parser.add_argument("--monitor", action="store_true", help="Run resource monitoring check")
    parser.add_argument("--daemon", type=int, help="Run as daemon with specified interval (seconds)")
    
    args = parser.parse_args()
    guard = ResourceGuard()

    if args.zombie:
        guard.clean_zombies()
    
    if args.safe:
        guard.clean_safe()
        guard.report_savings()

    if args.aggressive:
        guard.clean_aggressive()
        guard.report_savings()

    if args.monitor:
        guard.monitor()

    if args.daemon:
        logging.info(f"🚀 ResourceGuard Daemon started (Interval: {args.daemon}s)")
        while True:
            guard.monitor()
            time.sleep(args.daemon)

    if not any(vars(args).values()):
        parser.print_help()

if __name__ == "__main__":
    main()
