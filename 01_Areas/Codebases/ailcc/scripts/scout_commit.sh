#!/bin/bash
# AILCC Auto-Scout Sync Utility 
# Synchronizes status across all AILCC related repositories (Inbound & Outbound).

echo "🚀 Initiating AILCC Auto-Scout Sync..."

# Repositories to check
REPOS=(
    "/Users/infinite27/AILCC_PRIME"
    "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc"
    "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance"
)

SESSION_MSG="feat: finalize periodic table and modular sync architecture (bidirectional sync)"

for REPO in "${REPOS[@]}"; do
    if [ -d "$REPO" ]; then
        echo "📂 Processing: $REPO"
        cd "$REPO"
        
        # Inbound Sync
        echo "   📥 Pulling changes from source control..."
        git fetch origin
        git pull origin $(git branch --show-current) --rebase
        
        # Outbound Sync
        echo "   📤 Staging and committing local changes..."
        git add .
        if git diff --cached --quiet; then
            echo "   ✅ No new local changes to commit."
        else
            git commit -m "$SESSION_MSG"
            echo "   📦 Committed: $SESSION_MSG"
        fi
        
        # Optional: Push changes
        # echo "   🚀 Pushing to origin..."
        # git push origin $(git branch --show-current)
    else
        echo "   ⚠️ Repository not found: $REPO"
    fi
done

echo "✨ Sync Complete."
