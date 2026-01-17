#!/bin/bash
# ~/AILCC_PRIME/scripts/collect_artifacts.sh

echo "🔍 Collecting AI-generated artifacts..."

# Ensure target directories exist
mkdir -p ~/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/valentine-core

# Find all React components we created
echo "📦 React Components:"
find ~/AILCC_PRIME -name "*.tsx" -not -path "*/node_modules/*" -type f | while read file; do
    echo "  - $file"
    cp "$file" ~/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/
done

# Find all Mermaid diagrams
echo "🎨 Mermaid Diagrams:"
find ~/AILCC_PRIME -name "*.mermaid" -not -path "*/node_modules/*" -type f | while read file; do
    echo "  - $file"
    cp "$file" ~/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/
done

# Find all markdown docs
echo "📝 Documentation:"
find ~/AILCC_PRIME -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f | while read file; do
    echo "  - $file"
    cp "$file" ~/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/
done

# Valentine Core source
echo "🚀 Valentine Core:"
cp -r ~/AILCC_PRIME/valentine-core/src/* ~/AILCC_PRIME/AI_Mastermind_Exports/_Aggregated/artifacts/valentine-core/

echo "✅ Artifact collection complete!"
