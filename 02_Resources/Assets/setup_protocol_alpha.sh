#!/bin/bash
# Protocol Alpha: Knowledge Vault Initialization
# Run this in Terminal: bash setup_protocol_alpha.sh

echo "🚀 INITIATING PROTOCOL ALPHA DEPLOYMENT..."

# 1. Define Root Path
VAULT_ROOT="$HOME/Documents/AI_Mastermind_Exports"

# 2. Create Agent Sub-Sectors
AGENTS=("ChatGPT" "Claude" "Perplexity" "Grok" "Gemini" "n8n" "_Aggregated")
SUBFOLDERS=("Conversations" "Artifacts" "Screenshots")

for agent in "${AGENTS[@]}"; do
    for sub in "${SUBFOLDERS[@]}"; do
        FULL_PATH="$VAULT_ROOT/$agent/$sub"
        mkdir -p "$FULL_PATH"
        echo "✅ Secure Sector Created: $agent/$sub"
    done
done

# 3. Create the Master Index Template
INDEX_FILE="$VAULT_ROOT/_Aggregated/master_index.json"
if [ ! -f "$INDEX_FILE" ]; then
    cat <<EOT >> "$INDEX_FILE"
{
  "meta": {
    "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "total_conversations": 0,
    "status": "INITIALIZED"
  },
  "agents": {
    "ChatGPT": { "count": 0, "last_export": null },
    "Claude": { "count": 0, "last_export": null },
    "Perplexity": { "count": 0, "last_export": null },
    "Grok": { "count": 0, "last_export": null },
    "Gemini": { "count": 0, "last_export": null },
    "n8n": { "count": 0, "last_export": null }
  }
}
EOT
    echo "📄 Master Index Initialized."
else
    echo "⚠️ Master Index already exists. Skipping."
fi

# 4. Git Integration (Optional - if inside a repo)
echo "🔍 Checking for Git repository..."
if [ -d ".git" ]; then
    echo "AI_Mastermind_Exports/" >> .gitignore
    echo "✅ Added Vault to .gitignore (Local Storage Only)"
fi

echo "🔥 PROTOCOL ALPHA INFRASTRUCTURE READY."
echo "📂 Location: $VAULT_ROOT"
