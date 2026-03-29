import time
import requests
import pyperclip
import sys

# Replace this with the actual Local IP of your MacBook on the Wi-Fi network
# e.g., http://192.168.1.10:5005/api/system/clipboard
# You can find your Mac's IP by running `ipconfig getifaddr en0` in the Mac terminal
MAC_IP = "192.168.1.X" 
RELAY_URL = f"http://{MAC_IP}:5005/api/system/clipboard"
NODE_NAME = "ThinkPad-Vanguard"

def get_thinkpad_clipboard():
    try:
        content = pyperclip.paste()
        return content if content else ""
    except Exception:
        return ""

def set_thinkpad_clipboard(text):
    try:
        pyperclip.copy(text)
    except Exception as e:
        print(f"Clipboard write error: {e}")

last_local_clip = get_thinkpad_clipboard()
last_remote_clip = ""

print(f"🌀 AILCC Matrix Relay Initialized on {NODE_NAME}")
print(f"📡 Universal Clipboard Mode Targeting: {RELAY_URL}")
print("Please ensure your Mac allows traffic on port 5005.")

while True:
    try:
        # 1. Check local ThinkPad clipboard
        current_local = get_thinkpad_clipboard()
        
        if current_local and current_local != last_local_clip and current_local != last_remote_clip:
            # Sync to Mac Relay
            payload = {"action": "set", "text": current_local, "source": NODE_NAME}
            requests.post(RELAY_URL, json=payload, timeout=2)
            last_local_clip = current_local
            print(f"[{time.strftime('%H:%M:%S')}] ⬆️ Pushed ThinkPad Clipboard -> Network")

        # 2. Poll Mac Relay for changes from the Apple Ecosystem
        resp = requests.post(RELAY_URL, json={"action": "get"}, timeout=2)
        if resp.status_code == 200:
            data = resp.json()
            remote_text = data.get("text", "")
            if remote_text and remote_text != last_local_clip and remote_text != last_remote_clip:
                # Apply to local ThinkPad clipboard
                set_thinkpad_clipboard(remote_text)
                last_remote_clip = remote_text
                last_local_clip = remote_text
                
                print(f"[{time.strftime('%H:%M:%S')}] ⬇️ Pulled Network Clipboard -> ThinkPad")

    except requests.exceptions.RequestException:
        # Silently pass if the Mac relay is offline or unreachable to prevent crash loops
        pass
    except Exception as e:
        print(f"Sync error: {e}")
    
    # Tick rate
    time.sleep(1.5)
