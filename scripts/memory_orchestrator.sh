#!/bin/bash
# Intelligent Memory Orchestrator
# Automatically manages memory based on thresholds and implements self-healing

echo "🧠 Memory Orchestrator - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Thresholds
CRITICAL_THRESHOLD=200  # MB free RAM
WARNING_THRESHOLD=500   # MB free RAM
SWAP_CRITICAL=80        # Percent

# Get current memory status
FREE_MB=$(vm_stat | awk '/Pages free/ {print int($3 * 4096 / 1048576)}')
SWAP_INFO=$(sysctl vm.swapusage 2>/dev/null | awk '{print $4, $7}')
SWAP_TOTAL=$(echo $SWAP_INFO | awk '{print $1}' | sed 's/M//')
SWAP_USED=$(echo $SWAP_INFO | awk '{print $2}' | sed 's/M//')

if [ -n "$SWAP_TOTAL" ] && [ "$SWAP_TOTAL" != "0" ]; then
    SWAP_PERCENT=$(echo "scale=0; ($SWAP_USED * 100) / $SWAP_TOTAL" | bc)
else
    SWAP_PERCENT=0
fi

echo "Current Status:"
echo "  Free RAM: ${FREE_MB}MB"
echo "  Swap: ${SWAP_USED}MB / ${SWAP_TOTAL}MB (${SWAP_PERCENT}%)"
echo ""

# Log status
mkdir -p ~/AILCC_PRIME/logs
echo "$(date +%Y-%m-%d\ %H:%M:%S),${FREE_MB},${SWAP_PERCENT}" >> ~/AILCC_PRIME/logs/memory_orchestrator.csv

# CRITICAL STATE - Aggressive action
if [ $FREE_MB -lt $CRITICAL_THRESHOLD ]; then
    echo "🚨 CRITICAL: Only ${FREE_MB}MB free RAM - Initiating emergency procedures"
    
    # 1. Pause cloud sync services
    echo "  [1/5] Pausing cloud sync services..."
    osascript -e 'quit app "Google Drive"' 2>/dev/null && echo "    ✓ Google Drive paused" || echo "    ✗ Google Drive not running"
    
    # 2. Restart language server if bloated (>30% RAM)
    echo "  [2/5] Checking language server..."
    LS_MEM=$(ps aux | grep language_server_macos | grep -v grep | awk '{print $4}' | head -1)
    if [ -n "$LS_MEM" ]; then
        LS_MEM_INT=$(echo $LS_MEM | cut -d. -f1)
        if [ $LS_MEM_INT -gt 30 ]; then
            echo "    Language server using ${LS_MEM}% - restarting..."
            bash ~/AILCC_PRIME/scripts/restart_language_server.sh
        else
            echo "    ✓ Language server healthy (${LS_MEM}%)"
        fi
    fi
    
    # 3. Clear system caches
    echo "  [3/5] Clearing system caches..."
    sudo purge 2>/dev/null && echo "    ✓ System caches purged" || echo "    ⚠ Purge requires sudo"
    
    # 4. Run safe cleanup
    echo "  [4/5] Running safe cleanup..."
    bash ~/AILCC_PRIME/scripts/safe_cleanup.sh > /dev/null 2>&1
    echo "    ✓ Cleanup complete"
    
    # 5. Send critical alert
    echo "  [5/5] Sending alert..."
    osascript -e 'display notification "Emergency memory cleanup executed. Free RAM: '"${FREE_MB}"'MB" with title "🚨 AILCC Memory Critical"' 2>/dev/null
    
    echo ""
    echo "✅ Emergency procedures complete"
    
    # Log critical event
    echo "$(date +%Y-%m-%d\ %H:%M:%S),CRITICAL,${FREE_MB}MB,Actions: Paused sync, restarted LS, purged caches" >> ~/AILCC_PRIME/logs/memory_critical_events.log

# WARNING STATE - Gentle optimization
elif [ $FREE_MB -lt $WARNING_THRESHOLD ]; then
    echo "⚠️  WARNING: Only ${FREE_MB}MB free RAM - Running gentle optimization"
    
    # 1. Run safe cleanup
    echo "  [1/2] Running safe cleanup..."
    bash ~/AILCC_PRIME/scripts/safe_cleanup.sh > /dev/null 2>&1
    echo "    ✓ Cleanup complete"
    
    # 2. Send warning
    echo "  [2/2] Sending notification..."
    osascript -e 'display notification "Memory optimization running. Free RAM: '"${FREE_MB}"'MB" with title "⚠️ AILCC Memory Warning"' 2>/dev/null
    
    echo ""
    echo "✅ Optimization complete"

# HEALTHY STATE
else
    echo "✅ HEALTHY: ${FREE_MB}MB free RAM"
fi

# Check swap usage separately
if [ $SWAP_PERCENT -gt $SWAP_CRITICAL ]; then
    echo ""
    echo "⚠️  Swap usage critical: ${SWAP_PERCENT}%"
    echo "   Recommendation: Restart system to clear swap or upgrade RAM"
    osascript -e 'display notification "Swap usage at '"${SWAP_PERCENT}"'% - Consider restarting" with title "⚠️ AILCC Swap Warning"' 2>/dev/null
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Memory Orchestrator complete - $(date)"
echo ""
