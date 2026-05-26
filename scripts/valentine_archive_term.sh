#!/bin/zsh
# ==============================================================================
# valentine_archive_term - Safe Cloud Term Archiver (Antigravity Automation Layer)
# ==============================================================================
# Safely relocates past academic terms from OneDrive Academic to Google Drive
# cold storage. Aligned with the Valentine System Triage guidelines.
#
# Constraints respected:
#   * Safe shallow discovery only (no recursive du/find on active cloud mounts)
#   * Manifest generation before moving
#   * Dry-run mode by default to prevent accidental data shifts
# ==============================================================================

set -e

# Configurable Paths
ACADEMIC_ONEDRIVE="/Users/infinite27/Library/CloudStorage/OneDrive-MountAllisonUniversity"
ARCHIVE_SOURCE_BASE="$ACADEMIC_ONEDRIVE/_ARCHIVE_Past_Terms"
MANIFEST_DIR="$ACADEMIC_ONEDRIVE/_SYSTEM/_MANIFESTS"

# Default Variables
TERM_NAME=""
RCLONE_REMOTE="gdrive"
RCLONE_DEST_BASE="AILCC_ARCHIVE/Academic"
DRY_RUN=true
FORCE_SHALLOW_MV=false

# ──────────────────────────────────────────────────────────────────────────────
# Helper: Print Usage
# ──────────────────────────────────────────────────────────────────────────────
usage() {
    echo "Usage: $0 --term <term_name> [options]"
    echo ""
    echo "Required:"
    echo "  -t, --term <term_name>      Name of the past term folder to archive (e.g. 2025_Fall)"
    echo ""
    echo "Options:"
    echo "  -d, --dest <remote>         rclone remote name (default: gdrive)"
    echo "  -x, --execute               Deactivate dry-run mode and actually perform moves"
    echo "  --force-mv                  Skip rclone and use local filesystem 'mv' to destination mount"
    echo "  -h, --help                  Show this help message"
    exit 1
}

# Parse Arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--term) TERM_NAME="$2"; shift ;;
        -d|--dest) RCLONE_REMOTE="$2"; shift ;;
        -x|--execute) DRY_RUN=false ;;
        --force-mv) FORCE_SHALLOW_MV=true ;;
        -h|--help) usage ;;
        *) echo "Unknown parameter passed: $1"; usage ;;
    esac
    shift
done

if [ -z "$TERM_NAME" ]; then
    echo "❌ Error: Term name (--term) is required."
    usage
fi

# Set specific source path
SRC_DIR="$ARCHIVE_SOURCE_BASE/$TERM_NAME"

# ──────────────────────────────────────────────────────────────────────────────
# 1. Pre-flight Checks
# ──────────────────────────────────────────────────────────────────────────────
echo "🔍 [Valentine Archiver] Initializing triage sweep for term: '$TERM_NAME'..."

if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Error: Source directory does not exist: $SRC_DIR"
    echo "   Staging folder in OneDrive Academic '_ARCHIVE_Past_Terms/' first."
    exit 1
fi

# Detect rclone presence
RCLONE_PATH=$(which rclone 2>/dev/null || echo "")
if [ -z "$RCLONE_PATH" ] && [ "$FORCE_SHALLOW_MV" = "false" ]; then
    echo "⚠️  rclone was not found in PATH."
    echo "   To install rclone, run: brew install rclone"
    echo "   Falling back to local mount move mode (--force-mv)."
    FORCE_SHALLOW_MV=true
fi

# Verify connection if rclone mode
if [ "$FORCE_SHALLOW_MV" = "false" ]; then
    echo "⚡ Testing rclone remote connection to: '$RCLONE_REMOTE'..."
    if ! rclone listremotes | grep -q "^$RCLONE_REMOTE:"; then
        echo "❌ Error: Remote '$RCLONE_REMOTE' is not configured in rclone."
        echo "   Run 'rclone config' to set up your Google Drive remote."
        exit 1
    fi
fi

# ──────────────────────────────────────────────────────────────────────────────
# 2. Manifest Staging (Safe Shallow Scanning)
# ──────────────────────────────────────────────────────────────────────────────
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MANIFEST_FILE="$MANIFEST_DIR/archive_${TERM_NAME}_${TIMESTAMP}.manifest"
mkdir -p "$MANIFEST_DIR"

echo "📝 Staging archival manifest to: $MANIFEST_FILE..."

# Secure metadata safely (non-recursively for size, shallow listings only)
{
    echo "# =============================================================================="
    echo "# AILCC Archival Manifest: $TERM_NAME"
    echo "# Generated: $(date)"
    echo "# Source: $SRC_DIR"
    echo "# Mode: $( [ "$FORCE_SHALLOW_MV" = "true" ] && echo "Local FileProvider Mount Move" || echo "Direct rclone API" )"
    echo "# =============================================================================="
    echo ""
    echo "--- File Inventory ---"
    # Safe shallow list of files inside the term folder (using find with depth limit for hydration safety)
    find "$SRC_DIR" -maxdepth 3 -type f -exec ls -lh {} \;
} > "$MANIFEST_FILE"

echo "✅ Manifest successfully staged."

# ──────────────────────────────────────────────────────────────────────────────
# 3. Archival Execution
# ──────────────────────────────────────────────────────────────────────────────
if [ "$DRY_RUN" = "true" ]; then
    echo ""
    echo "================================================================================"
    echo "🔍 DRY-RUN MODE ACTIVATED (No files will be modified)"
    echo "================================================================================"
    echo "Source: $SRC_DIR"
    if [ "$FORCE_SHALLOW_MV" = "true" ]; then
        echo "Destination: /Users/infinite27/Library/CloudStorage/GoogleDrive-eastcoastfreshcoats@gmail.com/My Drive/$RCLONE_DEST_BASE/$TERM_NAME"
        echo "Command to run: mv \"$SRC_DIR\" \"/Users/infinite27/Library/CloudStorage/GoogleDrive-eastcoastfreshcoats@gmail.com/My Drive/$RCLONE_DEST_BASE/\""
    else
        echo "Destination: $RCLONE_REMOTE:$RCLONE_DEST_BASE/$TERM_NAME"
        echo "Command to run: rclone move \"$SRC_DIR\" \"$RCLONE_REMOTE:$RCLONE_DEST_BASE/$TERM_NAME\" --progress"
    fi
    echo "================================================================================"
    echo "💡 To execute this move, run with the -x or --execute flag."
    exit 0
fi

# Real Move Execution
echo "🚀 Beginning direct relocation of term '$TERM_NAME'..."

if [ "$FORCE_SHALLOW_MV" = "true" ]; then
    GDRIVE_MOUNT="/Users/infinite27/Library/CloudStorage/GoogleDrive-eastcoastfreshcoats@gmail.com/My Drive"
    DEST_DIR="$GDRIVE_MOUNT/$RCLONE_DEST_BASE"
    mkdir -p "$DEST_DIR"
    
    echo "📦 Executing FileProvider mount move..."
    mv "$SRC_DIR" "$DEST_DIR/"
    echo "✅ Move completed successfully."
else
    echo "📦 Executing direct rclone API relocation..."
    rclone move "$SRC_DIR" "$RCLONE_REMOTE:$RCLONE_DEST_BASE/$TERM_NAME" --progress --checksum
    echo "✅ rclone relocation completed successfully."
    # Clean up empty source directory left by rclone
    rmdir "$SRC_DIR" 2>/dev/null || true
fi

# Append bullet to main log or daily summary if available
LOG_FILE="$ACADEMIC_ONEDRIVE/_SYSTEM/_MANIFESTS/archive_history.log"
{
    echo "[$(date +'%F %T')] ARCHIVED: '$TERM_NAME' | Mode: $( [ "$FORCE_SHALLOW_MV" = "true" ] && echo "Local Move" || echo "rclone Move" ) | Manifest: $(basename "$MANIFEST_FILE")"
} >> "$LOG_FILE"

echo "🎉 Archiving of '$TERM_NAME' completed successfully! Sync state updated cluster-wide."
