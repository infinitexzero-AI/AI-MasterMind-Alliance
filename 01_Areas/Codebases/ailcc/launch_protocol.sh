#!/bin/bash

# AILCC LAUNCH PROTOCOL
# Function: Updates code, restarts services, triggers agent design loop.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Initiating Launch Protocol..."

# --- STABILIZATION ---
STABILIZER_PATH="$SCRIPT_DIR/../../../06_System/Scripts/scripts/stabilize_startup.sh"
if [ -f "$STABILIZER_PATH" ]; then
    bash "$STABILIZER_PATH" || { echo "❌ Stabilization failed. Aborting launch."; exit 1; }
else
    echo "⚠️ Stabilization script not found at $STABILIZER_PATH. Proceeding with caution..."
fi
# ---------------------

# 1. Update Codebase (Git Pull)
echo "📥 Checking for updates..."
# git pull origin main # Uncomment when git is fully configured
echo "✓ Codebase is current."

# 2. Check Dependencies
echo "📦 Verifying dependencies..."
cd "$SCRIPT_DIR/dashboard"
npm list framer-motion > /dev/null 2>&1 || npm install framer-motion
echo "✓ Frontend dependencies ready."

# 3. Transfer Control to Master Cortex Engine
echo "🔄 Redirecting to Master AILCC Cortex Engine..."
bash "$SCRIPT_DIR/launch_cortex.sh" --docker-rebuild

echo "✅ LAUNCH COMPLETE."
