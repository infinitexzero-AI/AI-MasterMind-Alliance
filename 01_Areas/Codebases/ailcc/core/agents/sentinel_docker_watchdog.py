#!/usr/bin/env python3
import os
import subprocess
import time
import logging

"""
SENTINEL DOCKER WATCHDOG DAEMON (Phase 28 Stability Fix)

Origin: AIMmA Strategic Foresight Matrix 2026
Purpose: The Port 3001 Dashboard Container periodically encounters physical 
memory limits on the MacOS host, causing System crash loops during heavy RAG indexing.
This Vanguard Agent continuously polls the `docker stats` payload. If the Node.js 
container consumes excessive raw RAM or dead caches pile up, it executes a forced
Linux `cgroups` prune and container restart independently.
"""

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SENTINEL-WATCHDOG] %(levelname)s: %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("/tmp/aimma_sentinel.log")]
)

POLL_INTERVAL_SEC = 300  # Check every 5 minutes
MEMORY_LIMIT_MB = 2048   # 2GB explicit threshold for the UI Container

def get_docker_memory_usage(container_name="ailcc_dashboard_dev"):
    try:
        # returns physical MB used e.g. "1200.5"
        result = subprocess.run(
            ["docker", "stats", "--no-stream", "--format", "{{.MemUsage}}", container_name],
            capture_output=True, text=True, check=True
        )
        usage_str = result.stdout.strip()
        if not usage_str: return 0.0
        
        # Parse output like "1.234GiB / 4GiB" or "500MiB / 4GiB"
        usage = usage_str.split(" / ")[0]
        if "GiB" in usage:
            return float(usage.replace("GiB", "")) * 1024
        elif "MiB" in usage:
            return float(usage.replace("MiB", ""))
        return 0.0
    except Exception as e:
        logging.error(f"Failed to extract memory payload for {container_name}: {e}")
        return 0.0

def execute_prune_protocol():
    logging.warning("Initiating absolute Docker Cache Culling protocol...")
    subprocess.run(["docker", "system", "prune", "-f"], capture_output=True)
    subprocess.run(["docker", "volume", "prune", "-f"], capture_output=True)
    logging.info("Dangling Image / Volume caches successfully immolated.")

def execute_container_restart(container_name="ailcc_dashboard_dev"):
    logging.critical(f"Container {container_name} exceeded memory limits. Executing physical restart.")
    subprocess.run(["docker", "restart", container_name], capture_output=True)
    logging.info("Next.js Port 3001 environment rebooted and memory released.")

def sentinel_loop():
    logging.info("Sentinel Docker Watchdog Active. Monitoring limits.")
    while True:
        mem_usage = get_docker_memory_usage()
        logging.info(f"Dashboard Matrix Memory: {mem_usage:.2f} MiB")
        
        if mem_usage > MEMORY_LIMIT_MB:
            execute_prune_protocol()
            execute_container_restart()
            
        # Optional: Prune unused containers every 24h regardless of mem leaks.
        time.sleep(POLL_INTERVAL_SEC)

if __name__ == "__main__":
    sentinel_loop()
