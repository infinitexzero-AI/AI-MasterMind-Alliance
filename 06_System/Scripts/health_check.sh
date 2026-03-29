#!/bin/bash
# AILCC Protocol Alpha - System Health Watchdog
# Monitors critical services and disk space

LOG_FILE="/Users/infinite27/AILCC_PRIME/logs/system_health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 1. Check Disk Space
FREE_DISK=$(df -h /System/Volumes/Data | awk 'NR==2 {print $4}' | sed 's/Gi//')
if (( $(echo "$FREE_DISK < 5" | bc -l) )); then
    echo "[$DATE] CRITICAL: Disk space low ($FREE_DISK Gi)" >> "$LOG_FILE"
fi

# 2. Check remoted service
REMOTED_COUNT=$(ps aux | grep -c "[r]emoted")
if [ "$REMOTED_COUNT" -eq 0 ]; then
    echo "[$DATE] WARNING: remoted service is not running" >> "$LOG_FILE"
fi

# 3. Check Memory Pressure (simple check)
COMPRESSED=$(vm_stat | grep "occupied by compressor" | awk '{print $5}' | sed 's/\.//')
if [ "$COMPRESSED" -gt 500000 ]; then
    echo "[$DATE] INFO: High memory pressure detected" >> "$LOG_FILE"
fi

# 4. Update status.json (New)
STATUS_JSON="/Users/infinite27/AILCC_PRIME/status.json"
if [ -f "$STATUS_JSON" ]; then
    # Use jq to update available_gb and last_check
    # Note: Using temporary file for safe write
    jq --arg gb "$FREE_DISK" --arg date "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
       '.available_gb = ($gb | tonumber) | .last_check = $date' "$STATUS_JSON" > "${STATUS_JSON}.tmp" && mv "${STATUS_JSON}.tmp" "$STATUS_JSON"
fi

echo "[$DATE] Heartbeat: Disk=${FREE_DISK}Gi | remoted=${REMOTED_COUNT}" >> "$LOG_FILE"
