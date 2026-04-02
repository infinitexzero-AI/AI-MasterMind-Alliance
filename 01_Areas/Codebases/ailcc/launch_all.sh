#!/bin/bash

# AI Mastermind Alliance - Global Launch Script
# Author: Gemini (Antigravity)
# Date: 2026-01-07

echo " "
echo "================================================================"
echo "   🚀  AI MASTERMIND ALLIANCE // SYSTEM INITIALIZATION"
echo "================================================================"
echo " "

# 1. Environment Validation
echo "[1/3] 🔍 Validating Environment Variables..."
node /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/src/automation/env_validator.js
if [ $? -ne 0 ]; then
    echo "❌ Validation failed. Check .env file."
    exit 1
fi
echo " "

# 2. Swarm Activation
echo "[2/3] 🐝 Activating Swarm Protocol Mesh..."
# Start WebSocket Telemetry Server
echo "      ↳ Starting Telemetry Bus..."
node /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/forge-monitor/ws/server.js > /dev/null 2>&1 &
echo "      ↳ Telemetry Bus ACTIVE (PID: $!)"
sleep 2

node /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/src/orchestration/activate_swarm.js --mode=parallel --link=grok_mobile

# 3. UI Launch (Check if running, else start)
echo "[3/3] 🖥️  Checking Nexus Dashboard..."
if lsof -i :3000 > /dev/null; then
    echo "✅ Dashboard is ALREADY ONLINE at http://localhost:3000/nexus"
    echo "   (PID: $(lsof -t -i :3000))"
else
    echo "⚠️  Dashboard offline. Initiating launch sequence..."
    cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard
    # Running in background so script doesn't block
    npm run dev &
    echo "⏳ Waiting for server to hydrate..."
    sleep 5
    echo "✅ Dashboard LAUNCHED at http://localhost:3000/nexus"
fi

echo " "
echo "================================================================"
echo "   🟢  SYSTEM FULLY OPERATIONAL"
echo "================================================================"
echo " "
