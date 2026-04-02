#!/bin/bash

# analyze_app_support.sh
# Analyze Library/Application Support to find large, removable items

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() { echo -e "${BLUE}=== $1 ===${NC}"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

APP_SUPPORT="$HOME/Library/Application Support"

print_header "Analyzing Application Support"

print_info "Scanning for large directories (this may take a minute)..."

# Find top 20 largest directories
du -sh "$APP_SUPPORT"/* 2>/dev/null | sort -hr | head -20 | while read size dir; do
    basename_dir=$(basename "$dir")
    echo "  $size - $basename_dir"
done

echo ""
print_header "Common Safe-to-Remove Items"

echo "Check for these and consider removing if not needed:"
echo ""

# Node.js versions
if [[ -d "$HOME/.nvm/versions" ]]; then
    echo "📦 Node.js versions (via nvm):"
    du -sh "$HOME/.nvm/versions/node"/* 2>/dev/null | while read size dir; do
        version=$(basename "$dir")
        echo "  $size - Node $version"
    done
    echo "  → Keep only the version(s) you actively use"
    echo "  → Remove with: nvm uninstall <version>"
    echo ""
fi

# Python versions
if [[ -d "$HOME/Library/Application Support/virtualenv" ]]; then
    venv_size=$(du -sh "$HOME/Library/Application Support/virtualenv" 2>/dev/null | cut -f1)
    echo "🐍 Python virtualenv cache:"
    echo "  $venv_size - Virtualenv templates"
    echo "  → Safe to delete: rm -rf ~/Library/Application\ Support/virtualenv"
    echo ""
fi

# Xcode
if [[ -d "$HOME/Library/Developer" ]]; then
    echo "🔨 Xcode:"
    
    if [[ -d "$HOME/Library/Developer/Xcode/iOS DeviceSupport" ]]; then
        ios_size=$(du -sh "$HOME/Library/Developer/Xcode/iOS DeviceSupport" 2>/dev/null | cut -f1)
        echo "  $ios_size - iOS Device Support (old iOS versions)"
        echo "  → Keep only current iOS version"
    fi
    
    if [[ -d "$HOME/Library/Developer/CoreSimulator" ]]; then
        sim_size=$(du -sh "$HOME/Library/Developer/CoreSimulator" 2>/dev/null | cut -f1)
        echo "  $sim_size - iOS Simulators"
        echo "  → Remove if not doing iOS development"
    fi
    echo ""
fi

# Docker
if [[ -d "$HOME/Library/Containers/com.docker.docker" ]]; then
    docker_size=$(du -sh "$HOME/Library/Containers/com.docker.docker" 2>/dev/null | cut -f1)
    echo "🐳 Docker:"
    echo "  $docker_size - Docker containers and images"
    echo "  → Clean with: docker system prune -a"
    echo ""
fi

# VS Code extensions
if [[ -d "$HOME/.vscode/extensions" ]]; then
    vscode_size=$(du -sh "$HOME/.vscode/extensions" 2>/dev/null | cut -f1)
    echo "💻 VS Code Extensions:"
    echo "  $vscode_size - Installed extensions"
    echo "  → Review and remove unused extensions"
    echo ""
fi

# Google Drive cache
if [[ -d "$HOME/Library/Application Support/Google/DriveFS" ]]; then
    gdrive_size=$(du -sh "$HOME/Library/Application Support/Google/DriveFS" 2>/dev/null | cut -f1)
    echo "☁️ Google Drive:"
    echo "  $gdrive_size - Local cache"
    echo "  → Will be optimized when switching to streaming mode"
    echo ""
fi

print_header "Recommendations"

echo "1. Review the largest directories above"
echo "2. Remove old Node/Python versions you don't use"
echo "3. Clear Xcode simulators if not developing iOS apps"
echo "4. Run: docker system prune -a (if you use Docker)"
echo "5. Switch Google Drive to streaming mode (as planned)"
echo ""
print_info "Total Application Support size:"
du -sh "$APP_SUPPORT" 2>/dev/null
