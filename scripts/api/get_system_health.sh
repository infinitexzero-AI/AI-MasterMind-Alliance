#!/bin/bash
# API Helper: Get System Health Status
# Returns JSON with current system health metrics

set -euo pipefail

# Get memory stats
pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
page_size=$(pagesize)
free_ram_bytes=$((pages_free * page_size))
free_ram_mb=$((free_ram_bytes / 1024 / 1024))

# Get swap usage
swap_used=$(sysctl vm.swapusage | awk '{print $7}' | tr -d 'M')
swap_total=$(sysctl vm.swapusage | awk '{print $4}' | tr -d 'M')
swap_percent=0
if [ "$swap_total" != "0.00" ] && [ -n "$swap_total" ]; then
    swap_percent=$(echo "scale=0; ($swap_used / $swap_total) * 100" | bc)
fi

# Determine memory status
memory_status="healthy"
if [ "$free_ram_mb" -lt 200 ]; then
    memory_status="critical"
elif [ "$free_ram_mb" -lt 500 ]; then
    memory_status="warning"
fi

if [ "$swap_percent" -gt 80 ]; then
    memory_status="critical"
fi

# Get process stats
language_server_pid=$(pgrep -f "language_server" | head -1 || echo "")
if [ -n "$language_server_pid" ]; then
    language_server_mem=$(ps -p "$language_server_pid" -o rss= 2>/dev/null | awk '{print int($1/1024)}' || echo "0")
    language_server_status="running"
else
    language_server_mem="0"
    language_server_status="stopped"
fi

docker_mem=$(ps aux | grep -i docker | grep -v grep | awk '{sum+=$6} END {print int(sum/1024)}' || echo "0")
docker_status="stopped"
if [ "$docker_mem" -gt 0 ]; then
    docker_status="running"
fi

chrome_count=$(ps aux | grep -i "Google Chrome" | grep -v grep | wc -l | tr -d ' ')
chrome_mem=$(ps aux | grep -i "Google Chrome" | grep -v grep | awk '{sum+=$6} END {print int(sum/1024)}' || echo "0")
chrome_status="healthy"
if [ "$chrome_count" -gt 30 ]; then
    chrome_status="warning"
fi

antigravity_count=$(ps aux | grep -i "Antigravity Helper" | grep -v grep | wc -l | tr -d ' ')
antigravity_mem=$(ps aux | grep -i "Antigravity Helper" | grep -v grep | awk '{sum+=$6} END {print int(sum/1024)}' || echo "0")
antigravity_status="healthy"
if [ "$antigravity_count" -gt 10 ]; then
    antigravity_status="warning"
fi

# Get automation status
memory_orch_log="/Users/infinite27/AILCC_PRIME/logs/memory_orchestrator.log"
storage_orch_log="/Users/infinite27/AILCC_PRIME/logs/storage_orchestrator.log"
process_mon_log="/Users/infinite27/AILCC_PRIME/logs/process_health.log"

memory_orch_last=""
storage_orch_last=""
process_mon_last=""

if [ -f "$memory_orch_log" ]; then
    memory_orch_last=$(tail -1 "$memory_orch_log" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' || echo "")
fi

if [ -f "$storage_orch_log" ]; then
    storage_orch_last=$(tail -1 "$storage_orch_log" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' || echo "")
fi

if [ -f "$process_mon_log" ]; then
    process_mon_last=$(tail -1 "$process_mon_log" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' || echo "")
fi

# Output JSON
cat <<EOF
{
  "memory": {
    "freeRAM": $free_ram_mb,
    "swapUsed": "$swap_used",
    "swapTotal": "$swap_total",
    "swapPercent": $swap_percent,
    "status": "$memory_status"
  },
  "processes": {
    "languageServer": {
      "pid": "$language_server_pid",
      "memory": "${language_server_mem}MB",
      "status": "$language_server_status"
    },
    "docker": {
      "memory": "${docker_mem}MB",
      "status": "$docker_status"
    },
    "chrome": {
      "count": $chrome_count,
      "memory": "${chrome_mem}MB",
      "status": "$chrome_status"
    },
    "antigravity": {
      "count": $antigravity_count,
      "memory": "${antigravity_mem}MB",
      "status": "$antigravity_status"
    }
  },
  "automation": {
    "memoryOrchestrator": {
      "lastRun": "$memory_orch_last",
      "status": "active"
    },
    "storageOrchestrator": {
      "lastRun": "$storage_orch_last",
      "status": "active"
    },
    "processMonitor": {
      "lastRun": "$process_mon_last",
      "status": "active"
    }
  },
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
