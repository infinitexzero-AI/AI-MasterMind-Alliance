#!/bin/bash
# AILCC Dashboard Lifecycle Manager
# Resolves port conflicts and ghost processes

echo "--- AILCC DASHBOARD RECOVERY SEQUENCE ---"

# 1. Terminate ghost processes on common ports
PORTS=(3000 3001 3005 8080)
for PORT in "${PORTS[@]}"; do
    PID=$(lsof -t -i :$PORT)
    if [ ! -z "$PID" ]; then
        echo "Found process $PID on port $PORT. Forcibly terminating..."
        kill -9 $PID || true
    fi
done

# 2. Kill by process name just in case
pkill -f "next-server" || true
pkill -f "next dev" || true
pkill -f "webdav-server" || true
pkill -f "ide-bridge" || true
pkill -f "clipboard-watcher" || true
pkill -f "ghost-agent" || true
pkill -f "vulnerability-shield" || true
pkill -f "regression-watcher" || true
pkill -f "scout-docs" || true
pkill -f "bug-predictor" || true
pkill -f "type-guardian" || true
pkill -f "css-optimizer" || true
pkill -f "bundle-watcher" || true

# 3. Clear stale locks
LOCK_FILE="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/.next/dev/lock"
if [ -f "$LOCK_FILE" ]; then
    echo "Clearing stale Next.js dev lock..."
    rm -f "$LOCK_FILE"
fi

# 4. Final verification
sleep 2
IS_3000=$(lsof -i :3000)
IS_8080=$(lsof -i :8080)

if [ -z "$IS_8080" ]; then
    echo "✅ Port 8080 is clear. Starting WebDAV Server..."
    cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard && node /Users/infinite27/AILCC_PRIME/scripts/api/webdav-server.js > /tmp/webdav-server.log 2>&1 &
    echo "WebDAV sequence initiated in background. Tail /tmp/webdav-server.log for status."
else
    echo "⚠️ PORT 8080 STILL OCCUPIED. WebDAV may not start correctly."
fi

if [ -z "$IS_3000" ]; then
    echo "✅ Port 3000 is clear. Starting Dashboard..."
    cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard && npm run dev > /tmp/next-dev-recovery.log 2>&1 &
    echo "Dashboard sequence initiated in background. Tail /tmp/next-dev-recovery.log for status."
else
    echo "❌ PORT 3000 STILL OCCUPIED. Manual intervention required."
# 5. Start Background Daemons
echo "🛡️ Starting Agent-Native IDE Bridge on Port 3005..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/ide-bridge.ts > /tmp/ide-bridge.log 2>&1 &

echo "📱 Starting Universal Clipboard Watcher..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/clipboard-watcher.ts > /tmp/clipboard-watcher.log 2>&1 &

echo "👻 Waking Ghost Agent Predictor..."
node /Users/infinite27/AILCC_PRIME/scripts/api/ghost-agent.js > /tmp/ghost-agent.log 2>&1 &

echo "🛡️ Engaging Dependency Vulnerability Shield..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/vulnerability-shield.ts > /tmp/vulnerability-shield.log 2>&1 &

echo "📉 Booting Performance Regression Watcher..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/regression-watcher.ts > /tmp/regression-watcher.log 2>&1 &

echo "🕵️‍♂️ Booting SCOUT Documentation Daemon..."
(cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard && npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/scout-docs.ts) > /tmp/scout-docs.log 2>&1 &

echo "🔮 Booting Heuristic Bug Predictor..."
(cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard && npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/bug-predictor.ts) > /tmp/bug-predictor.log 2>&1 &

echo "🛡️ Booting Type-Safety Guardian..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/type-guardian.ts > /tmp/type-guardian.log 2>&1 &

echo "🎨 Booting CSS Variable Optimizer..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/css-optimizer.ts > /tmp/css-optimizer.log 2>&1 &

echo "📦 Booting Bundle Size Watcher..."
npx tsx /Users/infinite27/AILCC_PRIME/scripts/api/bundle-watcher.ts > /tmp/bundle-watcher.log 2>&1 &

echo "🌌 Launching AILCC Cortex Menu Bar Widget..."
bash /Users/infinite27/AILCC_PRIME/menu-bar/launch.sh > /tmp/ailcc-menubar.log 2>&1 &
