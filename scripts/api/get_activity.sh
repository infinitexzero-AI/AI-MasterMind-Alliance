#!/bin/bash
# API Helper: Get Recent Activity from Automation Logs
# Returns JSON with recent automation activity

set -euo pipefail

LOG_DIR="$HOME/AILCC_PRIME/logs"
MAX_EVENTS=10

# Function to parse log entry
parse_log_entry() {
    local log_file=$1
    local type=$2
    
    if [ ! -f "$log_file" ]; then
        return
    fi
    
    # Get last few entries
    tail -20 "$log_file" | while IFS= read -r line; do
        # Extract timestamp if present
        timestamp=$(echo "$line" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' || echo "")
        
        # Determine severity
        severity="info"
        if echo "$line" | grep -qi "critical"; then
            severity="critical"
        elif echo "$line" | grep -qi "warning"; then
            severity="warning"
        fi
        
        # Extract action
        action=$(echo "$line" | sed 's/.*- //' | head -c 100)
        
        if [ -n "$timestamp" ] && [ -n "$action" ]; then
            echo "$timestamp|$type|$severity|$action"
        fi
    done
}

# Collect activities
activities=""

# Memory orchestrator
if [ -f "$LOG_DIR/memory_orchestrator.log" ]; then
    activities+=$(parse_log_entry "$LOG_DIR/memory_orchestrator.log" "memory_orchestrator")
    activities+=$'\n'
fi

# Storage orchestrator
if [ -f "$LOG_DIR/storage_orchestrator.log" ]; then
    activities+=$(parse_log_entry "$LOG_DIR/storage_orchestrator.log" "storage_orchestrator")
    activities+=$'\n'
fi

# Process health monitor
if [ -f "$LOG_DIR/process_health.log" ]; then
    activities+=$(parse_log_entry "$LOG_DIR/process_health.log" "process_monitor")
    activities+=$'\n'
fi

# Convert to JSON
echo "{"
echo "  \"activities\": ["

first=true
echo "$activities" | grep -v '^$' | sort -r | head -$MAX_EVENTS | while IFS='|' read -r timestamp type severity action; do
    if [ "$first" = true ]; then
        first=false
    else
        echo ","
    fi
    
    cat <<EOF
    {
      "timestamp": "$timestamp",
      "type": "$type",
      "severity": "$severity",
      "action": "$action"
    }
EOF
done

echo ""
echo "  ],"
echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""
echo "}"
