#!/bin/bash
# launch_cortex.sh - AILCC Master System Launcher
# Optimized for AILCC Chamber Synergy

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

SAFE_MODE=0
if [[ "$1" == "--safe" ]]; then
    SAFE_MODE=1
fi

# Ensure node/npm are in PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

export BACKEND_API_URL="http://localhost:8000"

BASE_DIR="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc"
cd "$BASE_DIR"

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   🚀  AI MASTERMIND ALLIANCE // FULL SYSTEM ACTIVATION"
echo -e "${CYAN}================================================================${NC}"

# 1. Environment Cleanup
echo -e "${BLUE}[1/5] Cleanup: Purging existing port bindings...${NC}"
lsof -t -i:3000 -i:3002 -i:5005 -i:5006 -i:8000 | xargs kill -9 2>/dev/null || true
sleep 1

# 2. Start Hippocampus (Vector Memory)
echo -e "${BLUE}[2/5] Memory: Activating Vector Store...${NC}"
bash "$BASE_DIR/scripts/start_hippocampus.sh" || echo -e "${BLUE}[Warn] Proceeding without Hippocampus...${NC}"

# 3. Start Infrastructure Layer
echo -e "${BLUE}[3/5] Infra: Starting Neural Relay (Mesh Port 5005/5006) & Valentine Core...${NC}"
/usr/local/bin/node "$BASE_DIR/dashboard/server/relay.js" &
PID_RELAY=$!
RELAY_PORT=5006 /usr/local/bin/node "$BASE_DIR/dashboard/server/relay.js" &
PID_MESH=$!
/usr/local/bin/node "$BASE_DIR/src/valentine/server.js" &
PID_VALENTINE=$!
/usr/local/bin/node "$BASE_DIR/src/automation/mcp-server.js" &
PID_MCP=$!


# 4. Start Mode 6 Autonomous Loop & Daemons
echo -e "${BLUE}[4/5] Brain: Starting Autonomous Ecosystem...${NC}"

if [ $SAFE_MODE -eq 1 ]; then
    echo -e "${YELLOW}🛡️  SAFE MODE ACTIVATED: Daemons in Read-Only State${NC}"
    export AILCC_SAFE_MODE="1"
fi

# Need FastAPI backend for Graph synthesis
echo -e "${BLUE}[4/5] Brain: Starting FastAPI Backend (Port 8000)...${NC}"
python3 -m uvicorn core.server:app --host 0.0.0.0 --port 8000 &
PID_FASTAPI=$!

echo -e "${BLUE}[4/5] Sec: Staggering Ambient Sensor Boots (Lazy Load)...${NC}"
export PYTHONPATH="$BASE_DIR:$PYTHONPATH"
(sleep 15 && exec python3 "$BASE_DIR/automations/integrations/error_monitor_daemon.py") &
PID_SRE=$!

(sleep 20 && exec python3 "$BASE_DIR/automations/integrations/thermal_monitor_daemon.py") &
PID_THERMAL=$!

(sleep 25 && exec python3 "$BASE_DIR/automations/integrations/media_context_daemon.py") &
PID_MEDIA=$!


echo -e "${BLUE}[4/5] Brain: Starting Autonomous Ecosystem...${NC}"
/usr/local/bin/node /usr/local/bin/npx ts-node "$BASE_DIR/automations/mode6/loop.ts" &
PID_LOOP=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/autonomy_optimizer.py" &
PID_OPTIMIZER=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/singularity_engine_daemon.py" &
PID_SINGULARITY=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/vault_archiver.py" &
PID_ARCHIVER=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/forge_verifier.py" &
PID_FORGE=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/alchemist_daemon.py" &
PID_ALCHEMIST=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/forge_backtester.py" &
PID_BACKTESTER=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/legion_provisioner.py" &
PID_LEGION=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/daily_standup_daemon.py" &
PID_STANDUP=$!
export PYTHONPATH="$BASE_DIR:$PYTHONPATH" && python3 "$BASE_DIR/core/inference_bridge.py" & # Ready for agentic calls
PID_BRIDGE=$!
python3 "$BASE_DIR/../../scripts/clipboard/mac_clipboard_sync.py" &
PID_CLIPSYNC=$!
python3 "$BASE_DIR/../../scripts/vanguard/xbox_telemetry.py" &
PID_XBOX=$!

# 5. Start Nexus Dashboard
echo -e "${BLUE}[5/5] UI: Launching Nexus Dashboard (Port 3000)...${NC}"
cd "$BASE_DIR/dashboard"
/usr/local/bin/node /usr/local/bin/npm run dev &
PID_DASH=$!

cleanup() {
    echo -e "\n${BLUE}[AILCC] Systematic shutdown initiated...${NC}"
    kill $PID_RELAY $PID_MESH $PID_VALENTINE $PID_MCP $PID_LOOP $PID_DASH $PID_OPTIMIZER $PID_SINGULARITY $PID_ARCHIVER $PID_BRIDGE $PID_FORGE $PID_ALCHEMIST $PID_BACKTESTER $PID_LEGION $PID_STANDUP $PID_FASTAPI $PID_CLIPSYNC $PID_XBOX $PID_SRE $PID_THERMAL $PID_MEDIA 2>/dev/null
    echo -e "${GREEN}✓ All processes terminated.${NC}"
    exit
}

trap cleanup SIGINT

echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}✅ SYSTEM FULLY OPERATIONAL (MESH ACTIVE)${NC}"
echo -e "Dashboard: ${BLUE}http://localhost:3000${NC}"
echo -e "Relay (1): ${BLUE}http://localhost:5005${NC}"
echo -e "Relay (2): ${BLUE}http://localhost:5006${NC}"
echo -e "Loop:      ${BLUE}Active (Mode 6)${NC}"
echo -e "Archiver:  ${BLUE}Proactive [SSD Safety]${NC}"
echo -e "${CYAN}================================================================${NC}"

# Launch Native Mastermind UI
echo -e "${GREEN}🚀 Launching Nexus in Comet Browser...${NC}"
open -a "Comet" "http://localhost:3000/antigravity" || open "http://localhost:3000/antigravity"

# Keep alive
wait

