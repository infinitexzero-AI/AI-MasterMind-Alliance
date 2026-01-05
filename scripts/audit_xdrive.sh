#!/bin/zsh

# audit_xdrive.sh - Asset Redundancy Scanner
# Purpose: Identify large potential duplicate archives and installers to free up performance.

DRIVE_A="/Volumes/XDriveAlpha/XDrive"
DRIVE_B="/Volumes/XDriveBeta/XDrive"

echo "🎯 AILCC Asset Audit Initiated..."
echo "-----------------------------------"

# 1. Scan for large archives (> 500MB)
echo "📦 Scanning for Large Archives (>500MB)..."
find "$DRIVE_A" "$DRIVE_B" -type f \( -name "*.zip" -o -name "*.tar.gz" -o -name "*.dmg" -o -name "*.iso" \) -size +500M -exec du -sh {} + | sort -rh

echo "\n🔍 Scanning for potential duplicate archives (Name Matches)..."
find "$DRIVE_A" "$DRIVE_B" -type f \( -name "*.zip" -o -name "*.dmg" \) -exec basename {} \; | sort | uniq -d | while read filename; do
    echo "Duplicate found across drives: $filename"
    find "$DRIVE_A" "$DRIVE_B" -name "$filename" -exec du -sh {} +
done

# 2. Check for hidden metadata bloat
echo "\n🧹 Checking for Hidden Metadata Bloat (._* files)..."
BLOAT_COUNT=$(find "$DRIVE_A" "$DRIVE_B" -name "._*" | wc -l)
echo "Total '._' companion files found: $BLOAT_COUNT"

echo "-----------------------------------"
echo "✅ Audit Complete."
