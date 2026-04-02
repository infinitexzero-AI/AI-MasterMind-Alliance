#!/bin/bash

watch -n 1 '
clear
echo "╔════════════════════════════════════════╗"
echo "║   ANTI-GRAVITY STATUS MONITOR          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Time: $(date +"%Y-%m-%d %H:%M:%S")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check relay process
if pgrep -f "dashboard/server/relay.js" > /dev/null; then
    echo "🟢 Relay: ACTIVE"
else
    echo "🔴 Relay: OFFLINE"
fi

# Check heartbeat
# Note: Using port 3001 per relay.js configuration
HEARTBEAT=$(curl -s http://localhost:3001/api/comet/heartbeat 2>/dev/null)
if [ ! -z "$HEARTBEAT" ]; then
    echo "💚 Heartbeat: LIVE"
else
    echo "⚠️  Heartbeat: NO SIGNAL"
fi

# Show last 5 log entries
echo ""
echo "Latest Activity:"
if [ -f ~/antigravity.log ]; then
    tail -n 5 ~/antigravity.log | sed "s/^/  /"
else
    echo "  (No log file found at ~/antigravity.log)"
fi
'
