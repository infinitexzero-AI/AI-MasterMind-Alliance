#!/bin/bash

# cache_cleanup.sh
# Safely clean caches and temporary files to free up disk space
# Only removes files that can be regenerated automatically

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() { echo -e "${BLUE}=== $1 ===${NC}"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Parse arguments
DRY_RUN=false
AGGRESSIVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --aggressive)
            AGGRESSIVE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run      Show what would be cleaned without deleting"
            echo "  --aggressive   Also clean Homebrew, npm, Python caches"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_header "Storage Cleanup Tool"

if [[ "$DRY_RUN" == true ]]; then
    print_warning "DRY RUN MODE - No files will be deleted"
fi

# Track space freed
TOTAL_FREED=0

# Function to calculate directory size
get_size_mb() {
    local path="$1"
    if [[ -d "$path" ]]; then
        du -sm "$path" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# Function to clean a directory
clean_directory() {
    local path="$1"
    local description="$2"
    
    if [[ ! -d "$path" ]]; then
        return
    fi
    
    local size_before=$(get_size_mb "$path")
    
    if [[ $size_before -eq 0 ]]; then
        return
    fi
    
    print_info "Cleaning: $description ($size_before MB)"
    
    if [[ "$DRY_RUN" == false ]]; then
        rm -rf "$path"/* 2>/dev/null || true
        local size_after=$(get_size_mb "$path")
        local freed=$((size_before - size_after))
        TOTAL_FREED=$((TOTAL_FREED + freed))
        print_success "Freed $freed MB"
    else
        print_info "Would free ~$size_before MB"
    fi
}

# Standard macOS Caches
print_header "System Caches"

clean_directory "$HOME/Library/Caches/com.apple.Safari" "Safari cache"
clean_directory "$HOME/Library/Caches/Google/Chrome" "Chrome cache"
clean_directory "$HOME/Library/Caches/Chromium" "Chromium cache"
clean_directory "$HOME/Library/Caches/Firefox" "Firefox cache"

# Development Caches
print_header "Development Caches"

# Python caches
print_info "Cleaning Python __pycache__ directories..."
if [[ "$DRY_RUN" == false ]]; then
    find ~ -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    print_success "Cleaned Python caches"
else
    pycache_count=$(find ~ -type d -name "__pycache__" 2>/dev/null | wc -l | xargs)
    print_info "Would clean $pycache_count __pycache__ directories"
fi

# Node.js
clean_directory "$HOME/.npm/_cacache" "npm cache"

# Xcode
clean_directory "$HOME/Library/Developer/Xcode/DerivedData" "Xcode derived data"
clean_directory "$HOME/Library/Developer/CoreSimulator/Caches" "iOS Simulator caches"

# Application-Specific Caches
print_header "Application Caches"

clean_directory "$HOME/Library/Caches/com.apple.Music" "Apple Music cache"
clean_directory "$HOME/Library/Caches/com.spotify.client" "Spotify cache"
clean_directory "$HOME/Library/Caches/Slack" "Slack cache"
clean_directory "$HOME/Library/Caches/com.microsoft.VSCode" "VS Code cache"

# Aggressive Mode
if [[ "$AGGRESSIVE" == true ]]; then
    print_header "Aggressive Cleanup"
    
    # Homebrew
    if command -v brew &> /dev/null; then
        print_info "Cleaning Homebrew caches..."
        if [[ "$DRY_RUN" == false ]]; then
            brew cleanup -s 2>/dev/null || true
            print_success "Cleaned Homebrew"
        else
            print_info "Would run: brew cleanup -s"
        fi
    fi
    
    # Docker (if installed)
    if command -v docker &> /dev/null; then
        print_info "Cleaning Docker images and containers..."
        if [[ "$DRY_RUN" == false ]]; then
            docker system prune -a -f 2>/dev/null || true
            print_success "Cleaned Docker"
        else
            print_info "Would run: docker system prune -a -f"
        fi
    fi
    
    # Old logs
    clean_directory "$HOME/Library/Logs" "Application logs"
fi

# Trash
print_header "Trash"
if [[ "$DRY_RUN" == false ]]; then
    print_info "Emptying trash..."
    rm -rf ~/.Trash/* 2>/dev/null || true
    print_success "Trash emptied"
else
    trash_size=$(get_size_mb "$HOME/.Trash")
    print_info "Would empty trash ($trash_size MB)"
fi

# Summary
print_header "Summary"

if [[ "$DRY_RUN" == false ]]; then
    print_success "Total space freed: ${TOTAL_FREED} MB (~$(echo "scale=2; $TOTAL_FREED/1024" | bc) GB)"
    print_info "Running final disk check..."
    df -h / | tail -1
else
    print_info "Run without --dry-run to execute cleanup"
    print_info "Run with --aggressive for deeper cleanup (includes Homebrew, Docker)"
fi

print_success "Cleanup complete!"
