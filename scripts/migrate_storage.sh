#!/bin/bash
# AI Mastermind Archive Migration - Phase 2
# Usage: ./migrate_storage.sh

echo "🚀 AI Mastermind Archive Migration Starting..."

# Verify external drive
if [ ! -d "/Volumes/XDriveAlpha" ]; then
    echo "❌ ERROR: XDriveAlpha not mounted. Please connect external drive."
    exit 1
fi

# Create archive structure on XDriveAlpha
echo "📂 Creating directory structure..."
mkdir -p /Volumes/XDriveAlpha/{AI_Mastermind_Archive,Docker_Images_Cold,Project_Archive,Media_Library}

# Move AI_Mastermind_Exports if exists
if [ -d ~/Documents/AI_Mastermind_Exports ]; then
    echo "📦 Migrating AI_Mastermind_Exports..."
    rsync -av --progress ~/Documents/AI_Mastermind_Exports/ /Volumes/XDriveAlpha/AI_Mastermind_Archive/AI_Mastermind_Exports/
    
    # Verify successful copy before deleting
    if [ $? -eq 0 ]; then
        echo "✅ Verification successful. Replacing local folder with symlink..."
        rm -rf ~/Documents/AI_Mastermind_Exports
        ln -s /Volumes/XDriveAlpha/AI_Mastermind_Archive/AI_Mastermind_Exports ~/Documents/AI_Mastermind_Exports
        echo "🔗 Symlink created."
    else
        echo "❌ Rsync failed. Local files preserved."
    fi
else
    echo "ℹ️  AI_Mastermind_Exports not found in ~/Documents. Skipping."
fi

# Find and optionally move large files >1GB
echo "🔍 Scanning for large files (>1GB) in Documents/Downloads..."
find ~/Documents ~/Downloads -type f -size +1G -exec ls -lh {} \; > /tmp/large_files.txt
echo "📄 Large files list saved to /tmp/large_files.txt"
echo "👉 Review this file and manually move large items to /Volumes/XDriveAlpha/Media_Library/"

echo "✅ Migration Phase 2 Check Complete"
echo "📊 External Drive Usage:"
du -sh /Volumes/XDriveAlpha/*
