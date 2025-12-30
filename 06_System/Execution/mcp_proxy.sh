#!/bin/bash
# Localized MCP SuperAssistant Proxy Launcher
# Port: 3006
# Protocol: SSE

ROOT="/Users/infinite27/AILCC_PRIME"
EXEC_DIR="$ROOT/06_System/Execution"
LOG_FILE="$ROOT/06_System/Logs/mcp_proxy.log"
PROXY_BIN="/Users/infinite27/.npm/_npx/63cc4b2a7e73c390/node_modules/.bin/mcp-superassistant-proxy"

cd "$EXEC_DIR"

echo "Stopping any existing proxy on port 3006..." > "$LOG_FILE"
lsof -ti :3006 | xargs kill -9 2>/dev/null

echo "Starting Localized MCP SuperAssistant Proxy on port 3006..." >> "$LOG_FILE"
nohup "$PROXY_BIN" --config ./config.json --outputTransport sse >> "$LOG_FILE" 2>&1 &
echo "Proxy launched in background (PID: $!)" >> "$LOG_FILE"
