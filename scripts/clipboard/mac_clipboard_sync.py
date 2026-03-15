import time
import requests
import AppKit

RELAY_URL = "http://localhost:5005/api/system/clipboard"
NODE_NAME = "MacBook-Origin"

def get_clipboard_change_count():
    pb = AppKit.NSPasteboard.generalPasteboard()
    return pb.changeCount()

def get_mac_clipboard():
    pb = AppKit.NSPasteboard.generalPasteboard()
    content = pb.stringForType_(AppKit.NSPasteboardTypeString)
    return content if content else ""

def set_mac_clipboard(text):
    pb = AppKit.NSPasteboard.generalPasteboard()
    pb.clearContents()
    pb.setString_forType_(text, AppKit.NSPasteboardTypeString)

last_change_count = get_clipboard_change_count()
last_local_clip = get_mac_clipboard()
last_remote_clip = ""

print(f"🌀 AILCC Local Drop (Clipboard Sync) Initialized on {NODE_NAME}")
print("📡 Listening via native NSPasteboard hooks (Universal Clipboard Safe Mode)...")

while True:
    try:
        # Check if local Mac clipboard changed count changed BEFORE ever reading it
        current_count = get_clipboard_change_count()
        if current_count != last_change_count:
            last_change_count = current_count
            current_local = get_mac_clipboard()
            
            if current_local and current_local != last_local_clip and current_local != last_remote_clip:
                # Sync to Relay
                payload = {"action": "set", "text": current_local, "source": NODE_NAME}
                requests.post(RELAY_URL, json=payload, timeout=2)
                last_local_clip = current_local
                print(f"[{time.strftime('%H:%M:%S')}] ⬆️ Pushed Mac Clipboard -> Network")

        # Poll Relay for remote clipboard changes from Windows
        resp = requests.post(RELAY_URL, json={"action": "get"}, timeout=2)
        if resp.status_code == 200:
            data = resp.json()
            remote_text = data.get("text", "")
            if remote_text and remote_text != last_local_clip and remote_text != last_remote_clip:
                # New remote clip detected! Apply to local Mac clipboard natively
                set_mac_clipboard(remote_text)
                last_remote_clip = remote_text
                last_local_clip = remote_text
                
                # Update our baseline count so we ignore our own paste event
                last_change_count = get_clipboard_change_count()
                print(f"[{time.strftime('%H:%M:%S')}] ⬇️ Pulled Network Clipboard -> Mac")

    except Exception as e:
        # Fail silently if relay is offline
        pass
    
    # Tick rate
    time.sleep(1.5)
