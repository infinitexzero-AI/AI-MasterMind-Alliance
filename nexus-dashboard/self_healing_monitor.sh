#!/bin/bash

# AILCC Nexus Dashboard — Proactive Monitoring & Self-Healing Script
# Author: Antigravity
# Description: Monitors the dashboard health and triggers OpenClaw for repairs.

DASHBOARD_URL="http://localhost:3000/api/system/health"
OPENCLAW_AGENT="main"
LOG_FILE="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/self_healing.log"

echo "[$(date)] Starting Proactive Observation..." >> "$LOG_FILE"

# 1. Heartbeat Check
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$DASHBOARD_URL")

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "[$(date)] ⚠️ Dashboard Unreachable (Status: $HTTP_STATUS). Attempting Restart..." >> "$LOG_FILE"
    cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard
    npm run dev > /dev/null 2>&1 &
    sleep 10
    
    # 2. Trigger OpenClaw if restart fails or for deep audit
    openclaw agent --agent "$OPENCLAW_AGENT" --message "The Nexus Dashboard appears to be down or returning status $HTTP_STATUS. Please use your browser skills to navigate to http://localhost:3000/observability, verify the environment, and fix any React or Node.js errors you find in ~/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard." >> "$LOG_FILE" 2>&1
else
    echo "[$(date)] ✅ Dashboard Healthy. Heartbeat confirmed." >> "$LOG_FILE"
fi

# 3. OpenClaw Skills Integrity Check
echo "[$(date)] Refreshing OpenClaw Intelligence Matrix..." >> "$LOG_FILE"
openclaw skills check >> "$LOG_FILE" 2>&1
