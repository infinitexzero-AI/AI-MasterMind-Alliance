#!/bin/bash

# 🧠 HIPPOCAMPUS LTM SYNC (Long-Term Memory Handshake)
# Description: Syncs XDriveAlpha (Primary Archive) to XDriveBeta (Secondary Mirror)

ALPHA="/Volumes/XDriveAlpha"
BETA="/Volumes/XDriveBeta/XDrive-Alpha_Migration"
LOG="/Users/infinite27/AILCC_PRIME/06_System/Logs/ltm_sync.log"

echo "------------------------------------------------" | tee -a "$LOG"
echo "🧠 STARTING LTM SYNC: $(date)" | tee -a "$LOG"
echo "------------------------------------------------" | tee -a "$LOG"

# Check if drives are mounted
if [ ! -d "$ALPHA" ]; then
    echo "❌ ERROR: XDriveAlpha not mounted." | tee -a "$LOG"
    exit 1
fi

if [ ! -d "$BETA" ]; then
    echo "⚠️ WARNING: Mirror path $BETA not found. Attempting to create..." | tee -a "$LOG"
    mkdir -p "$BETA"
fi

# Sync procedure using rsync
# -a: archive mode (preserves permissions, symlinks, etc.)
# -v: verbose
# -h: human readable sizes
# --delete: remove files from destination that are not in source
# --progress: show progress
echo "🔄 Syncing Archives..." | tee -a "$LOG"
rsync -avh --delete "$ALPHA/Archives/" "$BETA/Archives/" | tee -a "$LOG"

echo "🔄 Syncing Vaults..." | tee -a "$LOG"
rsync -avh --delete "$ALPHA/Vault/" "$BETA/Vault/" | tee -a "$LOG"

echo "------------------------------------------------" | tee -a "$LOG"
echo "🧠 LTM SYNC COMPLETED: $(date)" | tee -a "$LOG"
echo "------------------------------------------------" | tee -a "$LOG"
