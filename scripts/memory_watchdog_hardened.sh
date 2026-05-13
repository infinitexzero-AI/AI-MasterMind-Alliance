#!/bin/bash
# ==============================================================================
# AILCC HARDENED MEMORY WATCHDOG v1.4 (PRECISION)
# ==============================================================================

WORKSPACE_DIR="/Volumes/XDriveBeta/AILCC_PRIME"
LOG_DIR="/Users/infinite27/AILCC_PRIME/scripts/logs"
LOG_FILE="$LOG_DIR/memory_watchdog.log"
CRITICAL_LOG="$LOG_DIR/memory_critical_events.log"
LAST_NOTIFY_FILE="/tmp/ailcc_last_notify"

# Thresholds
# On macOS, "Free" is deceptive. We look at "Available" (Free + Inactive + Speculative)
AVAIL_RAM_CRITICAL=400         # MB
THRASHING_THRESHOLD=500       # Delta in thrashing detected count

# Initial State
LAST_THRASH_COUNT=$(/usr/sbin/sysctl -n vm.compressor_swapper_swapout_thrashing_detected 2>/dev/null || echo "0")

log() {
    mkdir -p "$LOG_DIR" 2>/dev/null
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_memory() {
    # 1. Get Memory Stats
    VM_STATS=$(/usr/bin/vm_stat)
    FREE_PAGES=$(echo "$VM_STATS" | /usr/bin/awk '/Pages free/ {print $3}' | /usr/bin/sed 's/\.//')
    INACTIVE_PAGES=$(echo "$VM_STATS" | /usr/bin/awk '/Pages inactive/ {print $3}' | /usr/bin/sed 's/\.//')
    SPECULATIVE_PAGES=$(echo "$VM_STATS" | /usr/bin/awk '/Pages speculative/ {print $3}' | /usr/bin/sed 's/\.//')
    
    if [ -z "$FREE_PAGES" ]; then FREE_PAGES=0; fi
    if [ -z "$INACTIVE_PAGES" ]; then INACTIVE_PAGES=0; fi
    if [ -z "$SPECULATIVE_PAGES" ]; then SPECULATIVE_PAGES=0; fi
    
    AVAIL_PAGES=$((FREE_PAGES + INACTIVE_PAGES + SPECULATIVE_PAGES))
    AVAIL_MB=$((AVAIL_PAGES * 4096 / 1024 / 1024))
    FREE_MB=$((FREE_PAGES * 4096 / 1024 / 1024))

    # 2. Get Compressor Thrashing
    CURRENT_THRASH_COUNT=$(/usr/sbin/sysctl -n vm.compressor_swapper_swapout_thrashing_detected 2>/dev/null || echo "0")
    if [ -z "$CURRENT_THRASH_COUNT" ]; then CURRENT_THRASH_COUNT=0; fi
    THRASH_DELTA=$((CURRENT_THRASH_COUNT - LAST_THRASH_COUNT))
    LAST_THRASH_COUNT=$CURRENT_THRASH_COUNT

    log "Status: Avail RAM: ${AVAIL_MB}MB (Free: ${FREE_MB}MB) | Thrash Delta: ${THRASH_DELTA}"

    if [ "$AVAIL_MB" -lt "$AVAIL_RAM_CRITICAL" ]; then
        handle_critical "Low Available RAM: ${AVAIL_MB}MB"
    elif [ "$THRASH_DELTA" -gt "$THRASH_THRESHOLD" ]; then
        handle_critical "Compressor Thrashing Detected: +${THRASH_DELTA} events"
    fi
}

handle_critical() {
    REASON=$1
    mkdir -p "$LOG_DIR" 2>/dev/null
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 CRITICAL MEMORY: $REASON" >> "$CRITICAL_LOG"
    log "🚨 EMERGENCY LOAD SHEDDING INITIATED"

    # 1. Kill Next.js dev servers
    log "  - Terminating Next.js dev servers..."
    /usr/bin/pgrep -f "next-dev-server" | /usr/bin/xargs kill -9 2>/dev/null || true
    
    # 2. Restart PM2 to clear its managed memory
    log "  - Restarting PM2 services..."
    /usr/local/bin/pm2 restart all --max-memory-restart 400M 2>/dev/null || true

    # 3. Target huge Antigravity/Language processes
    log "  - Pruning runaway helpers..."
    /bin/ps -eo pid,rss,comm | /usr/bin/grep -E "Antigravity Helper|language_server" | while read -r pid rss comm; do
        if [ "$rss" -gt 1048576 ]; then # 1GB
            log "    - Killing $comm (PID $pid) - RSS: $((rss/1024))MB"
            /bin/kill -9 "$pid" 2>/dev/null
        fi
    done

    # 4. Notify user (with 2-minute cooldown)
    CURRENT_TIME=$(date +%s)
    LAST_NOTIFY=0
    if [ -f "$LAST_NOTIFY_FILE" ]; then
        LAST_NOTIFY=$(/bin/cat "$LAST_NOTIFY_FILE")
    fi

    if [ $((CURRENT_TIME - LAST_NOTIFY)) -gt 120 ]; then
        /usr/bin/osascript -e 'display notification "Memory Watchdog triggered: '"$REASON"'" with title "🚨 AILCC MEMORY CRITICAL"' 2>/dev/null
        echo "$CURRENT_TIME" > "$LAST_NOTIFY_FILE"
    fi
}

# Main Loop
log "Memory Watchdog v1.4 started (Polling: 5s, Threshold: ${AVAIL_RAM_CRITICAL}MB Available)"
while true; do
    check_memory
    sleep 5
done
