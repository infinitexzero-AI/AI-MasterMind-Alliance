import time
import subprocess
import requests

RELAY_URL = "http://localhost:5005/api/system/clipboard"
NODE_NAME = "MacBook-Origin"

def get_mac_clipboard():
    try:
        return subprocess.check_output(['pbpaste'], text=True)
    except Exception:
        return ""

def set_mac_clipboard(text):
    try:
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        process.communicate(text.encode('utf-8'))
    except Exception:
        pass

last_local_clip = get_mac_clipboard()
last_remote_clip = ""

print(f"🌀 AILCC Local Drop (Clipboard Sync) Initialized on {NODE_NAME}")
print("📡 Listening for cross-network clipboard events...")

while True:
    try:
        # 1. Check if local Mac clipboard changed
        current_local = get_mac_clipboard()
        if current_local and current_local != last_local_clip and current_local != last_remote_clip:
            # Sync to Relay
            payload = {"action": "set", "text": current_local, "source": NODE_NAME}
            requests.post(RELAY_URL, json=payload, timeout=2)
            last_local_clip = current_local
            print(f"[{time.strftime('%H:%M:%S')}] ⬆️ Pushed Mac Clipboard -> Network")

        # 2. Poll Relay for remote clipboard changes from Windows
        resp = requests.post(RELAY_URL, json={"action": "get"}, timeout=2)
        if resp.status_code == 200:
            data = resp.json()
            remote_text = data.get("text", "")
            if remote_text and remote_text != last_local_clip and remote_text != last_remote_clip:
                # New remote clip detected! Apply to local Mac clipboard
                set_mac_clipboard(remote_text)
                last_remote_clip = remote_text
                last_local_clip = remote_text
                print(f"[{time.strftime('%H:%M:%S')}] ⬇️ Pulled Network Clipboard -> Mac")

    except Exception as e:
        # Fail silently if relay is offline to avoid console spam
        pass
    
    # 1.5 second tick-rate for responsive text handoff
    time.sleep(1.5)
