#!/bin/zsh
# AILCC Dashboard Auto-Launcher
# Runs on boot via LaunchAgent: com.ailcc.dashboard.plist

DASHBOARD_DIR="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard"
LOG_DIR="/tmp/ailcc"

mkdir -p "$LOG_DIR"

echo "[$(date)] Starting AILCC Dashboard..." >> "$LOG_DIR/startup.log"

# Kill any stale processes on our ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3333 | xargs kill -9 2>/dev/null
sleep 2

# Start Next.js dashboard
cd "$DASHBOARD_DIR"
/usr/local/bin/npm run dev >> "$LOG_DIR/nextjs.log" 2>&1 &
NEXTJS_PID=$!
echo "[$(date)] Next.js started (PID $NEXTJS_PID)" >> "$LOG_DIR/startup.log"

# Wait for Next.js to be ready (up to 30s)
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "[$(date)] Dashboard ready at http://localhost:3000" >> "$LOG_DIR/startup.log"
    break
  fi
  sleep 1
done

# Start Playwright server
node "$DASHBOARD_DIR/automation/playwright-server.js" >> "$LOG_DIR/playwright.log" 2>&1 &
echo "[$(date)] Playwright server started" >> "$LOG_DIR/startup.log"

# Open dashboard in browser
sleep 3
open "http://localhost:3000"

echo "[$(date)] AILCC startup complete." >> "$LOG_DIR/startup.log"
