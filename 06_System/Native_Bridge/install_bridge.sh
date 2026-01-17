#!/bin/bash

# Antigravity Bridge Installer
# Registers the Python host with Chrome/Comet

HOST_NAME="com.ailcc.antigravity.bridge"
HOST_PATH="$(pwd)/bridge_host.py"
MANIFEST_TEMPLATE="com.ailcc.antigravity.bridge.json"

echo "🌌 Antigravity Bridge Installer"
echo "--------------------------------"

# Check if bridge_host.py exists
if [ ! -f "$HOST_PATH" ]; then
    echo "Error: bridge_host.py not found in current directory."
    exit 1
fi

chmod +x "$HOST_PATH"
echo "✅ Made bridge_host.py executable."

# Ask for Extension ID
echo ""
# The ID of the Chrome Extension (from chrome://extensions)
EXTENSION_ID="kkedoppemlmaimecgpcieigdemdkjeca"
echo "Using pre-defined Extension ID: $EXTENSION_ID"
EXT_ID="$EXTENSION_ID"

if [ -z "$EXT_ID" ]; then
    echo "Error: Extension ID is required."
    exit 1
fi

# Generate Manifest
echo "Generating manifest..."
cat > "$MANIFEST_TEMPLATE" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Antigravity Bridge Host",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$EXT_ID/"
  ]
}
EOF

# Install locations
CHROME_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
# Trying to guess Comet/Perplexity paths? Usually they stick to Chrome's or have their own.
# For now, installing to Chrome's default path often works if the browser processes check it, 
# but for a custom browser like Comet we might need to find its specific path.
# Assuming Comet might use standard Chromium locations or we need to investigate.
# We will install to Chrome and Chromium.

mkdir -p "$CHROME_DIR"
cp "$MANIFEST_TEMPLATE" "$CHROME_DIR/$HOST_NAME.json"
echo "✅ Installed to Chrome: $CHROME_DIR/$HOST_NAME.json"

CHROMIUM_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
mkdir -p "$CHROMIUM_DIR"
cp "$MANIFEST_TEMPLATE" "$CHROMIUM_DIR/$HOST_NAME.json"
echo "✅ Installed to Chromium: $CHROMIUM_DIR/$HOST_NAME.json"

echo ""
echo "🎉 Bridge Installed! Reload your extension."
