#!/bin/bash
# AI Mastermind Alliance - MacBook "Nuke and Pave" Recovery Payload
# This script is designed to resolve state corruption and sync loops on the MacBook Node.

echo "🌌 MACBOOK RECOVERY PULSE INITIATED"
echo "-----------------------------------"

# 1. Kill any runaway AILCC/Next.js processes
echo "[1/4] 🛡️ Terminating existing system threads..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "antigravity" 2>/dev/null
echo "✅ Processes cleared."

# 2. Force Sync with Vanguard (Ground Truth)
echo "[2/4] 🛰️ Aligning with Vanguard (ThinkPad) context..."
# Safety: Unset any git locks
rm -f .git/index.lock
git reset --hard HEAD
git clean -fd
git pull origin main --force
echo "✅ Git state ALIGNED (Commit: $(git rev-parse --short HEAD))"

# 3. Rebuild HMI (Dashboard) Environment
echo "[3/4] 🏗️ Rebuilding Nexus Dashboard..."
cd 01_Areas/Codebases/ailcc/dashboard
rm -rf node_modules package-lock.json
npm install
echo "✅ Workspace HYDRATED."

# 4. Diagnostic Launch
echo "[4/4] 🚀 Initializing System Protocol..."
cd ../ # Back to ailcc root
chmod +x launch_all.sh
./launch_all.sh

echo "-----------------------------------"
echo "🟢 ALLIANCE LINK STABILIZED."
