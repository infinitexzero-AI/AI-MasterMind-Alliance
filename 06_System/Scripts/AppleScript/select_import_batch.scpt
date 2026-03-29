tell application "Image Capture" to activate
delay 1

tell application "System Events"
	tell process "Image Capture"
		try
			-- Attempt to find the main image table
			-- Standard hierarchy often: window 1 > split group 1 > group 1 > scroll area 1 > table 1
			set mainWin to window 1
			set targetTable to missing value
			
			-- 1. Force List View (to ensure table exists)
			try
				click radio button 1 of group 1 of group 1 of window 1 -- Often the 'List' view toggle
			end try
			delay 0.5
			
			set targetTable to missing value
			
			-- 2. Broad Search for the Table
			-- We loop through all UI elements to find the table, ignoring strict hierarchy
			set allTables to entire contents of window 1 whose class is table
			
			if (count of allTables) > 0 then
				set targetTable to item 1 of allTables
				
				tell targetTable
					-- Select first 500 rows
					select (rows 1 thru 500)
				end tell
				display notification "Selected 500 items. Please DRAG to folder." with title "Burst Mode Ready"
			else
				display alert "Still cannot find Image Table. Please manually select."
			end if
			
		on error errMsg
			display dialog "Script Error: " & errMsg
		end try
	end tell
end tell
