#!/bin/bash
# FORCE OPEN PRIME WORKSPACE
# Usage: ./force_open.sh

TARGET="/Users/infinite27/AILCC_PRIME"

echo "🚀 Attempting to Force-Open: $TARGET"

# Try Standard VS Code CLI
if command -v code &> /dev/null; then
    code "$TARGET"
    echo "✅ Sent signal to VS Code."
    exit 0
fi

# Try Common VS Code Install Paths
if [ -f "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]; then
    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" "$TARGET"
    echo "✅ Sent signal to VS Code (Direct Path)."
    exit 0
fi

# Fallback to Finder
echo "⚠️ VS Code CLI not found. Opening in Finder..."
open "$TARGET"
