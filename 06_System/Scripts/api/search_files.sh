#!/bin/bash
# API Helper: Search for files across all storage tiers
# Usage: bash search_files.sh "query" [tier] [file_type]

set -euo pipefail

QUERY="${1:-}"
TIER="${2:-all}"
FILE_TYPE="${3:-}"

if [ -z "$QUERY" ]; then
    echo '{"error": "Query parameter required", "results": []}'
    exit 0
fi

# Storage paths
HOT_PATH="$HOME"
WARM_PATH="/Volumes/XDriveAlpha"
COLD_PATH="/Volumes/XDriveBeta"

# Function to search in a tier
search_tier() {
    local tier_name=$1
    local tier_path=$2
    
    if [ ! -d "$tier_path" ]; then
        return
    fi
    
    # Build find command
    local find_cmd="find \"$tier_path\" -type f -iname \"*${QUERY}*\""
    
    # Add file type filter if specified
    if [ -n "$FILE_TYPE" ]; then
        find_cmd+=" -name \"*.${FILE_TYPE}\""
    fi
    
    # Limit depth and exclude system directories
    find_cmd+=" -maxdepth 5 ! -path \"*/.*\" ! -path \"*/node_modules/*\" ! -path \"*/Library/*\" 2>/dev/null"
    
    # Execute search and format results
    eval "$find_cmd" | head -20 | while read -r filepath; do
        if [ -f "$filepath" ]; then
            filename=$(basename "$filepath")
            size=$(du -h "$filepath" 2>/dev/null | awk '{print $1}')
            modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$filepath" 2>/dev/null || echo "unknown")
            
            # Get last access time (macOS)
            accessed=$(stat -f "%Sa" -t "%Y-%m-%d %H:%M" "$filepath" 2>/dev/null || echo "unknown")
            
            cat <<EOF
{
  "name": "$filename",
  "path": "$filepath",
  "tier": "$tier_name",
  "size": "$size",
  "modified": "$modified",
  "accessed": "$accessed"
}
EOF
        fi
    done
}

# Start JSON output
echo "{"
echo "  \"query\": \"$QUERY\","
echo "  \"results\": ["

first=true

# Search based on tier parameter
if [ "$TIER" = "all" ] || [ "$TIER" = "hot" ]; then
    while IFS= read -r result; do
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        echo "$result"
    done < <(search_tier "hot" "$HOT_PATH")
fi

if [ "$TIER" = "all" ] || [ "$TIER" = "warm" ]; then
    while IFS= read -r result; do
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        echo "$result"
    done < <(search_tier "warm" "$WARM_PATH")
fi

if [ "$TIER" = "all" ] || [ "$TIER" = "cold" ]; then
    while IFS= read -r result; do
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        echo "$result"
    done < <(search_tier "cold" "$COLD_PATH")
fi

echo ""
echo "  ],"
echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""
echo "}"
