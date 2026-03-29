#!/bin/bash
# AILCC Weekly Maintenance Script
# Comprehensive weekly cleanup and optimization

echo "╔════════════════════════════════════════╗"
echo "║   AILCC Weekly Maintenance             ║"
echo "╚════════════════════════════════════════╝"
echo "Date: $(date)"
echo ""

# Check initial state
echo "📊 Initial System State:"
df -h / | tail -1 | awk '{print "   SSD: " $3 " used / " $2 " total (" $5 ")"}'
SWAP_BEFORE=$(sysctl vm.swapusage | awk '{print $7}')
echo "   Swap: $SWAP_BEFORE used"
echo ""

# 1. Clear caches
echo "🧹 [1/6] Clearing system caches..."
if [ -d ~/Library/Caches ]; then
    CACHE_SIZE=$(du -sh ~/Library/Caches 2>/dev/null | awk '{print $1}')
    rm -rf ~/Library/Caches/*
    echo "   ✓ Cleared $CACHE_SIZE from caches"
else
    echo "   ✓ No caches to clear"
fi

# 2. Docker cleanup
echo "🐳 [2/6] Cleaning Docker..."
if command -v docker &> /dev/null && docker info &> /dev/null; then
    DOCKER_BEFORE=$(docker system df | grep "Total" | awk '{print $4}')
    docker system prune -af --volumes 2>/dev/null
    DOCKER_AFTER=$(docker system df | grep "Total" | awk '{print $4}')
    echo "   ✓ Docker cleaned: $DOCKER_BEFORE → $DOCKER_AFTER"
else
    echo "   ⚠ Docker not running, skipping"
fi

# 3. Check for large files
echo "📦 [3/6] Checking for large files (>500MB)..."
LARGE_FILES=$(find ~ -type f -size +500M 2>/dev/null | grep -v "Library/Containers/com.docker.docker" | head -5)
if [ -n "$LARGE_FILES" ]; then
    echo "   Found large files:"
    echo "$LARGE_FILES" | while read file; do
        SIZE=$(du -sh "$file" 2>/dev/null | awk '{print $1}')
        echo "     $SIZE - $(basename "$file")"
    done
else
    echo "   ✓ No large files found"
fi

# 4. Empty trash
echo "🗑️  [4/6] Emptying trash..."
if [ -d ~/.Trash ]; then
    TRASH_SIZE=$(du -sh ~/.Trash 2>/dev/null | awk '{print $1}')
    rm -rf ~/.Trash/*
    echo "   ✓ Cleared $TRASH_SIZE from trash"
else
    echo "   ✓ Trash already empty"
fi

# 5. Restart language server if needed
echo "🔄 [5/6] Checking language server..."
bash ~/AILCC_PRIME/scripts/restart_language_server.sh 2>/dev/null || echo "   ⚠ Language server script not found"

# 6. Check Docker.raw size
echo "🐋 [6/6] Checking Docker VM size..."
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
    DOCKER_RAW_SIZE=$(du -sh ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw | awk '{print $1}')
    DOCKER_RAW_GB=$(du -sk ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw | awk '{print int($1/1024/1024)}')
    echo "   Docker.raw: $DOCKER_RAW_SIZE"
    
    if [ $DOCKER_RAW_GB -gt 20 ]; then
        echo "   ⚠️  WARNING: Docker.raw exceeds 20GB!"
        echo "      Consider resetting Docker VM:"
        echo "      bash ~/AILCC_PRIME/scripts/aggressive_cleanup.sh"
    else
        echo "   ✓ Docker.raw size healthy"
    fi
else
    echo "   ⚠ Docker.raw not found"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Weekly Maintenance Complete!         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Show final state
echo "📊 Final System State:"
df -h / | tail -1 | awk '{print "   SSD: " $3 " used / " $2 " total (" $5 ")"}'
SWAP_AFTER=$(sysctl vm.swapusage | awk '{print $7}')
echo "   Swap: $SWAP_AFTER used"

echo ""
echo "💡 Recommendations:"
echo "   - Review large files and consider archiving"
echo "   - Monitor memory usage: bash ~/AILCC_PRIME/scripts/monitor_memory.sh"
echo "   - Check storage: bash ~/AILCC_PRIME/scripts/monitor_storage.sh"

echo ""
echo "Completed at $(date)"
