import os
import json
import logging
import asyncio
import redis.asyncio as redis
from typing import Callable, Dict, Any, Coroutine
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(name)s] - %(levelname)s - %(message)s')

class ReactiveDaemon:
    """
    Standardized base class for AILCC Daemons.
    Replaces "while True: time.sleep(5)" with reactive Redis Pub/Sub async hooks.
    """
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(name)
        self.redis = None
        self.pubsub = None
        self.subscriptions: Dict[str, Callable[[Any], Coroutine]] = {}
        self.tasks = []
        
        creds_path = os.path.expanduser("~/.ailcc/credentials.env")
        if os.path.exists(creds_path):
            load_dotenv(creds_path)
            
    async def connect(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        try:
            self.redis = redis.from_url(redis_url, decode_responses=True)
            self.pubsub = self.redis.pubsub()
            await self.redis.ping()
            self.logger.info("Synchronized to Master Redis Nerve Center.")
        except Exception as e:
            self.logger.critical(f"FATAL: Redis connection failed: {e}")
            raise
            
    def subscribe(self, channel: str, callback: Callable[[Any], Coroutine]):
        """Registers an asynchronous callback to a specific Redis channel."""
        self.subscriptions[channel] = callback
        
    async def setup(self):
        """Override this in child classes to explicitly register subscriptions via self.subscribe()"""
        pass
        
    async def _listen_loop(self):
        if not self.subscriptions:
            self.logger.warning("No reactive subscriptions registered. Daemon will sleep natively.")
            while True:
                await asyncio.sleep(3600)
                
        # Subscribe to all registered channels
        channels = list(self.subscriptions.keys())
        await self.pubsub.subscribe(*channels)
        self.logger.info(f"Reactive state active. Blocking patiently on: {channels}")
        
        async for message in self.pubsub.listen():
            if message['type'] == 'message':
                channel = message['channel']
                if channel in self.subscriptions:
                    try:
                        payload = json.loads(message['data'])
                        if not isinstance(payload, dict):
                            raise ValueError("Pub/Sub payload violates Dictionary constraint.")
                    except Exception as e:
                        self.logger.error(f"ZERO-TRUST REJECTION: Dropped invalid Pub/Sub packet on {channel}: {e}")
                        continue
                    
                    try:
                        # Dispatch asynchronously so listener never hangs
                        asyncio.create_task(self.subscriptions[channel](payload))
                    except Exception as e:
                        self.logger.error(f"Callback failure on {channel}: {e}")

    async def broadcast(self, channel: str, payload: dict):
        """Helper to fire events back onto the Nerve Center."""
        if not self.redis:
             await self.connect()
        await self.redis.publish(channel, json.dumps(payload))

    async def broadcast_status(self, domain_or_agent: str, status: str, message: str):
        """Standardized helper for logging and broadcasting standard Neural Intents to UI"""
        payload = {
            "intent": "TASK_PROGRESS_UPDATE",
            "agent": domain_or_agent, 
            "status": status,
            "message": message
        }
        await self.broadcast("NEURAL_SYNAPSE", payload)

    async def run(self):
        """Primary invocation lifecycle."""
        await self.connect()
        await self.setup()
        await self._listen_loop()
