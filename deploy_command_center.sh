#!/bin/bash

# ==============================================================================
# AI Command Center - Deployment Script
# ==============================================================================
# Phase 6 Deployment: Launches FastAPI Backend & Next.js Frontend
# Prerequisite: Storage Health Check (Exit 0 or 1)
# ==============================================================================

SERVER_PORT=8000
FRONTEND_PORT=3000
BASE_DIR="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc"
DASH_DIR="$BASE_DIR/dashboard"
API_DIR="$DASH_DIR/pages/api"
INSPECTOR="$HOME/AILCC_PRIME/00_Projects/Orchestration_Hub/protocols/protocol_inspector.py"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Initializing AI Command Center Deployment...${NC}"

# 1. Health Gate
echo -e "\n${YELLOW}[Step 1] Verifying System Health...${NC}"
if [ ! -f "$INSPECTOR" ]; then
    echo -e "${RED}❌ Error: Protocol Inspector not found at $INSPECTOR${NC}"
    exit 1
fi

$INSPECTOR --action check_health
HEALTH_CODE=$?

if [ $HEALTH_CODE -eq 2 ]; then
    echo -e "${RED}🛑 BLOCKER: System in RED State (<10% Free). Deployment Aborted.${NC}"
    echo -e "Please run cleanup or check offload status."
    exit 2
else
    echo -e "${GREEN}✅ Health Check Passed (Code: $HEALTH_CODE). Proceeding.${NC}"
fi

# 2. Nexus Dashboard & Neural Relay
echo -e "\n${YELLOW}[Step 2] Launching Nexus Dashboard & Neural Relay...${NC}"
if [ -d "$DASH_DIR" ]; then
    cd "$DASH_DIR"
    echo "Starting services via start_dashboard.sh..."
    nohup bash start_dashboard.sh > dashboard_launch.log 2>&1 &
    DASH_PID=$!
    echo -e "${GREEN}✅ Dashboard Services launched in background (PID: $DASH_PID).${NC}"
else
    echo -e "${RED}❌ Dashboard Directory missing!${NC}"
    exit 1
fi

echo -e "\n${GREEN}==============================================${NC}"
echo -e "   🎉 Command Center Deployed Successfully!"
echo -e "   Health Status: GREEN/YELLOW"
echo -e "   Backend API:   http://localhost:$SERVER_PORT"
echo -e "   Frontend UI:   http://localhost:$FRONTEND_PORT"
echo -e "${GREEN}==============================================${NC}"
