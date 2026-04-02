#!/bin/bash

# organize_for_gdrive.sh
# Creates organized AILCC backup in Documents folder for Google Drive sync
# This folder will be automatically synced since Documents is already in Google Drive

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/config/gdrive_sync_config.json"
MOBILE_ACCESS_DIR="$HOME/Documents/AILCC_Mobile_Access"
BACKUP_DIR="$HOME/Documents/AILCC_Backup"
MANIFEST_FILE="$HOME/Documents/AILCC_sync_manifest.json"

# Parse command line arguments
DRY_RUN=false
VERIFY_ONLY=false
MOBILE_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verify)
            VERIFY_ONLY=true
            shift
            ;;
        --mobile-only)
            MOBILE_ONLY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run      Show what would be done without making changes"
            echo "  --verify       Verify existing sync integrity"
            echo "  --mobile-only  Only create mobile access folder"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if jq is available
if ! command -v jq &> /dev/null; then
    print_error "jq is required but not installed. Install with: brew install jq"
    exit 1
fi

# Verify config file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    print_error "Config file not found: $CONFIG_FILE"
    exit 1
fi

# Create manifest
create_manifest() {
    local manifest_data="{
        \"created\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"source_root\": \"$PROJECT_ROOT\",
        \"mobile_access\": \"$MOBILE_ACCESS_DIR\",
        \"backup\": \"$BACKUP_DIR\",
        \"files\": []
    }"
    
    if [[ "$DRY_RUN" == false ]]; then
        echo "$manifest_data" | jq '.' > "$MANIFEST_FILE"
    fi
}

# Add file to manifest
add_to_manifest() {
    local src="$1"
    local dest="$2"
    local size=$(stat -f%z "$src" 2>/dev/null || echo "0")
    local checksum=$(shasum -a 256 "$src" | cut -d' ' -f1)
    
    if [[ "$DRY_RUN" == false && -f "$MANIFEST_FILE" ]]; then
        jq ".files += [{
            \"source\": \"$src\",
            \"destination\": \"$dest\",
            \"size_bytes\": $size,
            \"checksum_sha256\": \"$checksum\",
            \"synced_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
        }]" "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi
}

# Copy file with structure
copy_with_structure() {
    local src="$1"
    local dest_base="$2"
    local rel_path="${src#$PROJECT_ROOT/}"
    local dest="$dest_base/$rel_path"
    local dest_dir="$(dirname "$dest")"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would copy: $rel_path"
        return
    fi
    
    # Create destination directory
    mkdir -p "$dest_dir"
    
    # Copy file
    cp "$src" "$dest"
    
    # Add to manifest
    add_to_manifest "$src" "$dest"
    
    print_success "Copied: $rel_path"
}

# Create mobile access folder
create_mobile_access() {
    print_header "Creating Mobile Access Folder"
    
    if [[ "$DRY_RUN" == true ]]; then
        print_info "Dry run mode - showing what would be created:"
        echo "  $MOBILE_ACCESS_DIR/"
    else
        mkdir -p "$MOBILE_ACCESS_DIR"/{Agents,Documentation,Status,Quick_Reference}
        print_success "Created folder structure"
    fi
    
    # Copy critical files
    print_info "Copying high-priority mobile files..."
    
    # Agent registry
    if [[ -f "$PROJECT_ROOT/agents/registry.json" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            cp "$PROJECT_ROOT/agents/registry.json" "$MOBILE_ACCESS_DIR/Agents/"
            add_to_manifest "$PROJECT_ROOT/agents/registry.json" "$MOBILE_ACCESS_DIR/Agents/registry.json"
        fi
        print_success "Agent registry"
    fi
    
    # Key documentation
    local docs=(
        "CURRENT_FOCUS.md"
        "STATUS.md"
        "PROJECT_MAP.md"
        "README.md"
        "WORKSPACE_GUIDE.md"
    )
    
    for doc in "${docs[@]}"; do
        if [[ -f "$PROJECT_ROOT/$doc" ]]; then
            local dest_dir="$MOBILE_ACCESS_DIR/Status"
            [[ "$doc" == "README.md" || "$doc" == "WORKSPACE_GUIDE.md" ]] && dest_dir="$MOBILE_ACCESS_DIR/Documentation"
            [[ "$doc" == "CURRENT_FOCUS.md" ]] && dest_dir="$MOBILE_ACCESS_DIR/Quick_Reference"
            
            if [[ "$DRY_RUN" == false ]]; then
                cp "$PROJECT_ROOT/$doc" "$dest_dir/"
                add_to_manifest "$PROJECT_ROOT/$doc" "$dest_dir/$doc"
            fi
            print_success "$doc"
        fi
    done
    
    # Platform docs
    if [[ -d "$PROJECT_ROOT/docs/platforms" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            cp -r "$PROJECT_ROOT/docs/platforms" "$MOBILE_ACCESS_DIR/Documentation/"
            # Add all files to manifest
            find "$PROJECT_ROOT/docs/platforms" -type f | while read file; do
                rel_path="${file#$PROJECT_ROOT/docs/platforms/}"
                add_to_manifest "$file" "$MOBILE_ACCESS_DIR/Documentation/platforms/$rel_path"
            done
        fi
        print_success "Platform documentation"
    fi
    
    # Calculate size
    if [[ "$DRY_RUN" == false ]]; then
        local size=$(du -sh "$MOBILE_ACCESS_DIR" | cut -f1)
        print_success "Mobile access folder created: $size"
        print_info "Location: $MOBILE_ACCESS_DIR"
    else
        print_info "Estimated size: < 20 MB"
    fi
}

# Create full backup
create_backup() {
    print_header "Creating Full Backup"
    
    if [[ "$DRY_RUN" == true ]]; then
        print_info "Dry run mode - showing what would be copied:"
    else
        mkdir -p "$BACKUP_DIR"
        print_success "Created backup directory"
    fi
    
    # Get folder lists from config
    local critical_folders=$(jq -r '.folders.critical[].path' "$CONFIG_FILE")
    local important_folders=$(jq -r '.folders.important[].path' "$CONFIG_FILE")
    
    # Copy critical folders
    print_info "Copying critical folders..."
    while IFS= read -r folder; do
        if [[ -d "$folder" ]]; then
            local folder_name=$(basename "$folder")
            print_info "Processing: $folder_name"
            
            # Find all files excluding patterns
            find "$folder" -type f \
                ! -path "*/.venv/*" \
                ! -path "*/.git/*" \
                ! -path "*/node_modules/*" \
                ! -path "*/__pycache__/*" \
                ! -name "*.db" \
                ! -name ".env*" \
                ! -name "*.log" \
                ! -name "*.pyc" \
                ! -name ".DS_Store" | while read file; do
                copy_with_structure "$file" "$BACKUP_DIR"
            done
        fi
    done <<< "$critical_folders"
    
    # Copy important folders if not mobile-only
    if [[ "$MOBILE_ONLY" == false ]]; then
        print_info "Copying important folders..."
        while IFS= read -r folder; do
            if [[ -d "$folder" ]]; then
                local folder_name=$(basename "$folder")
                print_info "Processing: $folder_name"
                
                find "$folder" -type f \
                    ! -path "*/.venv/*" \
                    ! -path "*/.git/*" \
                    ! -path "*/node_modules/*" \
                    ! -path "*/__pycache__/*" \
                    ! -name "*.db" \
                    ! -name ".env*" \
                    ! -name "*.log" \
                    ! -name "*.pyc" \
                    ! -name ".DS_Store" | while read file; do
                    copy_with_structure "$file" "$BACKUP_DIR"
                done
            fi
        done <<< "$important_folders"
    fi
    
    if [[ "$DRY_RUN" == false ]]; then
        local size=$(du -sh "$BACKUP_DIR" | cut -f1)
        print_success "Backup created: $size"
        print_info "Location: $BACKUP_DIR"
    fi
}

# Verify integrity
verify_sync() {
    print_header "Verifying Sync Integrity"
    
    if [[ ! -f "$MANIFEST_FILE" ]]; then
        print_error "No manifest found. Run without --verify first."
        exit 1
    fi
    
    local total=0
    local verified=0
    local failed=0
    
    jq -c '.files[]' "$MANIFEST_FILE" | while read file_entry; do
        total=$((total + 1))
        local src=$(echo "$file_entry" | jq -r '.source')
        local dest=$(echo "$file_entry" | jq -r '.destination')
        local expected_checksum=$(echo "$file_entry" | jq -r '.checksum_sha256')
        
        if [[ ! -f "$dest" ]]; then
            print_error "Missing: $dest"
            failed=$((failed + 1))
            continue
        fi
        
        local current_checksum=$(shasum -a 256 "$dest" | cut -d' ' -f1)
        if [[ "$current_checksum" != "$expected_checksum" ]]; then
            print_warning "Checksum mismatch: $dest"
            failed=$((failed + 1))
        else
            verified=$((verified + 1))
        fi
    done
    
    print_success "Verified $verified files"
    [[ $failed -gt 0 ]] && print_error "$failed files failed verification"
}

# Main execution
main() {
    print_header "AILCC Google Drive Sync Organizer"
    
    if [[ "$VERIFY_ONLY" == true ]]; then
        verify_sync
        exit 0
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        print_warning "DRY RUN MODE - No changes will be made"
    fi
    
    # Create manifest
    create_manifest
    
    # Create mobile access folder
    create_mobile_access
    
    # Create full backup if not mobile-only
    if [[ "$MOBILE_ONLY" == false ]]; then
        create_backup
    fi
    
    # Summary
    print_header "Summary"
    
    if [[ "$DRY_RUN" == false ]]; then
        print_success "Organization complete!"
        echo ""
        print_info "Next steps:"
        echo "  1. Open Google Drive desktop app settings"
        echo "  2. Verify that Documents folder is syncing"
        echo "  3. Check sync status (should show green checkmark)"
        echo "  4. Access files on mobile via Google Drive app"
        echo ""
        print_info "Manifest saved to: $MANIFEST_FILE"
        print_info "Run with --verify to check integrity"
    else
        print_info "Run without --dry-run to execute changes"
    fi
}

main
