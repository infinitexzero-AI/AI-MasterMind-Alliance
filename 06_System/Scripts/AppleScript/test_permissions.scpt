try
	tell application "System Events"
		-- This command requires accessibility permissions
		set frontApp to name of first application process whose frontmost is true
	end tell
	return "Success: " & frontApp
on error
	return "Failed"
end try
