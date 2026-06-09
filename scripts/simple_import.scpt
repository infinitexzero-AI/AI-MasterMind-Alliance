tell application "Image Capture" to activate
delay 0.5
tell application "System Events"
    tell process "Image Capture"
        set frontmost to true
        -- Select All
        keystroke "a" using command down
        delay 0.5
        -- Hit Enter (Default action is usually Import)
        keystroke return
        
        display notification "⌨️ Sent CMD+A and ENTER" with title "Agent Action"
    end tell
end tell
