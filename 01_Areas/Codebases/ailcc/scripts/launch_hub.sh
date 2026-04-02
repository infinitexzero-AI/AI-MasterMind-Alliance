#!/bin/bash

# ANTIGRAVITY COMMAND CENTER LAUNCHER (Updated for Platform-Based Structure)
# Launches Cortex (Backend) and Dashboard (Frontend)
# Supports both old and new directory structures during migration

echo "🚀 INITIALIZING COMMAND CENTER..."

# 1. Kill any existing instances (cleanup)
echo "🧹 Cleaning up old processes..."
pkill -f "drive_watcher.py"
pkill -f "vite"

# 2. Determine paths (support both old and new structure)
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../" && pwd)"

# Check if new structure exists, otherwise use old
if [ -f "$PROJECT_ROOT/automations/desktop/drive_watcher.py" ]; then
    CORTEX_PATH="automations/desktop/drive_watcher.py"
    echo "   ℹ️  Using new platform-based structure"
else
    CORTEX_PATH="automations/python/drive_watcher.py"
    echo "   ℹ️  Using legacy structure"
fi

# Dashboard path
if [ -d "$PROJECT_ROOT/ui/dashboard" ]; then
    DASHBOARD_DIR="ui/dashboard"
else
    DASHBOARD_DIR="knowledge-dashboard"
fi

# 3. Start Cortex (Valentine Mind)
echo "🧠 Starting Cortex (Valentine Mind)..."
cd "$PROJECT_ROOT" || exit
source .venv/bin/activate 2>/dev/null || true # Try to activate venv if exists
nohup python3 "$CORTEX_PATH" > cortex.log 2>&1 &
CORTEX_PID=$!
echo "   ✅ Cortex running (PID: $CORTEX_PID). Logs: tail -f cortex.log"

# 4. Start Dashboard (AI Team Mind)
echo "📊 Starting Dashboard (AI Team Mind)..."
cd "$DASHBOARD_DIR" || exit
nohup npm run dev > dashboard.log 2>&1 &
DASH_PID=$!
echo "   ✅ Dashboard running (PID: $DASH_PID). Logs: tail -f $DASHBOARD_DIR/dashboard.log"

# 5. Wait for startup
echo "⏳ Waiting for services to stabilize..."
sleep 5

# 6. Summary
echo ""
echo "=================================================="
echo "   COMMAND CENTER ONLINE"
echo "=================================================="
echo "👉 Dashboard URL: http://localhost:5173"
echo "👉 Cortex API:    http://localhost:8000"
echo ""
echo "Structure: $([ -d "$PROJECT_ROOT/ui/dashboard" ] && echo 'Platform-based ✨' || echo 'Legacy')"
echo ""
echo "To view logs (Split Screen Mode):"
echo "  Term 1: tail -f cortex.log"
echo "  Term 2: tail -f $DASHBOARD_DIR/dashboard.log"
echo "=================================================="
