import os
import time
import json
import logging
import asyncio
import redis.asyncio as redis
from datetime import datetime
from dotenv import load_dotenv

import sys
from pathlib import Path
AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent
if str(AILCC_PRIME_PATH) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME_PATH))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [ContextSynthesizer] - %(levelname)s - %(message)s')
logger = logging.getLogger("ContextSynthesizer")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class ContextSynthesizer:
    def __init__(self):
        self.redis = None
        self.unified_state = {
            "media_context": None,
            "omnitracker_status": None,
            "system_thermal": None,
            "last_synthesis": datetime.now().isoformat()
        }
        
    async def connect(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        await self.redis.ping()
        logger.info("Connected to AILCC Redis Pub/Sub.")
        
    async def listen_to_streams(self):
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("NOW_PLAYING", "OMNITRACKER_EVENTS", "HARDWARE_TELEMETRY", "NEURAL_SYNAPSE")
        
        logger.info("Listening for dynamic context streams...")
        async for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    channel = message['channel']
                    payload = json.loads(message['data'])
                    await self.process_signal(channel, payload)
                except Exception as e:
                    logger.error(f"Error parsing context signal: {e}")

    async def process_signal(self, channel: str, data: dict):
        state_changed = False
        
        if channel == "NOW_PLAYING":
            self.unified_state["media_context"] = data
            state_changed = True
            
        elif channel == "OMNITRACKER_EVENTS":
            self.unified_state["omnitracker_status"] = data
            state_changed = True
            
        elif channel == "HARDWARE_TELEMETRY":
            # Extract basic thermal/hardware state to avoid huge payloads
            self.unified_state["system_thermal"] = {
                "cpu_percent": data.get("cpu_percent", 0),
                "ram_percent": data.get("ram_percent", 0),
                "power_plugged": data.get("power_plugged", True),
                "battery_percent": data.get("battery_percent", 100)
            }
            state_changed = True
            
        elif channel == "NEURAL_SYNAPSE":
            # Just tracking the last active intent for broader context
            if data.get("intent"):
                self.unified_state["last_active_intent"] = data.get("intent")
                state_changed = True
                
        if state_changed:
            self.unified_state["last_synthesis"] = datetime.now().isoformat()
            await self.publish_unified_state()
            
    async def publish_unified_state(self):
        # Inject the ephemeral memory block into Redis
        await self.redis.set("AILCC_GLOBAL_CONTEXT", json.dumps(self.unified_state))
        
        # Optionally broadcast the new array hash state to AILCC Dashboard
        await self.redis.publish("GLOBAL_CONTEXT_ARRAY", json.dumps(self.unified_state))
        logger.debug("Refreshed AILCC_GLOBAL_CONTEXT")

if __name__ == "__main__":
    load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
    daemon = ContextSynthesizer()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(daemon.connect())
    try:
        loop.run_until_complete(daemon.listen_to_streams())
    except KeyboardInterrupt:
        logger.info("Context Synthesizer Terminated.")
