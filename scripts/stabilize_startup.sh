#!/bin/bash

# AILCC Startup Stabilization Script
# Prevents high-load dashboard initialization during unstable WindowServer states.

MIN_UPTIME=60 # Seconds
STABLE_FILE="/tmp/ailcc_stable"

echo "Checking system stability..."

UPTIME_SEC=$(sysctl -n kern.boottime | awk '{print $4}' | sed 's/,//')
NOW=$(date +%s)
DIFF=$((NOW - UPTIME_SEC))

if [ "$DIFF" -lt "$MIN_UPTIME" ]; then
    WAIT_TIME=$((MIN_UPTIME - DIFF))
    echo "System recently booted ($DIFF seconds ago). Waiting $WAIT_TIME seconds for WindowServer to settle..."
    sleep $WAIT_TIME
fi

# Check for WindowServer process health
if pgrep "WindowServer" > /dev/null; then
    echo "WindowServer detected. Checking load..."
    # Simple check for excessive CPU that might indicate a hang
    WS_CPU=$(ps -rcx -o %cpu -p $(pgrep WindowServer) | tail -n 1)
    echo "WindowServer CPU Load: $WS_CPU%"
    
    if (( $(echo "$WS_CPU > 90.0" | bc -l) )); then
        echo "WARNING: WindowServer CPU load is very high. Delaying startup by 10s..."
        sleep 10
    fi
else
    echo "CRITICAL: WindowServer not found. Aborting AILCC launch."
    exit 1
fi

touch $STABLE_FILE
echo "System stabilized. Proceeding with AILCC Chamber activation..."
exit 0
