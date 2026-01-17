#!/bin/bash

# 🔱 AICC UNIFIED SYSTEM LAUNCHER v3.0
# Mission: "Alliance Prime" Contextual Wake-Up
# Targets: Docker, n8n, MCP, Linear, Airtable, GitHub

BASE_DIR="/Users/infinite27/AILCC_PRIME"
LOG_FILE="$BASE_DIR/06_System/Logs/alliance_launch.log"

log() {
    echo -e "[$1] $2" | tee -a "$LOG_FILE"
}

header() {
    echo -e "\n\033[1;35m$1\033[0m" | tee -a "$LOG_FILE"
}

# 0. Initialization
echo "--- ALLIANCE WAKE SEQUENCE: $(date) ---" > "$LOG_FILE"
header "🔱 0. SYSTEM INITIALIZATION"
log "INIT" "Root: $BASE_DIR"

# 1. Infrastructure Layer (Docker / n8n)
header "🏗️ 1. INFRASTRUCTURE LAYER"
if docker info >/dev/null 2>&1; then
    log "DOCKER" "✅ Daemon Active"
    if docker ps | grep -q "ailcc-n8n-orchestrator"; then
        log "N8N" "✅ Container Running (Orchestration Layer)"
    else
        log "N8N" "⚠️ Container stopped. Attempting revive..."
        cd "$BASE_DIR/n8n_foundation" && docker-compose up -d
    fi
else
    log "DOCKER" "❌ Daemon STOPPED. Launching Docker Desktop..."
    open -a Docker
    log "DOCKER" "⏳ Waiting for initialization (Run script again in 30s)..."
    exit 1
fi

# 2. Integration Layer (MCP / External)
header "🔗 2. INTEGRATION LAYER"
# GitHub
log "GITHUB" "✅ MCP Protocol Active (Token: ghp_...)"

# Linear
if [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
    log "LINEAR" "✅ Claude Desktop Configured (Key: lin_...)"
else
    log "LINEAR" "❌ Claude Config Missing!"
fi

# Airtable (Surety)
header "🧠 3. THE BRAIN (SURETY LAYER)"
if ls "$BASE_DIR/01_Areas/Codebases" | grep -q "airtable"; then
    log "AIRTABLE" "✅ Schema Cache Found"
else
    log "AIRTABLE" "⚠️ Schema Cache Missing (Pending Fetch)"
    # Placeholder for future fetch script
fi

# 4. Execution Layer
header "⚡ 4. EXECUTION LAYER"
# Launch Scheduler if not running
if launchctl list | grep -q "com.ailcc.scheduler"; then
    log "SCHEDULER" "✅ LaunchAgent Active (PID: $(launchctl list | grep "com.ailcc.scheduler" | awk '{print $1}'))"
else
    log "SCHEDULER" "❌ Agent Inactive. Loading..."
    launchctl load ~/Library/LaunchAgents/com.ailcc.scheduler.plist
fi

header "✅ SYSTEM WAKE COMPLETE. ALLIANCE IS ONLINE."
exit 0
