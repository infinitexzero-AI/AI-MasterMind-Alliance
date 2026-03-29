#!/bin/bash
# AILCC System Monitoring Script
# Checks storage and memory status daily

echo "╔════════════════════════════════════════╗"
echo "║   AILCC System Status                  ║"
echo "╚════════════════════════════════════════╝"
echo "Date: $(date)"
echo ""

# Disk usage
echo "📀 Internal SSD:"
df -h / | tail -1 | awk '{print "   " $3 " used / " $2 " total (" $5 ")"}'

# Docker.raw size
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
    DOCKER_SIZE=$(du -sh ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw | awk '{print $1}')
    echo "   Docker.raw: $DOCKER_SIZE"
fi

# External drives
echo ""
echo "💾 External Drives:"
if [ -d "/Volumes/XDriveAlpha" ]; then
    echo "   XDriveAlpha:"
    df -h /Volumes/XDriveAlpha | tail -1 | awk '{print "     " $3 " used / " $2 " total (" $5 ")"}'
else
    echo "   ⚠️  XDriveAlpha: NOT MOUNTED"
fi

if [ -d "/Volumes/XDriveBeta" ]; then
    echo "   XDriveBeta:"
    df -h /Volumes/XDriveBeta | tail -1 | awk '{print "     " $3 " used / " $2 " total (" $5 ")"}'
else
    echo "   ⚠️  XDriveBeta: NOT MOUNTED"
fi

# Memory usage
echo ""
echo "💾 Memory:"
vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("   %-16s % 16.2f MB\n", "$1:", $2 * $size / 1048576);'

# Trash size
TRASH_SIZE=$(du -sh ~/.Trash 2>/dev/null | awk '{print $1}')
echo ""
echo "🗑️  Trash: $TRASH_SIZE"

# Alert if SSD > 85%
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $USAGE -gt 85 ]; then
    echo ""
    echo "⚠️  WARNING: SSD usage above 85%!"
    echo "   Consider running cleanup script:"
    echo "   bash ~/AILCC_PRIME/scripts/safe_cleanup.sh"
fi

# Alert if Docker.raw > 50GB
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
    DOCKER_GB=$(du -sk ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw | awk '{print int($1/1024/1024)}')
    if [ $DOCKER_GB -gt 50 ]; then
        echo ""
        echo "⚠️  WARNING: Docker.raw is ${DOCKER_GB}GB!"
        echo "   Consider resetting Docker VM:"
        echo "   bash ~/AILCC_PRIME/scripts/aggressive_cleanup.sh"
    fi
fi

echo ""
