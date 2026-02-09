#!/bin/bash
# AILCC Memory Monitoring Script
# Monitors memory and swap usage, alerts on high usage

MEMORY_THRESHOLD=85  # Alert at 85% memory usage
SWAP_THRESHOLD=70    # Alert at 70% swap usage

echo "╔════════════════════════════════════════╗"
echo "║   AILCC Memory Status                  ║"
echo "╚════════════════════════════════════════╝"
echo "Date: $(date)"
echo ""

# Get memory stats using vm_stat
PAGESIZE=$(vm_stat | grep "page size" | awk '{print $8}')
FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
ACTIVE_PAGES=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
INACTIVE_PAGES=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
WIRED_PAGES=$(vm_stat | grep "Pages wired" | awk '{print $4}' | sed 's/\.//')
COMPRESSED_PAGES=$(vm_stat | grep "occupied by compressor" | awk '{print $5}' | sed 's/\.//')

# Calculate memory in MB
FREE_MB=$(echo "scale=0; ($FREE_PAGES * $PAGESIZE) / 1048576" | bc)
ACTIVE_MB=$(echo "scale=0; ($ACTIVE_PAGES * $PAGESIZE) / 1048576" | bc)
INACTIVE_MB=$(echo "scale=0; ($INACTIVE_PAGES * $PAGESIZE) / 1048576" | bc)
WIRED_MB=$(echo "scale=0; ($WIRED_PAGES * $PAGESIZE) / 1048576" | bc)
COMPRESSED_MB=$(echo "scale=0; ($COMPRESSED_PAGES * $PAGESIZE) / 1048576" | bc)

TOTAL_MB=8192
USED_MB=$(echo "$TOTAL_MB - $FREE_MB" | bc)
USED_PERCENT=$(echo "scale=0; ($USED_MB * 100) / $TOTAL_MB" | bc)

echo "💾 RAM (8GB Total):"
echo "   Used: ${USED_MB}MB (${USED_PERCENT}%)"
echo "   Free: ${FREE_MB}MB"
echo "   Active: ${ACTIVE_MB}MB"
echo "   Wired: ${WIRED_MB}MB"
echo "   Compressed: ${COMPRESSED_MB}MB"

# Get swap usage
SWAP_INFO=$(sysctl vm.swapusage | awk '{print $4, $7, $10}')
SWAP_TOTAL=$(echo $SWAP_INFO | awk '{print $1}' | sed 's/M//')
SWAP_USED=$(echo $SWAP_INFO | awk '{print $2}' | sed 's/M//')
SWAP_FREE=$(echo $SWAP_INFO | awk '{print $3}' | sed 's/M//')

if [ -n "$SWAP_TOTAL" ] && [ "$SWAP_TOTAL" != "0" ]; then
    SWAP_PERCENT=$(echo "scale=0; ($SWAP_USED * 100) / $SWAP_TOTAL" | bc)
else
    SWAP_PERCENT=0
fi

echo ""
echo "💿 Swap:"
echo "   Used: ${SWAP_USED}MB / ${SWAP_TOTAL}MB (${SWAP_PERCENT}%)"

# Alert if thresholds exceeded
echo ""
if [ $USED_PERCENT -gt $MEMORY_THRESHOLD ]; then
    echo "⚠️  WARNING: Memory usage above ${MEMORY_THRESHOLD}%!"
    echo ""
    echo "Top 5 memory consumers:"
    ps aux | sort -rn -k 4 | head -5 | awk '{printf "   %5.1f%% - %s\n", $4, $11}'
    echo ""
    echo "💡 Recommendations:"
    echo "   - Restart language server: bash ~/AILCC_PRIME/scripts/restart_language_server.sh"
    echo "   - Close unused browser tabs"
    echo "   - Close unused Antigravity extensions"
fi

if [ $SWAP_PERCENT -gt $SWAP_THRESHOLD ]; then
    echo "⚠️  WARNING: Swap usage above ${SWAP_THRESHOLD}%!"
    echo "   System is swapping heavily, performance degraded"
    echo "   Consider closing unused applications or restarting"
fi

# Check for memory-heavy processes
echo ""
echo "📊 Top Memory Processes:"
ps aux | sort -rn -k 4 | head -10 | awk '{printf "   %5.1f%% - %s\n", $4, $11}'

echo ""
