#!/bin/bash

# System Stabilization: Docker Migration Verification Script
# This script verifies the symbolic link integrity and available disk space.

DOCKER_DIR="$HOME/Library/Containers/com.docker.docker/Data/vms/0/data"
FILE_NAME="Docker.raw"
TARGET_PATH="/Volumes/XDriveBeta/Docker_Backup/$FILE_NAME"
ORIGINAL_PATH="$DOCKER_DIR/$FILE_NAME"

echo "--- 🔍 Starting System Stabilization Verification ---"

# 1. Check Symlink
if [ -L "$ORIGINAL_PATH" ]; then
    echo "✅ SUCCESS: Symbolic link exists at original path."
    LINK_TARGET=$(readlink "$ORIGINAL_PATH")
    if [ "$LINK_TARGET" == "$TARGET_PATH" ]; then
        echo "✅ SUCCESS: Symlink points to correct destination on XDriveBeta."
    else
        echo "❌ FAILURE: Symlink points to wrong location: $LINK_TARGET"
    fi
else
    echo "❌ FAILURE: Symbolic link not found at $ORIGINAL_PATH."
fi

# 2. Check Target File
if [ -f "$TARGET_PATH" ]; then
    echo "✅ SUCCESS: Docker disk image found on external volume."
    # Check if target file has content
    SIZE=$(ls -lh "$TARGET_PATH" | awk '{print $5}')
    echo "📊 INFO: Current external image size: $SIZE"
else
    echo "❌ FAILURE: Docker disk image not found at $TARGET_PATH."
fi

# 3. Check Disk Space
FREE_SPACE=$(df -h / | tail -1 | awk '{print $4}')
echo "💿 INFO: Available storage on internal SSD: $FREE_SPACE"

# 4. Check for active Docker processes to ensure it's not locked
pgrep -i Docker > /dev/null
if [ $? -eq 0 ]; then
    echo "⚠️  WARNING: Docker processes are still active. Please restart Docker manually after verify."
else
    echo "✅ INFO: No Docker processes detected. Ready for restart."
fi

echo "--- 📝 Verification Complete ---"
echo "Instructions: Please manually start Docker Desktop and confirm 'Docker is running' in the UI."
