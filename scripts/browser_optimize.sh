#!/bin/bash
# AILCC Browser Optimization & Stabilization Script
# Targets orphaned Chrome/Playwright processes and reclaims memory.

echo "🚀 Starting AILCC Browser Optimization (Industry Standard)..."

# 1. Kill Zombie Helper Processes
echo "🧹 Terminating orphaned browser helpers..."
# Target common process patterns from Playwright/Chrome
PROCESS_PATTERNS=("chrome_crashpad_handler" "Google Chrome Helper" "playwright" "ms-playwright")

for pattern in "${PROCESS_PATTERNS[@]}"; do
    if pgrep -f "$pattern" >/dev/null; then
        echo "   - Found $pattern processes. Sending SIGTERM..."
        pkill -15 -f "$pattern" 2>/dev/null || true
        sleep 1
        
        # Check if still running, escalate to SIGKILL
        if pgrep -f "$pattern" >/dev/null; then
            echo "   - $pattern still running. Escalating to SIGKILL..."
            pkill -9 -f "$pattern" 2>/dev/null || true
        fi
    fi
done

# 2. Reclaim Memory
echo "🧠 Reclaiming system memory..."
if command -v purge &> /dev/null; then
    # purge might require sudo, but we can try
    purge || echo "   ⚠ System purge skipped (requires higher permissions or failed)"
fi

# 3. Clear Playwright / Browser State (Specific to AILCC)
echo "🌐 Cleaning browser state..."
# Clear Playwright's local cache if possible
rm -rf ~/Library/Caches/ms-playwright 2>/dev/null || true

# 4. Integrate with General Cleanup
CLEANUP_SCRIPT="/Volumes/XDriveBeta/AILCC_PRIME/scripts/safe_cleanup.sh"
if [ -f "$CLEANUP_SCRIPT" ]; then
    echo "♻️  Running general system cleanup..."
    bash "$CLEANUP_SCRIPT"
fi

echo "✅ Optimization Complete!"
echo "Current Memory Status:"
vm_stat | grep "Pages free"

