-- Study Sanctum Activation Script
-- Objective: Create a distraction-free academic environment

tell application "System Events"
	-- 1. Minimize all windows to clear the clutter
	set visible of every process to false
end tell

tell application "Finder"
	-- 2. Clean Desktop view (optional, requires specific settings, skipping for safety)
end tell

-- 3. Launch specific Academic Tools
tell application "Comet" to activate
tell application "Notes" to activate

-- 4. Speak confirmation
say "Study Sanctum Activated. Good luck." using "Samantha"

-- 5. Notification
display notification "Academic Environment Loaded" with title "AICC System" subtitle "Study Sanctum"
