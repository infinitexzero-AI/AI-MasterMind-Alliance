tell application "Google Drive" to activate
delay 1

tell application "System Events"
    tell process "Google Drive"
        -- Click the menu bar icon (System Item) logic is flaky.
        -- Alternative: Use the URL scheme or preferences shortcut if available.
        -- Standard shortcut for Settings: Command + comma
        
        keystroke "," using command down
        
        display dialog "🤖 AGENT NAVIGATION: \n\nI have opened the Google Drive settings for you.\n\nSince your internal drive is critically full (3.9GB left), we CANNOT move the files there.\n\n1. Click 'My Mac' (or 'Laptop') on the left.\n2. Click 'Add folder'.\n3. Select 'Organized_Memory_Bank' on XDriveAlpha.\n\nThis is the ONLY safe way to sync without crashing your Mac." with title "Safety Protocol Active" buttons {"Executing"} default button 1
    end tell
end tell
