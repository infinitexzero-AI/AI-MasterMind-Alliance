tell application "Image Capture"
	activate
end tell

delay 1.0

tell application "System Events"
	tell process "Image Capture"
		-- Attempt to ensure focus on the list by hitting "Tab" a few times
		keystroke tab
		delay 0.1
		keystroke tab
		delay 0.5
		
		-- Go to Top
		key code 115 -- Home
		delay 0.5
		
		-- Select first Item (Spacebar usually selects)
		keystroke space
		delay 0.2
		
		-- Burst Select (Shift + PageDown 15 times = ~750 items)
		repeat 15 times
			key code 121 using {shift down}
			delay 0.05
		end repeat
		
	end tell
end tell
