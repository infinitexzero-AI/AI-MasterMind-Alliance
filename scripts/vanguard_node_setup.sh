#!/bin/bash

# --- Vanguard Node Setup Script ---
# Run this on your ThinkPad to register it with the MacBook Control Plane.

# Configuration
MACBOOK_IP="10.0.0.227"
RELAY_PORT="3001"
NODE_NAME=$(hostname)
AUTH_TOKEN="antigravity_dev_key" # Replace with your actual token

echo "🚀 Initializing Vanguard Node: $NODE_NAME"
echo "📡 Targeting MacBook Control Plane: $MACBOOK_IP:$RELAY_PORT"

# 1. Install Dependencies
echo "📦 Checking dependencies..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install Python 3 and pip."
    exit 1
fi

pip3 install pyperclip requests --quiet

# 2. Configure Environment
export RELAY_URL="http://$MACBOOK_IP:$RELAY_PORT/api/system/clipboard"
export ALLIANCE_BOT_TOKEN="$AUTH_TOKEN"
export NODE_NAME="$NODE_NAME"

# 3. Handle PM2 (Optional but Recommended)
if command -v pm2 &> /dev/null; then
    echo "🔄 Registering with PM2..."
    pm2 stop vanguard-bridge 2>/dev/null || true
    pm2 start vanguard_bridge.py --name vanguard-bridge --interpreter python3 \
        --env RELAY_URL="$RELAY_URL" \
        --env ALLIANCE_BOT_TOKEN="$AUTH_TOKEN" \
        --env NODE_NAME="$NODE_NAME"
    pm2 save
    echo "✅ Vanguard Bridge is now managed by PM2."
else
    echo "⚠️ PM2 not found. Running bridge in foreground..."
    python3 vanguard_bridge.py
fi

echo "✨ Vanguard Node Setup Complete. Check the Nexus Dashboard for connection status."
