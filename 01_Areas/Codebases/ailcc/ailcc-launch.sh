#!/bin/bash

# Progress spinner function
show_progress() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while ps -p $pid > /dev/null 2>&1; do
        local temp=${spinstr#?}
        printf " [%c] %s" "$spinstr" "$2"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\r"
    done
    printf "    \r"
}

# Status logger
log_status() {
    echo "[$(date '+%H:%M:%S')] ⚡ $1" | tee -a ~/antigravity.log
}

log_status "AILCC Chamber Initiating..."
log_status "Loading Spellbook Abilities..."

# Run Quick Diagnostics
python3 /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/scripts/full_diagnostics.py

# Launch with heartbeat
# Using absolute path to relay.js
node /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/server/relay.js & 
RELAY_PID=$!
show_progress $RELAY_PID "Anti-Gravity Relay Spinning Up"

log_status "✓ Relay Active (PID: $RELAY_PID)"
log_status "✓ Heartbeat Endpoint: http://localhost:3001/api/comet/heartbeat"
log_status "✓ Browser Orchestration: Triggering Antigravity Subagent..."
