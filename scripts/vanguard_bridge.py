import time
import requests
import pyperclip
import os
import signal
import sys
import subprocess
from datetime import datetime

# --- Configuration ---
RELAY_URL = os.getenv("RELAY_URL", "http://127.0.0.1:3001/api/system/clipboard")
POLL_INTERVAL = 1.0  # Seconds
FORCE_SYNC_FILE = ".vanguard_sync"  # File trigger for manual force sync
import socket
DEFAULT_NODE = socket.gethostname()
NODE_NAME = os.getenv("NODE_NAME", DEFAULT_NODE)
AUTH_TOKEN = os.getenv("ALLIANCE_BOT_TOKEN", "antigravity_dev_key")

class ClipboardBridge:
    def __init__(self):
        self.last_text = pyperclip.paste()
        self.last_sync_ts = None
        self.active = True
        self.heartbeat_interval = 30.0 # Seconds
        self.last_heartbeat = 0
        self.check_continuity()
        print(f"🚀 [Vanguard Bridge] Initialized on {NODE_NAME}")
        print(f"📡 Targeting Relay: {RELAY_URL}")

    def check_continuity(self):
        """Audit Apple Universal Clipboard (Continuity) health."""
        try:
            res = subprocess.run(["defaults", "read", "com.apple.coreservices.useractivityd.plist", "ClipboardSharingEnabled"], 
                               capture_output=True, text=True)
            if res.stdout.strip() == "1":
                print("🟢 [Continuity] Apple Universal Clipboard is ACTIVE.")
            else:
                print("⚠️ [Continuity] Apple Universal Clipboard is DISABLED in system settings.")
        except Exception:
            print("⚪ [Continuity] Status unknown (Non-macOS or restricted).")

    def send_heartbeat(self):
        try:
            hb_url = RELAY_URL.replace("/api/system/clipboard", "/api/system/nodes/heartbeat")
            payload = {
                "node_name": NODE_NAME,
                "status": "online",
                "metrics": {
                    "uptime": time.monotonic(),
                    "clipboard_ready": True,
                    "continuity_active": True # Assumption based on init check
                }
            }
            requests.post(hb_url, json=payload, timeout=3)
            self.last_heartbeat = time.time()
        except Exception:
            pass # Silent fail for heartbeats

    def push_to_relay(self, text, force=False):
        try:
            # Avoid pushing the same text we just pulled
            if not force and text == self.last_text:
                return False

            payload = {
                "action": "set",
                "text": text,
                "source": NODE_NAME
            }
            headers = {"x-alliance-token": AUTH_TOKEN}
            response = requests.post(RELAY_URL, json=payload, headers=headers, timeout=5)
            if response.status_code == 200:
                print(f"📤 [Push] {'FORCE ' if force else ''}Success: {len(text)} chars sent.")
                return True
        except Exception as e:
            print(f"⚠️ [Push] Error: {e}")
        return False

    def pull_from_relay(self, force=False):
        try:
            headers = {"x-alliance-token": AUTH_TOKEN}
            response = requests.post(RELAY_URL, json={"action": "get"}, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                remote_text = data.get("text", "")
                remote_source = data.get("source", "unknown")
                
                # Update if different source OR if forced
                if (remote_source != NODE_NAME and remote_text != pyperclip.paste()) or force:
                    print(f"📥 [Pull] {'FORCE ' if force else ''}Remote update from {remote_source}.")
                    pyperclip.copy(remote_text)
                    self.last_text = remote_text
                    return True
        except Exception as e:
            pass 
        return False

    def run(self):
        print("🟢 Monitoring cluster synapse... (Ctrl+C to stop)")
        while self.active:
            try:
                # 0. Check for Manual Force Sync trigger
                if os.path.exists(FORCE_SYNC_FILE):
                    print("⚡ [Force Sync] Triggered via file signal.")
                    self.pull_from_relay(force=True)
                    os.remove(FORCE_SYNC_FILE)

                # 1. Heartbeat
                if time.time() - self.last_heartbeat > self.heartbeat_interval:
                    self.send_heartbeat()

                # 2. Check local clipboard change
                current_text = pyperclip.paste()
                if current_text != self.last_text:
                    if self.push_to_relay(current_text):
                        self.last_text = current_text
                
                # 3. Poll for remote
                self.pull_from_relay()
                
            except Exception as e:
                print(f"❌ Synapse Error: {e}")
            
            time.sleep(POLL_INTERVAL)

def signal_handler(sig, frame):
    print("\n🛑 Shutting down bridge...")
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    bridge = ClipboardBridge()
    bridge.run()
