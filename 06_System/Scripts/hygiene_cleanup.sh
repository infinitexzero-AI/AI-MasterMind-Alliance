#!/bin/bash

# AILCC System Hygiene & Cache Pruning Script
# Purpose: Clear transient bloat and prevent ENOSPC errors.

REPO_ROOT="/Users/infinite27/AILCC_PRIME"
DASHBOARD_DIR="$REPO_ROOT/01_Areas/Codebases/ailcc/dashboard"
N8N_DIR="$REPO_ROOT/06_System/Execution/n8n/n8n_data"
LOG_DIR="$REPO_ROOT/06_System/Logs"

echo "🧹 Starting AILCC System Hygiene..."

# 1. Prune Next.js Cache
if [ -d "$DASHBOARD_DIR/.next/cache" ]; then
    echo "🗑️ Pruning Dashboard Next.js cache..."
    rm -rf "$DASHBOARD_DIR/.next/cache"
fi

# 2. Prune node_modules caches
echo "🗑️ Pruning global node_modules caches..."
find "$REPO_ROOT" -name ".cache" -type d -path "*/node_modules/*" -exec rm -rf {} +

# 3. Clear n8n Event Logs
if [ -d "$N8N_DIR" ]; then
    echo "🗑️ Pruning n8n event logs..."
    rm -f "$N8N_DIR/n8nEventLog-*.log"
fi

# 4. Rotate/Truncate bloated logs
echo "🔄 Rotating AILCC system logs..."
for log in "$LOG_DIR"/*.log; do
    if [ -f "$log" ]; then
        # If log > 50MB, truncate
        size=$(du -m "$log" | cut -f1)
        if [ "$size" -gt 50 ]; then
            echo "⚠️ Truncating $log (${size}MB)..."
            tail -n 1000 "$log" > "${log}.tmp" && mv "${log}.tmp" "$log"
        fi
    fi
done

echo "✅ AILCC System Hygiene Complete."
df -h "$REPO_ROOT"
