tell application "Image Capture" to activate
delay 2

tell application "System Events"
    tell process "Image Capture"
        -- Wait for UI to load
        delay 2
        
        -- Try to select the external drive in the "Import To" list if possible
        -- This part is tricky as the UI varies. 
        -- Instead, we will guide the user to check the setting.
        
        display dialog "🤖 AGENT COMMAND: \n\nI have launched Image Capture for the Mass Dump.\n\n1. Select your iPhone in the sidebar.\n2. Set 'Import To' folder to: 'iCloud_Offload_2026_01_14' on XDriveAlpha.\n3. Click 'Download All'.\n\nI will monitor the folder and sort files the instant they land." with title "Agent Optimization Protocol" buttons {"Acknowledge"} default button 1
        
    end tell
end tell
