#!/usr/bin/env python3
"""
media_context_daemon.py — Ambient Audio Awareness (Reactive Protocol)
=============================================================================
Polls macOS Apple Music (or Spotify) via AppleScript. 
Upgraded to Phase 79 standards: Replaces 5-second brute polling with a 
30-second debounced loop, instantly preempted by Redis Pub/Sub events.
"""

import os
import time
import logging
import asyncio
import subprocess
from datetime import datetime

import sys
from pathlib import Path
AILCC_PRIME = Path(__file__).resolve().parent.parent.parent
if str(AILCC_PRIME) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME))

from core.daemon_factory import ReactiveDaemon

class MediaMonitor(ReactiveDaemon):
    def __init__(self):
        super().__init__("MediaMonitor")
        self.last_track = None
        self.channel = "neural_synapse"
        
    async def setup(self):
        # Register for instant manual refreshes (triggering 0-latency polling)
        self.subscribe("MEDIA_REFRESH_REQUEST", self.handle_refresh)
        
        # Deploy the deeply-throttled heartbeat poll
        self.tasks.append(asyncio.create_task(self.debounced_poll()))
        
    async def handle_refresh(self, payload):
        self.logger.info("Received instant MEDIA_REFRESH_REQUEST. Executing off-cycle poll.")
        await self.execute_poll()

    def get_playing_track(self, app_name="Music"):
        script = f"""
        if application "{app_name}" is running then
            tell application "{app_name}"
                if player state is playing then
                    return (name of current track) & "|||" & (artist of current track)
                end if
            end tell
        end if
        return ""
        """
        try:
            result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
            output = result.stdout.strip()
            if output and "|||" in output:
                title, artist = output.split("|||", 1)
                return {"title": title.strip(), "artist": artist.strip(), "source": app_name}
        except Exception:
            pass
        return None

    def get_current_media(self):
        # Prefer Music, fallback to Spotify
        track = self.get_playing_track("Music")
        if not track:
            track = self.get_playing_track("Spotify")
        return track

    async def execute_poll(self):
        try:
            track = await asyncio.to_thread(self.get_current_media)
            
            # Only publish on change to avoid flooding the bus
            if track != self.last_track:
                self.last_track = track
                
                payload = {
                    "signal_id": f"media_ctx_{int(time.time())}",
                    "source": "MEDIA_MONITOR",
                    "type": "NOW_PLAYING",
                    "timestamp": datetime.now().isoformat(),
                    "payload": track
                }
                
                if track:
                    self.logger.info(f"Now Playing Shift: {track['title']} by {track['artist']}")
                else:
                    self.logger.info("Media playback paused/stopped.")
                    
                await self.broadcast(self.channel, payload)
                await self.broadcast("NOW_PLAYING", track)
        except Exception as e:
             self.logger.error(f"Error observing media context: {e}")

    async def debounced_poll(self):
        self.logger.info("Media Context Observer Active (30s Debounced Polling enforced)")
        while True:
            await self.execute_poll()
            await asyncio.sleep(30)

if __name__ == "__main__":
    monitor = MediaMonitor()
    asyncio.run(monitor.run())
