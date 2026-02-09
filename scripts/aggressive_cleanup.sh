#!/bin/bash
# AILCC Aggressive Cleanup Script
# Reclaims ~115GB including Docker VM reset
# ⚠️ WARNING: This will reset Docker to factory defaults

set -e

echo "╔════════════════════════════════════════╗"
echo "║   AILCC Aggressive Cleanup Script      ║"
echo "║   Reclaims ~115GB of disk space        ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "⚠️  WARNING: This will reset Docker to factory defaults"
echo "   All Docker images, containers, and volumes will be removed"
echo "   You can re-pull images after cleanup"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "Starting aggressive cleanup at $(date)"
echo ""

# Check initial disk usage
INITIAL_USAGE=$(df / | tail -1 | awk '{print $3}')
echo "📊 Initial disk usage:"
df -h / | tail -1
echo ""

# Run safe cleanup first
echo "🧹 Running safe cleanup first..."
if [ -f ~/AILCC_PRIME/scripts/safe_cleanup.sh ]; then
    bash ~/AILCC_PRIME/scripts/safe_cleanup.sh
else
    echo "⚠️  Safe cleanup script not found, skipping..."
fi

echo ""
echo "🐳 Resetting Docker VM..."
echo ""

# Check if Docker.raw exists
DOCKER_RAW=~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw
if [ ! -f "$DOCKER_RAW" ]; then
    echo "⚠️  Docker.raw not found, skipping Docker reset"
else
    DOCKER_SIZE=$(du -sh "$DOCKER_RAW" | awk '{print $1}')
    echo "   Current Docker.raw size: $DOCKER_SIZE"
    
    # Stop Docker
    echo "   Stopping Docker Desktop..."
    osascript -e 'quit app "Docker"' 2>/dev/null || echo "   Docker not running"
    sleep 5
    
    # Remove Docker VM
    echo "   Removing Docker VM..."
    rm -rf "$DOCKER_RAW"
    echo "   ✓ Removed Docker.raw ($DOCKER_SIZE)"
    
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   Docker VM Reset Complete             ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open Docker Desktop"
    echo "   2. It will create a fresh, compact VM (~2GB)"
    echo "   3. Re-pull any needed images:"
    echo "      docker pull <image-name>"
    echo ""
fi

echo "╔════════════════════════════════════════╗"
echo "║   Aggressive Cleanup Complete!         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check final disk usage
FINAL_USAGE=$(df / | tail -1 | awk '{print $3}')
FREED=$((INITIAL_USAGE - FINAL_USAGE))
FREED_GB=$(echo "scale=2; $FREED / 1024 / 1024" | bc)

echo "📊 Final disk usage:"
df -h / | tail -1
echo ""
echo "✨ Freed approximately ${FREED_GB}GB of disk space"
echo ""
echo "Completed at $(date)"
