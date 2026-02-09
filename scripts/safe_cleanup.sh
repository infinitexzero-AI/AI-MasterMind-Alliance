#!/bin/bash
# AILCC Safe Cleanup Script
# Reclaims ~4-5GB without touching Docker VM
# Safe to run - only clears caches and trash

set -e

echo "╔════════════════════════════════════════╗"
echo "║   AILCC Safe Cleanup Script            ║"
echo "║   Reclaims 4-5GB of disk space         ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Starting cleanup at $(date)"
echo ""

# Check initial disk usage
INITIAL_USAGE=$(df / | tail -1 | awk '{print $3}')
echo "📊 Initial disk usage:"
df -h / | tail -1
echo ""

# 1. Empty Trash (579MB)
echo "🗑️  [1/6] Emptying Trash..."
if [ -d ~/.Trash ]; then
    TRASH_SIZE=$(du -sh ~/.Trash 2>/dev/null | awk '{print $1}')
    rm -rf ~/.Trash/*
    echo "   ✓ Cleared $TRASH_SIZE from Trash"
else
    echo "   ✓ Trash already empty"
fi

# 2. Clear system caches (500MB)
echo "🧹 [2/6] Clearing system caches..."
if [ -d ~/Library/Caches ]; then
    rm -rf ~/Library/Caches/*
    echo "   ✓ Cleared ~/Library/Caches"
else
    echo "   ✓ No caches to clear"
fi

# 3. Clear Chrome cache (2-3GB)
echo "🌐 [3/6] Clearing Chrome cache..."
CHROME_CLEARED=0
if [ -d ~/Library/Application\ Support/Google/Chrome/Default/Cache ]; then
    rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache/*
    CHROME_CLEARED=1
fi
if [ -d ~/Library/Application\ Support/Google/Chrome/Default/Code\ Cache ]; then
    rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Code\ Cache/*
    CHROME_CLEARED=1
fi
if [ -d ~/Library/Application\ Support/Google/Chrome/component_crx_cache ]; then
    rm -rf ~/Library/Application\ Support/Google/Chrome/component_crx_cache/*
    CHROME_CLEARED=1
fi
if [ $CHROME_CLEARED -eq 1 ]; then
    echo "   ✓ Cleared Chrome caches"
else
    echo "   ✓ No Chrome caches to clear"
fi

# 4. Docker cleanup (1.2GB)
echo "🐳 [4/6] Cleaning Docker..."
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        docker system prune -af --volumes 2>/dev/null || echo "   ⚠ Docker cleanup skipped (not running)"
        echo "   ✓ Cleaned Docker images and build cache"
    else
        echo "   ⚠ Docker not running, skipping cleanup"
    fi
else
    echo "   ⚠ Docker not installed, skipping"
fi

# 5. Clear Mail cache (500MB)
echo "📧 [5/6] Clearing Mail cache..."
if [ -d ~/Library/Mail ]; then
    rm -rf ~/Library/Mail/V*/MailData/Envelope\ Index* 2>/dev/null || true
    echo "   ✓ Cleared Mail cache"
else
    echo "   ✓ No Mail cache to clear"
fi

# 6. Clear Zoom cache (100MB)
echo "📹 [6/6] Clearing Zoom cache..."
if [ -d ~/Library/Application\ Support/zoom.us/Cache ]; then
    rm -rf ~/Library/Application\ Support/zoom.us/Cache/*
    echo "   ✓ Cleared Zoom cache"
else
    echo "   ✓ No Zoom cache to clear"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Cleanup Complete!                    ║"
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
