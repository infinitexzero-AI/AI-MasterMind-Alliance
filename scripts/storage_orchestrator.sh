#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# Intelligent Storage Orchestrator v2
# Manages data placement across ALL storage tiers:
#   HOT  → Internal SSD (OS, runtime, active code)
#   WARM → XDriveAlpha (logs, cold storage, cloud backups)
#   COLD → XDriveBeta (academic vault, archival)
#   CLOUD → iCloud / OneDrive / GoogleDrive
# ══════════════════════════════════════════════════════════════════════════════

echo "💾 Storage Orchestrator v2 — $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Internal SSD ─────────────────────────────────────────────────────────────
SSD_PERCENT=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
SSD_USED=$(df -h / | tail -1 | awk '{print $3}')
SSD_FREE=$(df -h / | tail -1 | awk '{print $4}')

echo ""
echo "📀 Internal SSD:"
echo "   Used: ${SSD_USED} (${SSD_PERCENT}%)"
echo "   Free: ${SSD_FREE}"

# ── External Drives ──────────────────────────────────────────────────────────
echo ""
echo "💾 External Drives:"

XDRIVE_ALPHA="/Volumes/XDriveAlpha"
XDRIVE_BETA="/Volumes/XDriveBeta"
ALPHA_MOUNTED=false
BETA_MOUNTED=false

if [ -d "$XDRIVE_ALPHA" ]; then
    ALPHA_MOUNTED=true
    ALPHA_FREE=$(df -h "$XDRIVE_ALPHA" | tail -1 | awk '{print $4}')
    ALPHA_USED=$(df -h "$XDRIVE_ALPHA" | tail -1 | awk '{print $5}')
    echo "   XDriveAlpha: ✅ Mounted (${ALPHA_FREE} free, ${ALPHA_USED} used)"
else
    echo "   XDriveAlpha: ❌ Not mounted"
fi

if [ -d "$XDRIVE_BETA" ]; then
    BETA_MOUNTED=true
    BETA_FREE=$(df -h "$XDRIVE_BETA" | tail -1 | awk '{print $4}')
    BETA_USED=$(df -h "$XDRIVE_BETA" | tail -1 | awk '{print $5}')
    echo "   XDriveBeta:  ✅ Mounted (${BETA_FREE} free, ${BETA_USED} used)"
else
    echo "   XDriveBeta:  ❌ Not mounted"
fi

# ── Cloud Sync Status ────────────────────────────────────────────────────────
echo ""
echo "☁️  Cloud Sync:"

ICLOUD_PATH="$HOME/Library/Mobile Documents/com~apple~CloudDocs"
ONEDRIVE_PATH="$HOME/OneDrive"
GDRIVE_PATH="$HOME/Google Drive"

if [ -d "$ICLOUD_PATH" ]; then
    ICLOUD_SIZE=$(du -sh "$ICLOUD_PATH" 2>/dev/null | cut -f1)
    echo "   iCloud:      ✅ Active (${ICLOUD_SIZE} local)"
else
    echo "   iCloud:      ⚪ Inactive"
fi

if [ -d "$ONEDRIVE_PATH" ]; then
    ONEDRIVE_SIZE=$(du -sh "$ONEDRIVE_PATH" 2>/dev/null | cut -f1)
    echo "   OneDrive:    ✅ Active (${ONEDRIVE_SIZE} local)"
else
    echo "   OneDrive:    ⚪ Inactive"
fi

if [ -d "$GDRIVE_PATH" ]; then
    GDRIVE_SIZE=$(du -sh "$GDRIVE_PATH" 2>/dev/null | cut -f1)
    echo "   GoogleDrive: ✅ Active (${GDRIVE_SIZE} local)"
else
    echo "   GoogleDrive: ⚪ Inactive"
fi

# ── Log Status ────────────────────────────────────────────────────────────
mkdir -p ~/AILCC_PRIME/logs
echo "$(date +%Y-%m-%d\ %H:%M:%S),${SSD_PERCENT},${ALPHA_MOUNTED},${BETA_MOUNTED}" >> ~/AILCC_PRIME/logs/storage_orchestrator.csv

# ── Docker Status ────────────────────────────────────────────────────────
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
    DOCKER_RAW_GB=$(du -sk ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw 2>/dev/null | awk '{print int($1/1024/1024)}')
    if [ -n "$DOCKER_RAW_GB" ]; then
        echo ""
        echo "🐳 Docker:"
        if [ "$DOCKER_RAW_GB" -gt 50 ]; then
            echo "   🚨 Docker.raw: ${DOCKER_RAW_GB}GB (CRITICAL — reset Docker VM)"
        elif [ "$DOCKER_RAW_GB" -gt 20 ]; then
            echo "   ⚠️  Docker.raw: ${DOCKER_RAW_GB}GB (run: docker system prune -af)"
        else
            echo "   ✅ Docker.raw: ${DOCKER_RAW_GB}GB"
        fi
    fi
fi

# ── ACTION: SSD Pressure Relief ──────────────────────────────────────────
echo ""

if [ "$SSD_PERCENT" -gt 95 ]; then
    echo "🚨 CRITICAL: SSD at ${SSD_PERCENT}% — executing StorageMind emergency recovery"
    python3 ~/AILCC_PRIME/scripts/StorageMind.py --recover

elif [ "$SSD_PERCENT" -gt 85 ]; then
    echo "⚠️  WARNING: SSD at ${SSD_PERCENT}% — executing StorageMind optimization"
    python3 ~/AILCC_PRIME/scripts/StorageMind.py --optimize

elif [ "$SSD_PERCENT" -gt 75 ]; then
    echo "📊 SSD at ${SSD_PERCENT}% — running cache cleanup"

    if [ "$ALPHA_MOUNTED" = true ]; then
        # Archive old logs to Alpha
        echo "  [1/2] Archiving logs to XDriveAlpha..."
        LOG_DEST="$XDRIVE_ALPHA/00_System_Logs/$(date +%Y%m%d)"
        mkdir -p "$LOG_DEST"
        find ~/AILCC_PRIME/logs -name "*.log" -mtime +3 -exec mv {} "$LOG_DEST/" \; 2>/dev/null
        echo "    ✓ Log archival complete"

        # Move large files (>100MB, >7 days old) to cold storage
        echo "  [2/2] Moving large files to cold storage..."
        MOVED=0
        if [ -d ~/AILCC_PRIME ]; then
            find ~/AILCC_PRIME -type f -size +100M -mtime +7 2>/dev/null | while read file; do
                FILE_SIZE=$(du -sh "$file" | awk '{print $1}')
                FILE_NAME=$(basename "$file")
                RELATIVE_PATH=$(echo "$file" | sed "s|$HOME/AILCC_PRIME/||")
                TARGET_DIR="$XDRIVE_ALPHA/02_Cold_Storage/Large_Files/$(dirname "$RELATIVE_PATH")"
                mkdir -p "$TARGET_DIR"
                mv "$file" "$TARGET_DIR/" && echo "      Moved: $FILE_NAME ($FILE_SIZE)" && MOVED=$((MOVED + 1))
            done
        fi
        echo "    ✓ Large file migration complete"

        osascript -e 'display notification "SSD at '"${SSD_PERCENT}"'% — optimization complete" with title "💾 AILCC StorageMind"' 2>/dev/null
    else
        echo "  ⚠️  Cannot archive — no external drives mounted"
        osascript -e 'display notification "SSD at '"${SSD_PERCENT}"'% but no external drives" with title "⚠️ AILCC Storage Alert"' 2>/dev/null
    fi

else
    echo "✅ SSD usage healthy (${SSD_PERCENT}%)"
fi

# ── Missing Drives Alert ──────────────────────────────────────────────────
if [ "$ALPHA_MOUNTED" = false ] && [ "$BETA_MOUNTED" = false ]; then
    echo ""
    echo "⚠️  No external drives mounted — archival capabilities disabled"
    osascript -e 'display notification "No external drives detected" with title "⚠️ AILCC Storage"' 2>/dev/null
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Storage Orchestrator v2 complete — $(date)"
echo ""
