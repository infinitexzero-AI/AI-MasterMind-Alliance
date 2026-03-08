#!/usr/bin/osascript

# Vanguard Watchdog: Auto-click "Keep Waiting"
# This script monitors for the "The window is not responding" dialog in Electron apps (VS Code, etc.)

repeat
    tell application "System Events"
        if exists window 1 of (every process whose name is "Code") then
            set theWindows to windows of (every process whose name is "Code")
            repeat with theWindow in theWindows
                if exists (button "Keep Waiting" of window 1 of process "Code") then
                    click button "Keep Waiting" of window 1 of process "Code"
                    log "Vanguard: Prevented IDE freeze. Clicked 'Keep Waiting'."
                end if
            end repeat
        end if
    end tell
    delay 5
end repeat
