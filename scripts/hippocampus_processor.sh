#!/bin/bash
# Hippocampus Data Lifecycle Processor
# Automates data movement between storage tiers

echo "╔════════════════════════════════════════╗"
echo "║   Hippocampus Processor                ║"
echo "╚════════════════════════════════════════╝"
echo "Date: $(date)"
echo ""

# Check if external drives are mounted
if [ ! -d /Volumes/XDriveAlpha ]; then
    echo "⚠️  XDriveAlpha not mounted, skipping archival"
    exit 1
fi

# 1. Archive old projects (>90 days inactive)
echo "📦 [1/5] Checking for projects to archive..."
ARCHIVED=0
if [ -d ~/AILCC_PRIME/01_Areas/Codebases ]; then
    find ~/AILCC_PRIME/01_Areas/Codebases -type d -maxdepth 1 -mtime +90 2>/dev/null | while read project; do
        if [ -d "$project" ] && [ "$project" != ~/AILCC_PRIME/01_Areas/Codebases ]; then
            PROJECT_NAME=$(basename "$project")
            echo "   Archiving: $PROJECT_NAME"
            mkdir -p /Volumes/XDriveAlpha/02_Cold_Storage/Projects_Archive
            mv "$project" /Volumes/XDriveAlpha/02_Cold_Storage/Projects_Archive/
            ARCHIVED=$((ARCHIVED + 1))
        fi
    done
fi
echo "   ✓ Archived $ARCHIVED projects"

# 2. Compress and archive old logs
echo "📝 [2/5] Processing logs..."
if [ -d ~/AILCC_PRIME/logs ]; then
    # Compress logs older than 30 days
    COMPRESSED=$(find ~/AILCC_PRIME/logs -name "*.log" -mtime +30 2>/dev/null | wc -l | tr -d ' ')
    find ~/AILCC_PRIME/logs -name "*.log" -mtime +30 -exec gzip {} \; 2>/dev/null
    
    # Move compressed logs older than 90 days to external storage
    mkdir -p /Volumes/XDriveAlpha/02_Cold_Storage/Logs
    MOVED=$(find ~/AILCC_PRIME/logs -name "*.log.gz" -mtime +90 2>/dev/null | wc -l | tr -d ' ')
    find ~/AILCC_PRIME/logs -name "*.log.gz" -mtime +90 -exec mv {} /Volumes/XDriveAlpha/02_Cold_Storage/Logs/ \; 2>/dev/null
    
    echo "   ✓ Compressed $COMPRESSED logs, moved $MOVED to archive"
else
    echo "   ⚠ Logs directory not found"
fi

# 3. Clean old build artifacts
echo "🔨 [3/5] Cleaning build artifacts..."
CLEANED=0
if [ -d ~/AILCC_PRIME/01_Areas/Codebases ]; then
    # Remove dist/build directories older than 7 days
    find ~/AILCC_PRIME/01_Areas/Codebases -type d \( -name "dist" -o -name "build" -o -name ".next" \) -mtime +7 2>/dev/null | while read dir; do
        rm -rf "$dir"
        CLEANED=$((CLEANED + 1))
    done
fi
echo "   ✓ Cleaned $CLEANED build directories"

# 4. Move large files to external storage
echo "📦 [4/5] Checking for large files (>100MB, >30 days old)..."
MOVED_FILES=0
if [ -d ~/AILCC_PRIME ]; then
    find ~/AILCC_PRIME -type f -size +100M -mtime +30 2>/dev/null | while read file; do
        FILE_SIZE=$(du -sh "$file" | awk '{print $1}')
        echo "   Moving: $(basename "$file") ($FILE_SIZE)"
        
        # Preserve directory structure
        RELATIVE_PATH=$(echo "$file" | sed "s|$HOME/AILCC_PRIME/||")
        TARGET_DIR="/Volumes/XDriveAlpha/02_Cold_Storage/Large_Files/$(dirname "$RELATIVE_PATH")"
        mkdir -p "$TARGET_DIR"
        mv "$file" "$TARGET_DIR/"
        MOVED_FILES=$((MOVED_FILES + 1))
    done
fi
echo "   ✓ Moved $MOVED_FILES large files"

# 5. Update Hippocampus index
echo "📇 [5/5] Updating Hippocampus index..."
INDEX_FILE=~/AILCC_PRIME/.hippocampus_index.txt
echo "# Hippocampus Storage Index" > "$INDEX_FILE"
echo "# Generated: $(date)" >> "$INDEX_FILE"
echo "" >> "$INDEX_FILE"

echo "## XDriveAlpha Contents" >> "$INDEX_FILE"
find /Volumes/XDriveAlpha -type f 2>/dev/null | wc -l | awk '{print "Total files: " $1}' >> "$INDEX_FILE"
echo "" >> "$INDEX_FILE"

if [ -d /Volumes/XDriveBeta ]; then
    echo "## XDriveBeta Contents" >> "$INDEX_FILE"
    find /Volumes/XDriveBeta -type f 2>/dev/null | wc -l | awk '{print "Total files: " $1}' >> "$INDEX_FILE"
fi

echo "   ✓ Index updated: $INDEX_FILE"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Hippocampus Processing Complete      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Summary:"
echo "  - Projects archived: $ARCHIVED"
echo "  - Logs processed: $COMPRESSED compressed, $MOVED archived"
echo "  - Build artifacts cleaned: $CLEANED"
echo "  - Large files moved: $MOVED_FILES"
echo ""
