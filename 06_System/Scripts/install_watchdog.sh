#!/bin/bash
# AILCC Watchdog Daemon Installer
# Installs the Node.js watchdog script as a persistent macOS LaunchDaemon

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   AILCC Watchdog Daemon Installer                      ║"
echo "║   Configuring macOS launchd persistence...             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Configuration
DAEMON_NAME="com.aimma.watchdog"
PLIST_PATH="$HOME/Library/LaunchAgents/${DAEMON_NAME}.plist"
WATCHDOG_SCRIPT="$HOME/AILCC_PRIME/daemon/watchdog.js"
NODE_PATH=$(which node)

# Verify script exists
if [ ! -f "$WATCHDOG_SCRIPT" ]; then
    echo "❌ Error: Watchdog script not found at $WATCHDOG_SCRIPT"
    exit 1
fi

# Verify node exists
if [ -z "$NODE_PATH" ]; then
    echo "❌ Error: Node.js is not installed or not in PATH."
    exit 1
fi

echo "✅ Found Node.js at: $NODE_PATH"
echo "✅ Found Watchdog script at: $WATCHDOG_SCRIPT"

# Ensure logs directory exists
mkdir -p "$HOME/AILCC_PRIME/logs/daemon"

# Create the plist file
echo "📝 Generating LaunchAgent configuration..."

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${DAEMON_NAME}</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>${NODE_PATH}</string>
        <string>${WATCHDOG_SCRIPT}</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>${HOME}/AILCC_PRIME/logs/daemon/watchdog.stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>${HOME}/AILCC_PRIME/logs/daemon/watchdog.stderr.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/v24.11.1/bin</string>
        <key>HOME</key>
        <string>${HOME}</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ Generated $PLIST_PATH"

# Load the daemon
echo "🚀 Loading daemon via launchctl..."

# Unload if it already exists to refresh
launchctl unload "$PLIST_PATH" 2>/dev/null || true

# Load the new configuration
launchctl load "$PLIST_PATH"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Installation Complete!                               ║"
echo "║   Watchdog daemon is now running in the background.    ║"
echo "║   Logs: ~/AILCC_PRIME/logs/daemon/watchdog.log         ║"
echo "╚════════════════════════════════════════════════════════╝"
