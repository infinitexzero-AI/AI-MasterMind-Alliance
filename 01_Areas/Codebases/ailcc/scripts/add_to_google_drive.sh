#!/bin/bash

# add_to_google_drive.sh
# Uses AppleScript to automate adding folders to Google Drive sync
# Requires Google Drive desktop app to be installed and running

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Check if Google Drive is running
if ! pgrep -x "Google Drive" > /dev/null; then
    print_error "Google Drive is not running. Please start it first."
    exit 1
fi

# Validate folder path
FOLDER_PATH="$1"

if [[ -z "$FOLDER_PATH" ]]; then
    print_error "Usage: $0 <folder_path>"
    exit 1
fi

if [[ ! -d "$FOLDER_PATH" ]]; then
    print_error "Folder does not exist: $FOLDER_PATH"
    exit 1
fi

# Convert to absolute path
FOLDER_PATH=$(cd "$FOLDER_PATH" && pwd)

print_info "Adding folder to Google Drive sync: $FOLDER_PATH"
print_warning "This will open the Google Drive preferences window"
print_info "Press Ctrl+C to cancel, or Enter to continue..."
read

# AppleScript to automate Google Drive folder addition
osascript <<EOF
tell application "System Events"
    -- Activate Google Drive
    tell process "Google Drive"
        set frontmost to true
        
        -- Click menu bar icon
        click menu bar item 1 of menu bar 2
        delay 1
        
        -- Click settings/preferences (gear icon)
        -- This may vary based on Google Drive version
        try
            click button "Settings" of window 1
            delay 0.5
            click menu item "Preferences" of menu 1 of button "Settings" of window 1
        on error
            -- Alternative path
            keystroke "," using command down
        end try
        
        delay 2
        
        -- Navigate to "My Mac" or "Google Drive" tab
        try
            click button "My Mac" of toolbar 1 of window 1
        on error
            log "Could not find My Mac tab"
        end try
        
        delay 1
        
        -- Click "Add folder" button
        try
            click button "Add folder" of window 1
            delay 1
            
            -- File picker should now be open
            tell application "System Events"
                keystroke "g" using {command down, shift down}
                delay 0.5
                keystroke "$FOLDER_PATH"
                delay 0.5
                keystroke return
                delay 1
                keystroke return
            end tell
            
        on error errMsg
            log "Error: " & errMsg
            return false
        end try
    end tell
end tell

return true
EOF

if [[ $? -eq 0 ]]; then
    print_success "Folder addition process completed"
    print_info "Please verify in Google Drive preferences that the folder was added"
else
    print_error "Failed to add folder automatically"
    print_warning "Please add manually:"
    echo "  1. Open Google Drive preferences"
    echo "  2. Go to 'My Mac' or 'Folders' tab"
    echo "  3. Click 'Add folder'"
    echo "  4. Select: $FOLDER_PATH"
fi
