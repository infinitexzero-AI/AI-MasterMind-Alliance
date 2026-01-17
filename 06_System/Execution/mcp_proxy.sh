#!/bin/bash
# Localized MCP SuperAssistant Proxy Launcher (v2.0 - Circuit Breaker Edition)
# Port: 3006
# Protocol: SSE

ROOT="/Users/infinite27/AILCC_PRIME"
EXEC_DIR="$ROOT/06_System/Execution"
LOG_FILE="$ROOT/06_System/Logs/mcp_proxy.log"
BREAKER_FILE="/tmp/mcp_proxy_breaker"
FAILURE_THRESHOLD=5
MAX_RETRIES=10
RETRY_COUNT=0

cd "$EXEC_DIR"

echo "--- MCP Proxy Session Start: $(date) ---" >> "$LOG_FILE"

# Clean up existing processes
lsof -ti :3006 | xargs kill -9 2>/dev/null

# Circuit Breaker Logic
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if [ -f "$BREAKER_FILE" ]; then
        echo "⚠️ Circuit Breaker ACTIVE. Waiting 30s before retry..." >> "$LOG_FILE"
        sleep 30
        rm "$BREAKER_FILE"
    fi

    echo "🚀 Launching MCP Proxy (Attempt $((RETRY_COUNT + 1)))..." >> "$LOG_FILE"
    export UNDICI_SET_SOCKET_TIMEOUT=60000
    nohup npx -y @leeroy/mcp-superassistant-proxy --config ./config.json --port 3006 --max-backoff 5000 >> "$LOG_FILE" 2>&1 &
    PROXY_PID=$!
    
    sleep 5
    if ps -p $PROXY_PID > /dev/null; then
        echo "✅ Proxy stable (PID: $PROXY_PID)." >> "$LOG_FILE"
        # In a real daemon, we might wait $PROXY_PID, but here we let it run in background
        exit 0
    else
        echo "❌ Proxy crashed." >> "$LOG_FILE"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -ge $FAILURE_THRESHOLD ]; then
            echo "🚨 Threshold reached. Tripping breaker." >> "$LOG_FILE"
            touch "$BREAKER_FILE"
            RETRY_COUNT=0
        fi
    fi
    sleep 5
done
