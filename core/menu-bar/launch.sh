#!/bin/bash
# 🌌 AILCC Cortex Menu Bar — Launch Script
# Starts the Electron menu bar widget properly via the bundled binary

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/ailcc-menubar.log"
ELECTRON_BIN="$SCRIPT_DIR/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"

echo "🌌 Launching AILCC Cortex Menu Bar Widget..."

# Kill any existing instance
pkill -f "AILCC Cortex\|ailcc-menu-bar" 2>/dev/null
sleep 0.5

# Verify binary exists
if [ ! -f "$ELECTRON_BIN" ]; then
    echo "❌ Electron binary not found at: $ELECTRON_BIN"
    echo "   Run: cd $SCRIPT_DIR && npm install"
    exit 1
fi

# Launch — pass the APP DIRECTORY (not the script), so Electron reads package.json main entry
"$ELECTRON_BIN" "$SCRIPT_DIR" > "$LOG_FILE" 2>&1 &
ELECTRON_PID=$!

sleep 3

if kill -0 $ELECTRON_PID 2>/dev/null; then
    # Check for errors in log
    if grep -q "TypeError\|Error:" "$LOG_FILE" 2>/dev/null; then
        echo "⚠️  Electron started but reported errors:"
        cat "$LOG_FILE"
    else
        echo "✅ AILCC Cortex running (PID $ELECTRON_PID)"
        echo "   Look for '⚡ AILCC · CPU:XX%' in your macOS menu bar (top-right)"
        echo "   Click  → opens Cortex Monitor popup"
        echo "   Right-click → Dashboard / Observability / War Room links"
        echo "   Log: $LOG_FILE"
    fi
else
    echo "❌ Failed to launch. Check log: $LOG_FILE"
    cat "$LOG_FILE"
fi
