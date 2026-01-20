#!/bin/bash

# ==============================================================================
# AILCC Browser Optimization & Maintenance Script
# ==============================================================================
# Purpose: Clear corrupted caches, check for unstable versions, and ensure
#          optimal environment for Chromium-based browsers (Comet & Chrome).
# ==============================================================================

LOG_FILE="/Users/infinite27/AILCC_PRIME/logs/browser_opt_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" | tee -a "$LOG_FILE"
}

log "Starting Browser Optimization Sequence..."

# ==============================================================================
# 1. Version Check & Canary Detection
# ==============================================================================

check_version() {
    APP_NAME="$1"
    PLIST_PATH="$2"
    
    if [ -f "$PLIST_PATH" ]; then
        VERSION=$(defaults read "$PLIST_PATH" CFBundleShortVersionString)
        log "Detected $APP_NAME Version: $VERSION"
        
        # Check for v143+ (Canary/Unstable)
        IFS='.' read -r -a VERSION_PARTS <<< "$VERSION"
        MAJOR_VER="${VERSION_PARTS[0]}"
        
        if [ "$MAJOR_VER" -ge 143 ]; then
            warn "⚠️  UNSTABLE VERSION DETECTED for $APP_NAME (v$MAJOR_VER)"
            warn "   Recommendation: Downgrade to Stable (v132+) to prevent SIGTRAP crashes."
        fi
    else
        log "$APP_NAME not found or Info.plist inaccessible."
    fi
}

check_version "Google Chrome" "/Applications/Google Chrome.app/Contents/Info.plist"
check_version "Comet" "/Applications/Comet.app/Contents/Info.plist"

# ==============================================================================
# 2. Process Safety Check
# ==============================================================================

force_close() {
    APP_NAME="$1"
    if pgrep -x "$APP_NAME" > /dev/null; then
        warn "$APP_NAME is running. Closing it to safely clear cache..."
        osascript -e "quit app \"$APP_NAME\""
        sleep 2
        if pgrep -x "$APP_NAME" > /dev/null; then
            killall "$APP_NAME"
            log "$APP_NAME forced closed."
        fi
    else
        log "$APP_NAME is not running."
    fi
}

force_close "Google Chrome"
force_close "Comet"

# ==============================================================================
# 3. Cache Clearing
# ==============================================================================

clear_cache() {
    APP_NAME="$1"
    CACHE_DIR="$2"
    GPU_CACHE_DIR="$3"
    
    if [ -d "$CACHE_DIR" ]; then
        rm -rf "$CACHE_DIR"
        log "✅ Cleared $APP_NAME Cache: $CACHE_DIR"
    else
        log "No Cache found for $APP_NAME at $CACHE_DIR"
    fi

    if [ -d "$GPU_CACHE_DIR" ]; then
        rm -rf "$GPU_CACHE_DIR"
        log "✅ Cleared $APP_NAME GPUCache: $GPU_CACHE_DIR"
    else
        log "No GPUCache found for $APP_NAME at $GPU_CACHE_DIR"
    fi
}

# Chrome Paths
CHROME_BASE="$HOME/Library/Application Support/Google/Chrome/Default"
clear_cache "Google Chrome (AppSupport)" "$CHROME_BASE/Cache" "$CHROME_BASE/GPUCache"
clear_cache "Google Chrome (Library/Caches)" "$HOME/Library/Caches/Google/Chrome/Default/Cache" "$HOME/Library/Caches/Google/Chrome/Default/GPUCache"

# Comet Paths
# Checking standard possible locations
COMET_APP_SUPPORT_1="$HOME/Library/Application Support/Comet"
COMET_APP_SUPPORT_2="$HOME/Library/Application Support/ai.perplexity.comet"
COMET_CACHE_1="$HOME/Library/Caches/ai.perplexity.comet"
COMET_CACHE_2="$HOME/Library/Caches/Comet"

clear_cache "Comet (AppSupport 1)" "$COMET_APP_SUPPORT_1/Cache" "$COMET_APP_SUPPORT_1/GPUCache"
clear_cache "Comet (AppSupport 2)" "$COMET_APP_SUPPORT_2/Cache" "$COMET_APP_SUPPORT_2/GPUCache"
clear_cache "Comet (Library/Caches 1)" "$COMET_CACHE_1" "$COMET_CACHE_1/fsCachedData"
clear_cache "Comet (Library/Caches 2)" "$COMET_CACHE_2" "$COMET_CACHE_2/fsCachedData"


# ==============================================================================
# 4. Final Report
# ==============================================================================

log "Optimization Complete."
log "Please restart your browsers. If crashes persist, consult troubleshooting_chromium.md"
echo "Log saved to: $LOG_FILE"
