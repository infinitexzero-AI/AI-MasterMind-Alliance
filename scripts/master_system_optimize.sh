#!/bin/bash
# ==============================================================================
# AILCC MASTER SYSTEM OPTIMIZATION SCRIPT
# ==============================================================================
# Purpose: Full-stack system optimization for macOS, covering:
#   - Memory management and cache purging
#   - Process optimization
#   - Browser cleanup (via optimize_browsers.sh)
#   - System observability configuration
#   - Interoperability checks
# ==============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/Users/infinite27/AILCC_PRIME/logs"
LOG_FILE="$LOG_DIR/system_opt_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" | tee -a "$LOG_FILE"
}

success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "AILCC MASTER SYSTEM OPTIMIZATION"
log "=========================================="

# ==============================================================================
# 1. SYSTEM STATUS SNAPSHOT
# ==============================================================================
log "--- SYSTEM STATUS SNAPSHOT ---"
log "Hostname: $(hostname)"
log "macOS: $(sw_vers -productVersion)"
log "Uptime: $(uptime)"
log "Disk Usage: $(df -h / | tail -1 | awk '{print $5 " used (" $4 " free)"}')"
log "RAM: $(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')"
log "Load Avg: $(sysctl -n vm.loadavg | awk '{print $2, $3, $4}')"

# ==============================================================================
# 2. MEMORY OPTIMIZATION
# ==============================================================================
log "--- MEMORY OPTIMIZATION ---"

# Purge inactive memory (requires sudo, may be skipped)
if command -v purge &> /dev/null; then
    if sudo -n true 2>/dev/null; then
        sudo purge
        success "Memory purge executed"
    else
        warn "purge requires sudo - skipped (run with sudo for full effect)"
    fi
else
    warn "purge command not available"
fi

# Clear system caches
if [ -d ~/Library/Caches ]; then
    CACHE_SIZE_BEFORE=$(du -sh ~/Library/Caches 2>/dev/null | cut -f1)
    rm -rf ~/Library/Caches/com.apple.Safari/WebKitCache/* 2>/dev/null || true
    rm -rf ~/Library/Caches/Homebrew/* 2>/dev/null || true
    rm -rf ~/Library/Caches/pip/* 2>/dev/null || true
    rm -rf ~/Library/Caches/yarn/* 2>/dev/null || true
    rm -rf ~/Library/Caches/npm/* 2>/dev/null || true
    CACHE_SIZE_AFTER=$(du -sh ~/Library/Caches 2>/dev/null | cut -f1)
    log "User caches cleaned: $CACHE_SIZE_BEFORE -> $CACHE_SIZE_AFTER"
fi

# ==============================================================================
# 3. BROWSER OPTIMIZATION (Delegate to existing script)
# ==============================================================================
log "--- BROWSER OPTIMIZATION ---"
if [ -f "$SCRIPT_DIR/optimize_browsers.sh" ]; then
    log "Delegating to optimize_browsers.sh..."
    bash "$SCRIPT_DIR/optimize_browsers.sh" 2>&1 | tee -a "$LOG_FILE"
    success "Browser optimization complete"
else
    warn "optimize_browsers.sh not found - skipping"
fi

# ==============================================================================
# 4. PROCESS OPTIMIZATION
# ==============================================================================
log "--- PROCESS OPTIMIZATION ---"

# Kill known memory hogs if they're idle
IDLE_KILLERS=("Adobe CEF Helper" "Adobe Desktop Service" "Creative Cloud" "Teams" "Slack Helper")
for proc in "${IDLE_KILLERS[@]}"; do
    if pgrep -f "$proc" > /dev/null 2>&1; then
        warn "Found idle process: $proc - consider closing"
    fi
done

# List top memory consumers
log "Top 5 Memory Consumers:"
ps aux --sort=-%mem | head -6 | tail -5 | while read line; do
    log "  $line" | awk '{print $4"% MEM - "$11}'
done

# ==============================================================================
# 5. DISK SPACE OPTIMIZATION
# ==============================================================================
log "--- DISK SPACE OPTIMIZATION ---"

# Clear Xcode derived data
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
    XCODE_SIZE=$(du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null | cut -f1)
    rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
    log "Cleared Xcode DerivedData ($XCODE_SIZE)"
fi

# Clear npm cache
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null || true
    log "Cleared npm cache"
fi

# ==============================================================================
# 6. OBSERVABILITY CONFIGURATION
# ==============================================================================
log "--- OBSERVABILITY CONFIGURATION ---"

# Ensure logs directory exists
mkdir -p "$LOG_DIR"

# Create live_status.json if not exists
LIVE_STATUS_FILE="/Users/infinite27/AILCC_PRIME/.sync/live_status.json"
mkdir -p "$(dirname "$LIVE_STATUS_FILE")"
cat > "$LIVE_STATUS_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "system": {
    "hostname": "$(hostname)",
    "uptime_seconds": $(sysctl -n kern.boottime | awk '{print systime() - $4}' | tr -d ','),
    "load_avg": "$(sysctl -n vm.loadavg | awk '{print $2}')",
    "disk_free_percent": $(df / | tail -1 | awk '{print 100 - $5}' | tr -d '%')
  },
  "services": {
    "valentine_core": "$(lsof -i :3002 > /dev/null 2>&1 && echo "online" || echo "offline")",
    "dashboard": "$(lsof -i :3000 > /dev/null 2>&1 && echo "online" || echo "offline")"
  },
  "last_optimization": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
success "live_status.json updated"

# ==============================================================================
# 7. INTEROPERABILITY CHECK
# ==============================================================================
log "--- INTEROPERABILITY CHECK ---"

# Check Valentine Core
if lsof -i :3002 > /dev/null 2>&1; then
    success "Valentine Core (port 3002): ONLINE"
else
    warn "Valentine Core (port 3002): OFFLINE"
fi

# Check Dashboard
if lsof -i :3000 > /dev/null 2>&1; then
    success "Dashboard (port 3000): ONLINE"
else
    warn "Dashboard (port 3000): OFFLINE"
fi

# Check Hippocampus
if lsof -i :6333 > /dev/null 2>&1; then
    success "Hippocampus/Qdrant (port 6333): ONLINE"
else
    log "Hippocampus/Qdrant (port 6333): OFFLINE (optional)"
fi

# ==============================================================================
# 8. FINAL REPORT
# ==============================================================================
log "=========================================="
log "OPTIMIZATION COMPLETE"
log "=========================================="
log "Disk Usage After: $(df -h / | tail -1 | awk '{print $5 " (" $4 " free)"}')"
log "Load Avg After: $(sysctl -n vm.loadavg | awk '{print $2, $3, $4}')"
log "Log saved to: $LOG_FILE"
echo ""
echo "✅ System optimization complete. See $LOG_FILE for details."
