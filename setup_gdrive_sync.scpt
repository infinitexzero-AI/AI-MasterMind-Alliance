tell application "Google Drive" to activate
delay 1

tell application "System Events"
    tell process "Google Drive"
        set frontmost to true
        try
            -- Try to click the menu bar item to open the panel
            click menu bar item 1 of menu bar 1
            delay 1
            -- Try to access the settings gear (this is highly dependent on UI hierarchy)
            -- If we can't click, we fallback to instructions.
            keystroke "," using command down
        on error
            -- Fallback if blocked
            display dialog "🔒 MacOS Security blocked my automated clicks.\n\nI have brought Google Drive to the front.\n\nPlease manually:\n1. Click the Google Drive icon in menu bar.\n2. Click Gear ⚙️ > Preferences.\n3. Click 'Add Folder' to select 'Organized_Memory_Bank'." with title "Agent Assistance Required" buttons {"I am doing it"} default button 1
        end try
    end tell
end tell
