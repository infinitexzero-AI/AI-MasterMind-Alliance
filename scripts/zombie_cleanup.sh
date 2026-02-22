#!/bin/bash
# AILCC - Comet Browser Stabilization: Zombie Cleanup Protocol
# Resolves persistent 'target closed' and SIGTRAP leaks caused by headless execution.

echo "🔱 Initiating Protocol: Comet Zombie Process Execution..."

# 1. Tally hanging processes before cleanup
CHROME_COUNT=$(pgrep -i "Google Chrome|chrome" | wc -l | tr -d ' ')
PUPPETEER_COUNT=$(pgrep -i "puppeteer" | wc -l | tr -d ' ')

echo "🔍 Initial Assessment: Found $CHROME_COUNT Chrome instances and $PUPPETEER_COUNT Puppeteer instances."

# 2. Aggressive termination of target processes
if [ "$CHROME_COUNT" -gt 0 ]; then
    echo "⚠️ Terminating $CHROME_COUNT hanging Google Chrome processes..."
    pkill -9 -f "Google Chrome" || true
    pkill -9 -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" || true
fi

if [ "$PUPPETEER_COUNT" -gt 0 ]; then
    echo "⚠️ Terminating $PUPPETEER_COUNT hanging Puppeteer processes..."
    pkill -9 -f "puppeteer" || true
fi

# 3. Clean up generic Node.js Playwright/Puppeteer workers if they match web scraping args
NODE_BROWSER_COUNT=$(ps aux | grep node | grep -E "(playwright|puppeteer|browserless)" | grep -v grep | wc -l | tr -d ' ')
if [ "$NODE_BROWSER_COUNT" -gt 0 ]; then
    echo "⚠️ Terminating $NODE_BROWSER_COUNT orphaned Node browser workers..."
    ps aux | grep node | grep -E "(playwright|puppeteer|browserless)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
fi

echo "✅ Zombie cleanup sweep complete. Comet Browser State Reset."
