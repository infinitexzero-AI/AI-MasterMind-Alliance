#!/bin/bash

# Configuration
VALENTINE_DIR="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc"
LOG_FILE="$VALENTINE_DIR/src/valentine/valentine.log"

echo "❤️  Initializing Valentine Core..."
cd "$VALENTINE_DIR"

# Install dependencies if missing (basic check)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Kill existing instance if any
pkill -f "node src/valentine/server.js" || true

# Start Server
echo "🚀 Launching Valentine Server..."
nohup node src/valentine/server.js > "$LOG_FILE" 2>&1 &

# Verify
sleep 2
if pgrep -f "node src/valentine/server.js" > /dev/null; then
    echo "✅ Valentine Core is ONLINE (PID: $(pgrep -f "node src/valentine/server.js"))"
    echo "📜 Logs: $LOG_FILE"
else
    echo "❌ Failed to start Valentine Core. Check logs."
    cat "$LOG_FILE"
fi
