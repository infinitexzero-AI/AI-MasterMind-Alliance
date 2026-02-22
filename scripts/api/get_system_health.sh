#!/bin/bash
# API Helper: Get System Health Status (REFACTORED)
# Returns JSON with current system health metrics

set -uo pipefail # No -e to allow manual error handling

# Helper function to sanitize to a single line number
sanitize_num() {
    local val=$(echo "$1" | tr -d '[:space:]' | head -n 1)
    echo "${val:-0}"
}

# 1. Memory Stats
pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.' | head -n 1 || echo "0")
page_size=$(pagesize | head -n 1 || echo "4096")
free_ram_bytes=$(( $(sanitize_num "$pages_free") * $(sanitize_num "$page_size") ))
free_ram_mb=$((free_ram_bytes / 1024 / 1024))

# 2. Swap Usage
swap_used=$(sysctl vm.swapusage | awk '{print $7}' | tr -d 'M' | head -n 1 || echo "0")
swap_total=$(sysctl vm.swapusage | awk '{print $4}' | tr -d 'M' | head -n 1 || echo "0")
swap_percent=0
if [[ $(echo "$swap_total > 0" | bc) -eq 1 ]]; then
    swap_percent=$(echo "scale=0; ($swap_used / $swap_total) * 100" | bc | head -n 1 || echo "0")
fi

# 3. Status logic
memory_status="healthy"
if [ "$free_ram_mb" -lt 200 ]; then memory_status="critical"
elif [ "$free_ram_mb" -lt 500 ]; then memory_status="warning"
fi
if [ "$swap_percent" -gt 80 ]; then memory_status="critical"; fi

# 4. Process Status
gather_proc() {
    local name="$1"
    local count=$(ps aux | grep -i "$name" | grep -v grep | wc -l | tr -d ' ' | head -n 1 || echo "0")
    local mem=$(ps aux | grep -i "$name" | grep -v grep | awk '{sum+=$6} END {print int(sum/1024)}' | head -n 1 || echo "0")
    echo "$(sanitize_num "$count")|$(sanitize_num "$mem")"
}

ls_pid=$(pgrep -f "language_server" | head -n 1 || echo "0")
ls_data=$(gather_proc "language_server")
docker_data=$(gather_proc "docker")
chrome_data=$(gather_proc "Google Chrome")
anti_data=$(gather_proc "Antigravity Helper")

# 5. Automation Logs
get_last_run() {
    local log="$1"
    [ -f "$log" ] && tail -n 1 "$log" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' | head -n 1 || echo ""
}
m_orch=$(get_last_run "/Users/infinite27/AILCC_PRIME/logs/memory_orchestrator.log")
s_orch=$(get_last_run "/Users/infinite27/AILCC_PRIME/logs/storage_orchestrator.log")
p_mon=$(get_last_run "/Users/infinite27/AILCC_PRIME/logs/process_health.log")

# 6. JSON Export
printf '{\n  "memory": {\n    "freeRAM": %d,\n    "swapUsed": "%s",\n    "swapTotal": "%s",\n    "swapPercent": %d,\n    "status": "%s"\n  },\n  "processes": {\n    "languageServer": {\n      "pid": "%s",\n      "memory": "%sMB",\n      "status": "%s"\n    },\n    "docker": {\n      "memory": "%sMB",\n      "status": "%s"\n    },\n    "chrome": {\n      "count": %d,\n      "memory": "%sMB",\n      "status": "%s"\n    },\n    "antigravity": {\n      "count": %d,\n      "memory": "%sMB",\n      "status": "%s"\n    }\n  },\n  "automation": {\n    "memoryOrchestrator": { "lastRun": "%s", "status": "active" },\n    "storageOrchestrator": { "lastRun": "%s", "status": "active" },\n    "processMonitor": { "lastRun": "%s", "status": "active" }\n  },\n  "timestamp": "%s"\n}\n' \
    "$free_ram_mb" "${swap_used:-0}" "${swap_total:-0}" "$swap_percent" "$memory_status" \
    "$ls_pid" "$(echo "$ls_data" | cut -d'|' -f2)" "$([ "$ls_pid" != "0" ] && echo "running" || echo "stopped")" \
    "$(echo "$docker_data" | cut -d'|' -f2)" "$([ "$(echo "$docker_data" | cut -d'|' -f1)" -gt 0 ] && echo "running" || echo "stopped")" \
    "$(echo "$chrome_data" | cut -d'|' -f1)" "$(echo "$chrome_data" | cut -d'|' -f2)" "$([ "$(echo "$chrome_data" | cut -d'|' -f1)" -gt 0 ] && echo "running" || echo "stopped")" \
    "$(echo "$anti_data" | cut -d'|' -f1)" "$(echo "$anti_data" | cut -d'|' -f2)" "$([ "$(echo "$anti_data" | cut -d'|' -f1)" -gt 0 ] && echo "running" || echo "stopped")" \
    "$m_orch" "$s_orch" "$p_mon" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
