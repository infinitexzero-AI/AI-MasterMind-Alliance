#!/bin/bash

# 🧠 HIPPOCAMPUS: ASSET MIGRATION (PHASE 2)
# Moves identified large assets from Desktop to XDriveAlpha/Archives

SOURCE_DIR="/Users/infinite27/Desktop"
TARGET_DIR="/Volumes/XDriveAlpha/Archives/Desktop_Assets"

# Ensure target directory exists
mkdir -p "$TARGET_DIR"

# List of identified large assets to migrate
ASSETS=(
    "Joel's Personal Documents/Officer Blin, oct 14th, 2025.MOV"
    "MTA FALL SEMESTER 2025/Commercial Law 2025/Comm law 3611 final review.m4a"
    " Entrepreneurship 2025-2026/ECFC General Documents/Official Papers/System Implementation Ideas/10X Business Plan Workbook.pdf"
)

echo "🚀 Starting migration of large assets..."

for asset in "${ASSETS[@]}"; do
    SRC="$SOURCE_DIR/$asset"
    if [ -f "$SRC" ]; then
        echo "📦 Migrating: $asset"
        # Match directory structure in target
        REL_DIR=$(dirname "$asset")
        mkdir -p "$TARGET_DIR/$REL_DIR"
        
        # Using rsync with --remove-source-files for safe move + verify
        rsync -av --remove-source-files "$SRC" "$TARGET_DIR/$REL_DIR/"
        
        if [ $? -eq 0 ]; then
            echo "✅ Success: $asset"
        else
            echo "❌ Error migrating $asset"
        fi
    else
        echo "⚠️ Not found: $SRC"
    fi
done

echo "🏁 Migration completed."
