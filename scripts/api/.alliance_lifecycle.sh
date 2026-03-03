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
