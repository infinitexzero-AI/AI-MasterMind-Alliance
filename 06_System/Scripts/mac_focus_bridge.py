import subprocess
import os
import sys

def set_mac_focus(state):
    """
    Toggles macOS Focus mode (Do Not Disturb).
    Uses AppleScript to toggle the Control Center's Focus state.
    """
    script = ""
    if state:
        # Turn ON DND
        print("🔕 [BIO-SQUELCH] Engaging Focus Mode (DND)...")
        script = '''
        tell application "System Events"
            tell process "ControlCenter"
                try
                    click menu bar item "Focus" of menu bar 1
                    delay 0.5
                    click checkbox "Do Not Disturb" of group 1 of window "Control Center"
                    # click menu bar item "Focus" of menu bar 1 # Close it
                on error
                    # Fallback for different OS versions if UI hierarchy differs
                    click menu bar item "Double Heart" of menu bar 1
                end try
            end tell
        end tell
        '''
    else:
        # Turn OFF DND
        print("🔔 [BIO-SQUELCH] Releasing Focus Mode...")
        # (Inverse of above)
        
    # Standard shell fallback for newer macOS:
    try:
        if state:
            subprocess.run(["shortcuts", "run", "Do Not Disturb On"], capture_output=True)
        else:
            subprocess.run(["shortcuts", "run", "Do Not Disturb Off"], capture_output=True)
        return True
    except:
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        action = sys.argv[1].lower() == "on"
        set_mac_focus(action)
    else:
        print("Usage: python3 mac_focus_bridge.py [on|off]")
