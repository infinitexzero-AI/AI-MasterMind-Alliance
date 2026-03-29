#!/bin/bash

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_GENERATOR="$SCRIPT_DIR/generate_superassistant_config.py"
SUPERASSISTANT_CONFIG="$PROJECT_ROOT/superassistant_config.json"
PORT=3006

echo "🚀 Starting MCP Superassistant Bridge..."

# 1. Generate/Refresh Configuration
echo "🔄 Syncing configuration from Claude Desktop..."
python3 "$CONFIG_GENERATOR"
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate configuration."
    exit 1
fi

# 2. Check for port conflict
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT is already in use. Attempting to kill existing process..."
    lsof -Pi :$PORT -sTCP:LISTEN -t | xargs kill -9
    echo "✅ Freed port $PORT"
fi

# 3. Launch Proxy
echo "🔌 Launching Superassistant Proxy on port $PORT..."
echo "---------------------------------------------------"
echo "You can now connect your Browser Extension (Comet/Chrome) to:"
echo "ws://localhost:$PORT"
echo "---------------------------------------------------"

# Using npx to run the proxy interactively
# We assume node is available in the environment
npx -y @srbhptl39/mcp-superassistant-proxy@latest --config "$SUPERASSISTANT_CONFIG" --port $PORT
