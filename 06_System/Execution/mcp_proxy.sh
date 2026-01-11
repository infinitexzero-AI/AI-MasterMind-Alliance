#!/bin/bash
# Localized MCP SuperAssistant Proxy Launcher
# Port: 3006
# Protocol: SSE

ROOT="/Users/infinite27/AILCC_PRIME"
EXEC_DIR="$ROOT/06_System/Execution"
LOG_FILE="$ROOT/06_System/Logs/mcp_proxy.log"

cd "$EXEC_DIR"

echo "Stopping any existing proxy on port 3006..." > "$LOG_FILE"
lsof -ti :3006 | xargs kill -9 2>/dev/null

echo "Starting Localized MCP SuperAssistant Proxy on port 3006..." >> "$LOG_FILE"
# Using the bulletproof aggregate proxy from @leeroy
nohup npx -y @leeroy/mcp-superassistant-proxy --config ./config.json --port 3006 >> "$LOG_FILE" 2>&1 &
PROXY_PID=$!
echo "Proxy launched in background (PID: $PROXY_PID)" >> "$LOG_FILE"

# Verification: Wait a moment and check if PID is still alive
sleep 3
if ps -p $PROXY_PID > /dev/null; then
    echo "✅ MCP Proxy is running on port 3006." >> "$LOG_FILE"
else
    echo "❌ MCP Proxy failed to start or crashed immediately. Check $LOG_FILE for details." >> "$LOG_FILE"
fi
