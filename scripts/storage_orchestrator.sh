#!/bin/bash
# Intelligent Storage Orchestrator
# Manages data placement across storage tiers

echo "💾 Storage Orchestrator - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get SSD usage
SSD_PERCENT=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
SSD_USED=$(df -h / | tail -1 | awk '{print $3}')
SSD_FREE=$(df -h / | tail -1 | awk '{print $4}')

echo "Internal SSD Status:"
echo "  Used: ${SSD_USED} (${SSD_PERCENT}%)"
echo "  Free: ${SSD_FREE}"
echo ""

# Check external drives
XDRIVE_ALPHA_MOUNTED=false
XDRIVE_BETA_MOUNTED=false

if [ -d /Volumes/XDriveAlpha ]; then
    XDRIVE_ALPHA_MOUNTED=true
    ALPHA_FREE=$(df -h /Volumes/XDriveAlpha | tail -1 | awk '{print $4}')
    echo "✅ XDriveAlpha: Mounted (${ALPHA_FREE} free)"
else
    echo "⚠️  XDriveAlpha: Not mounted"
fi

if [ -d /Volumes/XDriveBeta ]; then
    XDRIVE_BETA_MOUNTED=true
    BETA_FREE=$(df -h /Volumes/XDriveBeta | tail -1 | awk '{print $4}')
    echo "✅ XDriveBeta: Mounted (${BETA_FREE} free)"
else
    echo "⚠️  XDriveBeta: Not mounted"
fi

echo ""

# Log status
mkdir -p ~/AILCC_PRIME/logs
echo "$(date +%Y-%m-%d\ %H:%M:%S),${SSD_PERCENT},${XDRIVE_ALPHA_MOUNTED},${XDRIVE_BETA_MOUNTED}" >> ~/AILCC_PRIME/logs/storage_orchestrator.csv

# ACTION: SSD usage high
if [ $SSD_PERCENT -gt 75 ]; then
    echo "⚠️  SSD usage at ${SSD_PERCENT}% - Initiating archival procedures"
    
    if [ "$XDRIVE_ALPHA_MOUNTED" = true ]; then
        # 1. Run Hippocampus processor
        echo "  [1/2] Running Hippocampus processor..."
        bash ~/AILCC_PRIME/scripts/hippocampus_processor.sh > /dev/null 2>&1
        echo "    ✓ Archival complete"
        
        # 2. Move large recent files (>100MB, >7 days old)
        echo "  [2/2] Moving large files to external storage..."
        MOVED=0
        if [ -d ~/AILCC_PRIME ]; then
            find ~/AILCC_PRIME -type f -size +100M -mtime +7 2>/dev/null | while read file; do
                FILE_SIZE=$(du -sh "$file" | awk '{print $1}')
                FILE_NAME=$(basename "$file")
                
                # Preserve directory structure
                RELATIVE_PATH=$(echo "$file" | sed "s|$HOME/AILCC_PRIME/||")
                TARGET_DIR="/Volumes/XDriveAlpha/02_Cold_Storage/Large_Files/$(dirname "$RELATIVE_PATH")"
                
                mkdir -p "$TARGET_DIR"
                mv "$file" "$TARGET_DIR/" && echo "      Moved: $FILE_NAME ($FILE_SIZE)" && MOVED=$((MOVED + 1))
            done
        fi
        echo "    ✓ Moved $MOVED large files"
        
        # Send notification
        osascript -e 'display notification "SSD at '"${SSD_PERCENT}"'% - Archival complete" with title "💾 AILCC Storage Optimization"' 2>/dev/null
    else
        echo "  ⚠️  Cannot archive - XDriveAlpha not mounted"
        osascript -e 'display notification "SSD at '"${SSD_PERCENT}"'% but XDriveAlpha not mounted" with title "⚠️ AILCC Storage Alert"' 2>/dev/null
    fi
    
elif [ $SSD_PERCENT -gt 85 ]; then
    echo "🚨 CRITICAL: SSD usage at ${SSD_PERCENT}%"
    osascript -e 'display notification "SSD critically full at '"${SSD_PERCENT}"'%" with title "🚨 AILCC Storage Critical"' 2>/dev/null
    
else
    echo "✅ SSD usage healthy (${SSD_PERCENT}%)"
fi

# Check Docker.raw size
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
    DOCKER_RAW_GB=$(du -sk ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw 2>/dev/null | awk '{print int($1/1024/1024)}')
    
    if [ -n "$DOCKER_RAW_GB" ]; then
        echo ""
        echo "Docker Status:"
        if [ $DOCKER_RAW_GB -gt 20 ]; then
            echo "  ⚠️  Docker.raw: ${DOCKER_RAW_GB}GB (recommend cleanup)"
            osascript -e 'display notification "Docker.raw is '"${DOCKER_RAW_GB}"'GB - run docker system prune" with title "⚠️ AILCC Docker Alert"' 2>/dev/null
        elif [ $DOCKER_RAW_GB -gt 50 ]; then
            echo "  🚨 Docker.raw: ${DOCKER_RAW_GB}GB (CRITICAL - reset VM)"
            osascript -e 'display notification "Docker.raw is '"${DOCKER_RAW_GB}"'GB - reset Docker VM" with title "🚨 AILCC Docker Critical"' 2>/dev/null
        else
            echo "  ✅ Docker.raw: ${DOCKER_RAW_GB}GB (healthy)"
        fi
    fi
fi

# Alert if external drives not mounted
if [ "$XDRIVE_ALPHA_MOUNTED" = false ] || [ "$XDRIVE_BETA_MOUNTED" = false ]; then
    echo ""
    echo "⚠️  External drive(s) not mounted - archival capabilities limited"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Storage Orchestrator complete - $(date)"
echo ""
