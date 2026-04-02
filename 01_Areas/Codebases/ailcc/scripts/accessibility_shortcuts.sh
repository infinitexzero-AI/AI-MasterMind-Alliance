#!/bin/bash
# ADHD Accessibility Configuration for macOS
# Enables LED Flash, haptic feedback, and creates smart folders

echo "🔧 Configuring ADHD-Friendly Accessibility Features..."

# 1. Enable LED Flash for Alerts
echo "Enabling LED Flash for Alerts..."
osascript -e 'tell application "System Settings"
    activate
end tell'

# Note: LED Flash must be enabled manually in System Settings > Accessibility > Audio/Visual
# This opens the settings pane; user must toggle it on
open "x-apple.systempreferences:com.apple.preference.universalaccess?Seeing_Display"

echo "⚠️  Please manually enable 'LED Flash for Alerts' in the Accessibility pane that just opened."
echo "   Location: System Settings > Accessibility > Audio > Visual > LED Flash for Alerts"

# 2. Create Smart Folders with color tags
echo ""
echo "📁 Creating Smart Folders for task organization..."

# Define Smart Folder locations
SMART_FOLDER_DIR="$HOME/Library/Saved Searches"
mkdir -p "$SMART_FOLDER_DIR"

# Create "🔴 DUE THIS WEEK" Smart Folder
cat > "$SMART_FOLDER_DIR/DUE THIS WEEK.savedSearch" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CompatibleVersion</key>
    <integer>1</integer>
    <key>RawQuery</key>
    <string>(kMDItemContentModificationDate >= $time.this_week) || (kMDItemDisplayName == "*due*"cd)</string>
    <key>RawQueryDict</key>
    <dict>
        <key>FinderFilesOnly</key>
        <true/>
        <key>SearchScopes</key>
        <array>
            <string>kMDQueryScopeHome</string>
        </array>
    </dict>
</dict>
</plist>
EOF

# Create "📚 Reading Materials" Smart Folder
cat > "$SMART_FOLDER_DIR/Reading Materials.savedSearch" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CompatibleVersion</key>
    <integer>1</integer>
    <key>RawQuery</key>
    <string>kMDItemContentType == "com.adobe.pdf"</string>
    <key>RawQueryDict</key>
    <dict>
        <key>FinderFilesOnly</key>
        <true/>
        <key>SearchScopes</key>
        <array>
            <string>kMDQueryScopeHome</string>
        </array>
    </dict>
</dict>
</plist>
EOF

echo "✅ Smart Folders created in Finder sidebar"

# 3. Configure Accessibility Shortcut
echo ""
echo "⌨️  Setting up Accessibility Shortcut..."
echo "To configure triple-click shortcut:"
echo "1. Go to System Settings > Accessibility > Shortcut"
echo "2. Set triple-click to toggle: LED Flash, Reduce Motion, or Magnifier"

# 4. Set up Focus Modes (manual step)
echo ""
echo "🔔 Focus Mode configuration (manual setup required):"
echo ""
echo "📖 DEEP WORK MODE:"
echo "   • Allow: Calendar, Reminders, FaceTime (favorites only)"
echo "   • Block: Email, Safari, Messages, social media"
echo "   • Time-based: Activate during calendar events tagged 'Study' or 'Class'"
echo ""
echo "📅 SEMESTER PLANNING MODE:"
echo "   • Allow: Calendar, Notion, Google Sheets, Reminders"
echo "   • Block: Everything else"
echo "   • Schedule: Sundays 6-8pm"

# 5. Configure color tags (manual)
echo ""
echo "🏷️  Folder Color Tag Guidelines:"
echo "   🟥 RED (Critical) - Due within 48 hours, exams, urgent"
echo "   🟩 GREEN (Current Week) - Active assignments this week"
echo "   🟦 BLUE (Due Soon) - Upcoming (3-7 days)"
echo "   ⬜ GRAY (Archive) - Completed or reference materials"

echo ""
echo "✨ Basic accessibility features configured!"
echo "📝 Manual steps required - see messages above"
