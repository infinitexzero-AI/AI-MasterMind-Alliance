#!/bin/bash
# ==============================================================================
# AILCC HARDENED MEMORY WATCHDOG v1.0
# ==============================================================================
# Purpose: Proactively monitors system memory pressure and prevents
# WindowServer watchdog timeouts by gracefully shedding load.
# ==============================================================================

LOG_DIR="/Volumes/XDriveBeta/AILCC_PRIME/06_System/Logs"
LOG_FILE="$LOG_DIR/memory_watchdog.log"
CRITICAL_LOG="$LOG_DIR/memory_critical_events.log"
mkdir -p "$LOG_DIR"

# Thresholds
COMPRESSOR_LIMIT_THRESHOLD=85 # Percent of compressor limit
FREE_RAM_CRITICAL=150         # MB

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_memory() {
    # 1. Get Free RAM
    FREE_PAGES=$(vm_stat | awk '/Pages free/ {print $3}' | sed 's/\.//')
    FREE_MB=$((FREE_PAGES * 4096 / 1024 / 1024))

    # 2. Get Compressor Info
    # Output format: Compressor Info: 100% of compressed pages limit (BAD) ...
    # We use a custom parser or just check the bad flag
    COMP_STATUS=$(sysctl -n vm.compressor_mode 2>/dev/null || echo "0")
    
    # Alternatively, parse the same info the kernel panic uses
    # But since we can't easily get the "limit" percentage from shell without top,
    # we'll use vm_stat's "Pages occupied by compressor"
    OCCUPIED_PAGES=$(vm_stat | awk '/Pages occupied by compressor/ {print $5}' | sed 's/\.//')
    
    log "Status: Free RAM: ${FREE_MB}MB | Compressed: ${OCCUPIED_PAGES} pages"

    if [ "$FREE_MB" -lt "$FREE_RAM_CRITICAL" ]; then
        handle_critical "Low Free RAM: ${FREE_MB}MB"
    fi
}

handle_critical() {
    REASON=$1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 CRITICAL MEMORY: $REASON" >> "$CRITICAL_LOG"
    log "🚨 EMERGENCY LOAD SHEDDING INITIATED"

    # 1. Kill Next.js dev servers (they are the biggest hogs)
    log "  - Terminating Next.js dev servers..."
    pgrep -f "next-dev-server" | xargs kill -9 2>/dev/null || true
    
    # 2. Restart PM2 to clear its managed memory
    log "  - Restarting PM2 services..."
    pm2 restart all --max-memory-restart 500M 2>/dev/null || true

    # 3. Purge system caches
    log "  - Executing system purge..."
    sudo purge 2>/dev/null || log "    (Purge failed - requires sudo)"

    # 4. Notify user
    osascript -e 'display notification "Memory Watchdog triggered: '"$REASON"'" with title "🚨 AILCC MEMORY CRITICAL"' 2>/dev/null
}

# Main Loop
log "Memory Watchdog started (Threshold: ${FREE_RAM_CRITICAL}MB)"
while true; do
    check_memory
    sleep 60
done
