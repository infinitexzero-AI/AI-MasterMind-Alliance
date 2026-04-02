#!/usr/bin/env python3
"""
macos_context_daemon.py — Ambient UI Interceptor
=============================================================================
Continuously queries macOS via AppleScript bridge to capture the 
active application window and feeds this context into the Swarm.
Agents (like Comet) use this stream to understand what the user 
is looking at *right now*.
"""

import subprocess
import time
import json
import logging
import os
import redis
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [macOS Context] %(message)s")
logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
redis_client = redis.Redis(host=REDIS_HOST, port=int(REDIS_PORT), decode_responses=True)

class MacOSContextDaemon:
    def __init__(self):
        self.last_app = ""
        self.last_title = ""

    def get_active_window(self):
        """Uses AppleScript to fetch the frontmost application and its title."""
        applescript = """
        global frontApp, frontAppName, windowTitle
        set windowTitle to ""
        tell application "System Events"
            set frontApp to first application process whose frontmost is true
            set frontAppName to name of frontApp
            tell process frontAppName
                tell (1st window whose value of attribute "AXMain" is true)
                    set windowTitle to value of attribute "AXTitle"
                end tell
            end tell
        end tell
        return frontAppName & "::" & windowTitle
        """
        try:
            result = subprocess.run(['osascript', '-e', applescript], capture_output=True, text=True, check=True)
            output = result.stdout.strip()
            
            if "::" in output:
                app_name, title = output.split("::", 1)
                return app_name, title
            return output, ""
        except subprocess.CalledProcessError:
            # Usually happens if an app has no windows or accessibility is denied
            return None, None
        except Exception as e:
            logger.error(f"AppleScript Error: {e}")
            return None, None

    def run(self, poll_interval=3):
        logger.info("Ambient Desktop Interception Engaged. Monitoring Application Focus...")
        
        while True:
            app, title = self.get_active_window()
            
            if app and (app != self.last_app or title != self.last_title):
                self.last_app = app
                self.last_title = title
                
                logger.info(f"Context Shift: [{app}] {title}")
                self.broadcast_context(app, title)

            time.sleep(poll_interval)

    def broadcast_context(self, app, title):
        payload = {
            "signal_id": f"ctx_{int(time.time())}",
            "source": "MACOS_CONTEXT",
            "type": "STATE_CHANGE",
            "severity": "ROUTINE",
            "message": f"User is focused on [{app}]",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "active_app": app,
                "window_title": title
            }
        }
        
        try:
            redis_client.publish('neural_synapse', json.dumps(payload))
        except Exception as e:
            logger.error(f"Redis Broadcast Failed: {e}")

if __name__ == "__main__":
    daemon = MacOSContextDaemon()
    daemon.run()
