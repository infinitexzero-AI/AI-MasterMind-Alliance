#!/bin/bash
# ==============================================================================
# AILCC Safe Browser Launcher
# ==============================================================================
# Launches Comet with GPU disabled to prevent v143 SIGTRAP crashes
# ==============================================================================

APP="Comet"
BINARY="/Applications/Comet.app/Contents/MacOS/Comet"
FLAGS="--disable-gpu --disable-software-rasterizer"

# Check if already running
if pgrep -x "$APP" > /dev/null; then
    echo "[$APP] Already running. Use 'killall $APP' to restart with safe flags."
    exit 0
fi

# Launch with safe flags
echo "[$APP] Launching with GPU disabled..."
"$BINARY" $FLAGS > /dev/null 2>&1 &

echo "[$APP] Launched successfully in GPU-safe mode."
