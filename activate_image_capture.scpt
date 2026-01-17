tell application "Image Capture"
	activate
end tell
delay 0.5
tell application "System Events"
	tell process "Image Capture"
		-- Highlight/Flash the window to show user where to look
		set frontmost to true
		-- Try to select the first row just to focus
		try
			select row 1 of table 1 of scroll area 1 of splitter group 1 of group 1 of window 1
		end try
	end tell
end tell
