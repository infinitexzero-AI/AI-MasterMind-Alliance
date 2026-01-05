#!/bin/bash
# Emergency Disk Space Cleanup Script
# Follows Storage Protocol v1.2 safety rules

set -e

echo "🚨 EMERGENCY CLEANUP INITIATED"
echo "================================"

# Check current space
CURRENT_FREE=$(df -h / | awk 'NR==2 {print $4}')
echo "Current free space: $CURRENT_FREE"

# 1. Delete node_modules from archived projects
echo "🗑️ Removing archived node_modules..."
find ~/AILCC_PRIME/01_Areas/Codebases -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find ~/Projects/ARCHIVED_LOCAL -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# 2. Clear build artifacts
echo "🗑️ Clearing build caches..."
find ~/AILCC_PRIME -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find ~/AILCC_PRIME -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# 3. Clear npm cache
echo "🗑️ Clearing npm cache..."
rm -rf ~/.npm/_cacache 2>/dev/null || true

# 4. Delete old logs
echo "🗑️ Removing old logs (>30 days)..."
find ~/AILCC_PRIME -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true

# 5. Check final space
NEW_FREE=$(df -h / | awk 'NR==2 {print $4}')
echo "================================"
echo "✅ CLEANUP COMPLETE"
echo "New free space: $NEW_FREE"
echo "Run: ./protocol_inspector.py --action check_health"
