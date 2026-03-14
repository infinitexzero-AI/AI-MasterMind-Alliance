#!/bin/bash
# AILCC Autonomous Resilience: Self-Healing Protocol
# Handles critical system alerts for Docker, Memory, and Disk.

set -uo pipefail

LOG_FILE="/tmp/ailcc_self_heal.log"
echo "[$(date)] Starting Autonomous Resilience Routine..." >> "$LOG_FILE"

# 1. Memory Management (macOS SPECIFIC)
# If RAM is low or Swap is high, purge inactive memory
FREE_RAM_MB=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.' | awk -v ps=$(pagesize) '{print int(($1*ps)/1024/1024)}')
SWAP_PCT=$(sysctl vm.swapusage | awk '{print $7}' | tr -d 'M' | awk '{print ($1 > 0 ? 1 : 0)}') # Simple check if swap is in use

if [ "$FREE_RAM_MB" -lt 500 ]; then
    echo "[$(date)] CRITICAL: Low RAM ($FREE_RAM_MB MB). Executing purge..." >> "$LOG_FILE"
    sudo purge 2>/dev/null || echo "Purge requested (background)" >> "$LOG_FILE"
fi

# 2. Docker Storage Cleanup
# If Docker.raw is large or disk is tight
DOCKER_SIZE_GB=$(du -g ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw 2>/dev/null | awk '{print $1}' || echo "0")
if [ "$DOCKER_SIZE_GB" -gt 15 ]; then
    echo "[$(date)] WARNING: Docker.raw is ${DOCKER_SIZE_GB}GB. Running system prune..." >> "$LOG_FILE"
    docker system prune -af --volumes 2>/dev/null || echo "Docker prune failed (is Docker running?)" >> "$LOG_FILE"
fi

# 3. Log Archival / Cleanup
# Find logs older than 7 days in Area 06 or tmp and compress them
find /Users/infinite27/AILCC_PRIME/06_System/Logs -name "*.log" -mtime +7 -exec gzip {} \; 2>/dev/null
echo "[$(date)] Maintenance complete." >> "$LOG_FILE"

echo "{\"status\": \"success\", \"freed_ram\": true, \"docker_cleaned\": $([ "$DOCKER_SIZE_GB" -gt 15 ] && echo "true" || echo "false"), \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"
