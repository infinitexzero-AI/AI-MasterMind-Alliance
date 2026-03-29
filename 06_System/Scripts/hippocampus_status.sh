#!/bin/bash
# Hippocampus Health Dashboard
# Displays comprehensive storage system status

echo "╔════════════════════════════════════════╗"
echo "║   Hippocampus Health Status            ║"
echo "╚════════════════════════════════════════╝"
echo "Date: $(date)"
echo ""

# Tier 1: Hot Storage (Internal SSD)
echo "📀 Tier 1 - Hot Storage (Internal SSD):"
df -h / | tail -1 | awk '{print "   Used: " $3 " / " $2 " (" $5 ")"}'
df -h / | tail -1 | awk '{print "   Free: " $4}'

# Check critical files
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
    DOCKER_SIZE=$(du -sh ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw | awk '{print $1}')
    echo "   Docker.raw: $DOCKER_SIZE"
fi

echo ""

# Tier 2: Warm Storage (XDriveAlpha)
echo "💾 Tier 2 - Warm Storage (XDriveAlpha):"
if [ -d /Volumes/XDriveAlpha ]; then
    df -h /Volumes/XDriveAlpha | tail -1 | awk '{print "   Used: " $3 " / " $2 " (" $5 ")"}'
    df -h /Volumes/XDriveAlpha | tail -1 | awk '{print "   Free: " $4}'
    echo "   Status: ✅ Mounted"
else
    echo "   Status: ⚠️  Not mounted"
fi

echo ""

# Tier 3: Cold Storage (XDriveBeta)
echo "🧊 Tier 3 - Cold Storage (XDriveBeta):"
if [ -d /Volumes/XDriveBeta ]; then
    df -h /Volumes/XDriveBeta | tail -1 | awk '{print "   Used: " $3 " / " $2 " (" $5 ")"}'
    df -h /Volumes/XDriveBeta | tail -1 | awk '{print "   Free: " $4}'
    echo "   Status: ✅ Mounted"
else
    echo "   Status: ⚠️  Not mounted"
fi

echo ""

# Memory Status
echo "💾 System Memory:"
FREE_MB=$(vm_stat | awk '/Pages free/ {print int($3 * 4096 / 1048576)}')
SWAP_INFO=$(sysctl vm.swapusage | awk '{print $4, $7}')
SWAP_TOTAL=$(echo $SWAP_INFO | awk '{print $1}' | sed 's/M//')
SWAP_USED=$(echo $SWAP_INFO | awk '{print $2}' | sed 's/M//')

if [ -n "$SWAP_TOTAL" ] && [ "$SWAP_TOTAL" != "0" ]; then
    SWAP_PERCENT=$(echo "scale=0; ($SWAP_USED * 100) / $SWAP_TOTAL" | bc)
else
    SWAP_PERCENT=0
fi

echo "   Free RAM: ${FREE_MB}MB"
echo "   Swap: ${SWAP_USED}MB / ${SWAP_TOTAL}MB (${SWAP_PERCENT}%)"

if [ $FREE_MB -lt 100 ]; then
    echo "   Status: ⚠️  Critical (low memory)"
elif [ $SWAP_PERCENT -gt 70 ]; then
    echo "   Status: ⚠️  Warning (high swap)"
else
    echo "   Status: ✅ Healthy"
fi

echo ""

# Cloud Sync Status
echo "☁️  Cloud Sync Services:"
ps aux | grep -i "Google Drive" | grep -v grep > /dev/null && echo "   ✓ Google Drive: Active" || echo "   ✗ Google Drive: Inactive"
ps aux | grep -i "OneDrive" | grep -v grep > /dev/null && echo "   ✓ OneDrive: Active" || echo "   ✗ OneDrive: Inactive"
ps aux | grep -i "bird" | grep -v grep > /dev/null && echo "   ✓ iCloud: Active" || echo "   ✗ iCloud: Inactive"

# Check for duplicate Google Drive folders
GDRIVE_FOLDERS=$(ls -1 ~/Library/CloudStorage/ 2>/dev/null | grep -c "GoogleDrive")
if [ $GDRIVE_FOLDERS -gt 1 ]; then
    echo "   ⚠️  Warning: $GDRIVE_FOLDERS Google Drive folders detected"
fi

echo ""

# Recent Archival Activity
echo "📦 Recent Archival Activity:"
if [ -d /Volumes/XDriveAlpha/02_Cold_Storage/Projects_Archive ]; then
    RECENT_PROJECTS=$(find /Volumes/XDriveAlpha/02_Cold_Storage/Projects_Archive -type d -maxdepth 1 -mtime -7 2>/dev/null | wc -l | tr -d ' ')
    echo "   Projects archived (last 7 days): $RECENT_PROJECTS"
else
    echo "   No archive directory found"
fi

if [ -d /Volumes/XDriveAlpha/02_Cold_Storage/Logs ]; then
    RECENT_LOGS=$(find /Volumes/XDriveAlpha/02_Cold_Storage/Logs -name "*.log.gz" -mtime -7 2>/dev/null | wc -l | tr -d ' ')
    echo "   Logs archived (last 7 days): $RECENT_LOGS"
fi

echo ""

# Hippocampus Index
echo "📇 Hippocampus Index:"
if [ -f ~/AILCC_PRIME/.hippocampus_index.txt ]; then
    INDEX_DATE=$(head -2 ~/AILCC_PRIME/.hippocampus_index.txt | tail -1 | sed 's/# Generated: //')
    echo "   Last updated: $INDEX_DATE"
else
    echo "   ⚠️  Index not found (run hippocampus_processor.sh)"
fi

echo ""
echo "💡 Quick Actions:"
echo "   Monitor memory: bash ~/AILCC_PRIME/scripts/monitor_memory.sh"
echo "   Monitor storage: bash ~/AILCC_PRIME/scripts/monitor_storage.sh"
echo "   Run processor: bash ~/AILCC_PRIME/scripts/hippocampus_processor.sh"
echo ""
