#!/bin/zsh
# storage_daily_snapshot.sh
# Antigravity / Valentine — Daily Storage Snapshot for Triage Blocks
# Version: 0.1.0 (2026-05-26)
#
# Companion to valentine_archive_term.sh.
# Generates before/after state for daily sprint + pack blocks.
#
# Writes to same _MANIFESTS/ as archive script for easy diffing.
#
# Usage:
#   storage_daily_snapshot.sh [--label pre-archive|post-archive|daily] [--manifest-dir PATH]
#
# Integrates with:
#   - Vanguard daily 30-45min storage triage blocks
#   - valentine_archive_term.sh (call snapshot before + after)
#   - valentine-core/daily-sprint.sh (future hook)
#
# Safety: Shallow only. No deep recursion on cloud File Provider mounts.

set -euo pipefail

SCRIPT_VERSION="0.1.0"
DATE_ISO=$(date +%F)
DATE_TIME=$(date +"%Y-%m-%d %H:%M")

DEFAULT_ONEDRIVE_ACADEMIC="$HOME/Library/CloudStorage/OneDrive-MountAllisonUniversity"
DEFAULT_MANIFEST_DIR="${DEFAULT_ONEDRIVE_ACADEMIC}/_SYSTEM/_MANIFESTS"

LABEL="daily"
MANIFEST_DIR=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --label) LABEL="$2"; shift 2 ;;
        --manifest-dir) MANIFEST_DIR="$2"; shift 2 ;;
        -h|--help)
            echo "storage_daily_snapshot.sh v$SCRIPT_VERSION"
            echo "Usage: $0 [--label pre-archive|post-archive|daily] [--manifest-dir PATH]"
            exit 0
            ;;
        *) echo "Unknown arg: $1"; exit 1 ;;
    esac
done

if [[ -z "$MANIFEST_DIR" ]]; then
    if [[ -d "$DEFAULT_ONEDRIVE_ACADEMIC/_SYSTEM/_MANIFESTS" ]]; then
        MANIFEST_DIR="$DEFAULT_ONEDRIVE_ACADEMIC/_SYSTEM/_MANIFESTS"
    else
        MANIFEST_DIR="${HOME}/_VALENTINE_MANIFESTS"
    fi
fi
mkdir -p "$MANIFEST_DIR"

OUTFILE="$MANIFEST_DIR/daily_${DATE_ISO}_${LABEL}.log"
SUMMARY="$MANIFEST_DIR/daily_${DATE_ISO}_${LABEL}.md"

{
    echo "# Valentine Daily Storage Snapshot — $LABEL — $DATE_ISO"
    echo "timestamp: $DATE_TIME"
    echo "label: $LABEL"
    echo "script: storage_daily_snapshot.sh v$SCRIPT_VERSION"
    echo "host: $(hostname -s)"
    echo ""
    echo "## Boot Volume (SSD Pressure — Primary Concern)"
    df -h / 2>/dev/null || echo "df unavailable"
    echo ""
    echo "## OneDrive Academic (Hot Tier Focus)"
    if [[ -d "$DEFAULT_ONEDRIVE_ACADEMIC" ]]; then
        echo "### Top-level shallow view"
        ls -1 "$DEFAULT_ONEDRIVE_ACADEMIC" 2>/dev/null | head -30
        echo ""
        echo "### _ACTIVE_2026_Summer (if present)"
        if [[ -d "$DEFAULT_ONEDRIVE_ACADEMIC/_ACTIVE_2026_Summer" ]]; then
            du -sh "$DEFAULT_ONEDRIVE_ACADEMIC/_ACTIVE_2026_Summer"/* 2>/dev/null | sort -h | tail -10 || true
        else
            echo "(no _ACTIVE_2026_Summer yet — run Day 1 structure creation)"
        fi
        echo ""
        echo "### Largest items (shallow, trusted)"
        du -sh "$DEFAULT_ONEDRIVE_ACADEMIC"/* 2>/dev/null | sort -h | tail -15 || true
    else
        echo "OneDrive Academic mount not found at expected path."
    fi
    echo ""
    echo "## Other Cloud Mounts (shallow)"
    for mount in "$HOME/Library/CloudStorage"/*; do
        [[ -d "$mount" ]] && echo "$(basename "$mount"): $(du -sh "$mount" 2>/dev/null | cut -f1 || echo '?')"
    done
    echo ""
    echo "## iCloud (com~apple~CloudDocs) shallow"
    ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs"
    if [[ -d "$ICLOUD" ]]; then
        du -sh "$ICLOUD" 2>/dev/null || true
        ls -1 "$ICLOUD" 2>/dev/null | head -15
    fi
    echo ""
    echo "## Low Space Alert"
    FREE_GB=$(df / | tail -1 | awk '{print int($4/1024/1024)}' 2>/dev/null || echo 0)
    if (( FREE_GB < 20 )); then
        echo "CRITICAL: Boot volume free space < 20 GB ($FREE_GB GB). Run triage immediately."
        # Best-effort macOS notification
        osascript -e 'display notification "Boot SSD < 20 GB free — run Valentine triage" with title "Valentine Storage"' 2>/dev/null || true
    else
        echo "Boot free: ${FREE_GB} GB (target > 25 GB for move window)"
    fi
    echo ""
    echo "## Pairing Note"
    echo "Run this before and after valentine_archive_term.sh for clear deltas."
    echo "Diff the two daily_*.log files + archive_*.log in _MANIFESTS/."
} > "$OUTFILE"

# Human-friendly summary
cp "$OUTFILE" "$SUMMARY" 2>/dev/null || true

echo "Snapshot written:"
echo "  Log:    $OUTFILE"
echo "  Summary:$SUMMARY"

if (( FREE_GB < 20 )); then
    echo ""
    echo ">>> LOW SPACE ALERT triggered — see notification or log."
fi

exit 0
