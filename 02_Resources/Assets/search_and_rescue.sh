#!/bin/bash
# OPERATION SEARCH & RESCUE
# Scans Desktop & Downloads for code artifacts and secures them in the Vault Inbox.

VAULT_INBOX="$HOME/Documents/AI_Mastermind_Exports/_Aggregated/Inbox"
mkdir -p "$VAULT_INBOX"

echo "🚁 LAUNCHING SEARCH & RESCUE..."
echo "📍 Target Destination: $VAULT_INBOX"

# File extensions to rescue (Code, Data, Docs)
EXTENSIONS=("py" "js" "ts" "json" "md" "txt" "html" "css" "sh" "yaml" "csv" "pdf")

# Source Directories (Depth limited to avoid scanning entire OS)
SOURCES=(
    "$HOME/Downloads"
    "$HOME/Desktop"
    "$HOME/Documents"
)

COUNT=0

for src in "${SOURCES[@]}"; do
    if [ -d "$src" ]; then
        echo "🔍 Scanning Sector: $src..."
        
        # Find files matching extensions, exclude the Vault itself to prevent loops
        for ext in "${EXTENSIONS[@]}"; do
            find "$src" -maxdepth 2 -type f -name "*.$ext" -not -path "*AI_Mastermind_Exports*" | while read -r file; do
                filename=$(basename "$file")
                # Prepend timestamp to avoid name collisions
                timestamp=$(date +%s)
                cp "$file" "$VAULT_INBOX/${timestamp}_$filename"
                echo "   📦 Secured: $filename"
            done
        done
    fi
done

# Count results
COUNT=$(find "$VAULT_INBOX" -type f | wc -l)

echo "----------------------------------------"
echo "✅ MISSION COMPLETE."
echo "🔥 Total Artifacts Rescued: $COUNT"
echo "📂 Review them here: $VAULT_INBOX"
echo "----------------------------------------"
