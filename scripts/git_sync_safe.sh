#!/bin/bash
# git_sync_safe.sh - Intelligent Git Synchronization for Sovereign OS Swarm
# Ensures multi-node consistency by handling diverged histories gracefully.

set -e

# Configuration
BRANCH="main"
REMOTE="origin"
NODE_NAME=$(hostname)
LOG_FILE="${AILCC_ROOT:-.}/logs/git_sync.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" | tee -a "$LOG_FILE"
}

log "Starting sovereign sync cycle..."

# 1. Race Condition Guard
if [ -f .git/index.lock ]; then
    log "⚠️ Git index is locked. Skipping sync to avoid conflict."
    exit 0
fi

# 2. Fetch latest state
log "Fetching $REMOTE/$BRANCH from $NODE_NAME..."
git fetch "$REMOTE" "$BRANCH"

# 2. Check for local changes
if git diff --cached --quiet && git diff --quiet; then
    log "No local changes to commit."
else
    log "Committing local changes from $NODE_NAME..."
    git add -A
    git commit -m "auto: $NODE_NAME sync $(date -u +%Y-%m-%dT%H:%M:%SZ)" || log "Nothing to commit (already handled)"
fi

# 3. Check for divergence
UPSTREAM=$(git rev-parse "$REMOTE/$BRANCH")
LOCAL=$(git rev-parse @)
BASE=$(git merge-base @ "$REMOTE/$BRANCH")

if [ "$LOCAL" = "$UPSTREAM" ]; then
    log "Up to date. No action needed."
elif [ "$LOCAL" = "$BASE" ]; then
    log "Local is behind. Fast-forwarding..."
    git pull --no-rebase "$REMOTE" "$BRANCH"
elif [ "$UPSTREAM" = "$BASE" ]; then
    log "Local is ahead. Pushing changes..."
    git push "$REMOTE" "$BRANCH"
else
    log "Diverged. Attempting pull with rebase..."
    if git pull --rebase "$REMOTE" "$BRANCH"; then
        log "Rebase successful. Updating submodules..."
        git submodule update --init --recursive
        log "Pushing merged state..."
        git push "$REMOTE" "$BRANCH"
    else
        log "ERROR: Rebase failed! Manual intervention required."
        git rebase --abort
        exit 1
    fi
fi

log "Sync cycle complete."
