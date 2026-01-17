tell application "Image Capture" to activate
delay 1
tell application "System Events"
    tell process "Image Capture"
        set frontmost to true
        -- Send CMD+A to select all items in the list
        keystroke "a" using command down
        delay 1
        -- Send Enter to trigger default action (Import) or try clicking specific button
        try
            click button "Import All" of group 1 of split group 1 of window 1
        on error
            -- Fallback: Use the "Import" button if "Import All" is not found
            try
                 click button "Import" of group 1 of split group 1 of window 1
            on error
                 -- Last resort: Just notify user to click
                 display notification "Please click Import"
            end try
        end try
    end tell
end tell
