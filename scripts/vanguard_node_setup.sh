#!/bin/bash

# --- Vanguard Node Setup Script ---
# Run this on your ThinkPad to join the Sovereign OS cluster.
# The MacBook is discovered automatically via mDNS/Bonjour.

set -e

# Configuration
MDNS_HOSTNAME="Macbook-1.local"
RELAY_PORT="3001"
STATIC_FALLBACK_IP="10.0.0.227"
NODE_NAME=$(hostname)
AUTH_TOKEN="antigravity_dev_key"
AILCC_REPO="https://github.com/infinitexzero-AI/AILCC_PRIME.git"
AILCC_DIR="$HOME/AILCC_PRIME"

echo "🚀 Initializing Vanguard Node: $NODE_NAME"

# 0. Clone Repo if not present
if [ ! -d "$AILCC_DIR" ]; then
    echo "📦 Cloning Sovereign OS repository..."
    git clone "$AILCC_REPO" "$AILCC_DIR"
else
    echo "📦 Repository exists. Pulling latest..."
    git -C "$AILCC_DIR" pull --rebase origin main || true
fi

# 1. Resolve MacBook Control Plane via mDNS
echo "🔍 Discovering MacBook control plane via mDNS ($MDNS_HOSTNAME)..."
MACBOOK_IP=$(getent hosts "$MDNS_HOSTNAME" 2>/dev/null | awk '{print $1}' | head -1)

if [ -z "$MACBOOK_IP" ]; then
    # Fallback: try avahi on Linux
    MACBOOK_IP=$(avahi-resolve -n "$MDNS_HOSTNAME" 2>/dev/null | awk '{print $2}' | head -1)
fi

if [ -z "$MACBOOK_IP" ]; then
    echo "⚠️  mDNS resolution failed. Using static fallback: $STATIC_FALLBACK_IP"
    MACBOOK_IP="$STATIC_FALLBACK_IP"
else
    echo "✅ Resolved $MDNS_HOSTNAME → $MACBOOK_IP"
fi

echo "📡 Targeting MacBook Control Plane: $MACBOOK_IP:$RELAY_PORT"

# 2. Install Python Dependencies
echo "📦 Checking dependencies..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install Python 3 and pip."
    exit 1
fi

pip3 install pyperclip requests --quiet

# 3. Configure Environment
export RELAY_URL="http://$MACBOOK_IP:$RELAY_PORT/api/system/clipboard"
export ALLIANCE_BOT_TOKEN="$AUTH_TOKEN"
export NODE_NAME="$NODE_NAME"

# 4. Handle PM2 (Recommended for persistence)
if command -v pm2 &> /dev/null; then
    echo "🔄 Registering with PM2..."
    pm2 stop vanguard-bridge 2>/dev/null || true
    pm2 delete vanguard-bridge 2>/dev/null || true
    pm2 start "$AILCC_DIR/scripts/vanguard_bridge.py" \
        --name vanguard-bridge \
        --interpreter python3 \
        --env RELAY_URL="$RELAY_URL" \
        --env ALLIANCE_BOT_TOKEN="$AUTH_TOKEN" \
        --env NODE_NAME="$NODE_NAME"
    pm2 save
    echo "✅ Vanguard Bridge is now managed by PM2."
    echo ""
    echo "💡 To enable persistence across reboots, run:"
    echo "   pm2 startup && pm2 save"
else
    echo "⚠️  PM2 not found. Install with: npm install -g pm2"
    echo "    Running bridge in foreground for now..."
    RELAY_URL="$RELAY_URL" NODE_NAME="$NODE_NAME" python3 "$AILCC_DIR/scripts/vanguard_bridge.py"
fi

echo ""
echo "✨ Vanguard Node Setup Complete!"
echo "   Check the Nexus Dashboard at http://$MACBOOK_IP:3007 for connection status."

