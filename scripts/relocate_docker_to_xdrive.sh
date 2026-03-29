#!/bin/zsh
# ─────────────────────────────────────────────────────────────
# AILCC — Docker.raw Relocation to XDriveAlpha
# Architect: Claude | Date: 2026-03-29
# Frees ~100 GB from internal SSD by moving Docker VM disk
#
# USAGE:
#   chmod +x relocate_docker_to_xdrive.sh
#   ./relocate_docker_to_xdrive.sh
#
# MANUAL STEP REQUIRED AFTER SCRIPT:
#   Docker Desktop → Settings → Resources → Advanced
#   → Change "Disk image location" to: /Volumes/XDriveAlpha/Docker
#   → Click "Apply & Restart"
# ─────────────────────────────────────────────────────────────

set -e

DOCKER_RAW_SRC="$HOME/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw"
XDRIVE_DOCKER_DIR="/Volumes/XDriveAlpha/Docker"
XDRIVE_DOCKER_DEST="$XDRIVE_DOCKER_DIR/Docker.raw"

echo "🐳 AILCC Docker Relocation Script"
echo "══════════════════════════════════"

# Check XDrive is mounted
if [ ! -d "/Volumes/XDriveAlpha" ]; then
    echo "❌ XDriveAlpha not mounted. Connect the drive and retry."
    exit 1
fi
echo "✅ XDriveAlpha is mounted"

# Check Docker.raw exists
if [ ! -f "$DOCKER_RAW_SRC" ]; then
    echo "⚠️  Docker.raw not found at expected path."
    echo "   Docker may already be relocated or not installed."
    exit 0
fi

SIZE=$(du -sh "$DOCKER_RAW_SRC" | cut -f1)
echo "📦 Docker.raw size: $SIZE"
echo "📍 Source: $DOCKER_RAW_SRC"
echo "📍 Destination: $XDRIVE_DOCKER_DEST"
echo ""

# Confirm Docker is NOT running
if pgrep -x "Docker" > /dev/null; then
    echo "⚠️  Docker Desktop is running."
    echo "   Please quit Docker Desktop first: Docker menu → Quit Docker Desktop"
    echo "   Then re-run this script."
    exit 1
fi
echo "✅ Docker Desktop is not running"

# Create destination directory
mkdir -p "$XDRIVE_DOCKER_DIR"
echo "📁 Created: $XDRIVE_DOCKER_DIR"

# Move Docker.raw
echo ""
echo "🚀 Moving Docker.raw to XDriveAlpha... (this may take several minutes)"
rsync -ah --progress "$DOCKER_RAW_SRC" "$DOCKER_RAW_DEST" && \
    echo "✅ Copy verified" && \
    rm "$DOCKER_RAW_SRC" && \
    echo "✅ Original removed"

# Show new SSD free space
FREE=$(df -h / | tail -1 | awk '{print $4}')
echo ""
echo "🎉 Done! SSD free space: $FREE"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ⚠️  REQUIRED MANUAL STEP:"
echo "  1. Open Docker Desktop"
echo "  2. Go to: Settings → Resources → Advanced"
echo "  3. Set 'Disk image location' to:"
echo "     /Volumes/XDriveAlpha/Docker"
echo "  4. Click 'Apply & Restart'"
echo "═══════════════════════════════════════════════════════"
