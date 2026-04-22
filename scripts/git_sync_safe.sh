#!/bin/bash
# git_sync_safe.sh - Intelligent Git Synchronization for Sovereign OS Swarm
# Ensures multi-node consistency by handling diverged histories gracefully.

set -e

# Configuration
BRANCH="main"
REMOTE="origin"
LOG_FILE="${AILCC_ROOT:-.}/logs/git_sync.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" | tee -a "$LOG_FILE"
}

log "Starting sovereign sync cycle..."

# 1. Fetch latest state
log "Fetching $REMOTE/$BRANCH..."
git fetch "$REMOTE" "$BRANCH"

# 2. Check for local changes
if git diff --cached --quiet && git diff --quiet; then
    log "No local changes to commit."
else
    log "Committing local changes..."
    git add -A
    git commit -m "auto: sovereign sync $(date -u +%Y-%m-%dT%H:%M:%SZ)" || log "Nothing to commit (already handled)"
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
        log "Rebase successful. Pushing merged state..."
        git push "$REMOTE" "$BRANCH"
    else
        log "ERROR: Rebase failed! Manual intervention required."
        git rebase --abort
        exit 1
    fi
fi

log "Sync cycle complete."
