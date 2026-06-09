import redis
import os
import json
import time
from typing import Dict, Any, List

class BlackboardService:
    def __init__(self):
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.r = redis.Redis(host=self.redis_host, port=self.redis_port, db=0)
        self.pubsub = self.r.pubsub()
        self.channel_prefix = "swarm:blackboard:"

    def broadcast(self, channel: str, message: Dict[str, Any], sender: str = "system"):
        """
        Broadcast a message to a specific swarm channel.
        """
        payload = {
            "timestamp": time.time(),
            "sender": sender,
            "data": message
        }
        full_channel = f"{self.channel_prefix}{channel}"
        self.r.publish(full_channel, json.dumps(payload))
        
        # Also store the latest state in a Redis hash for "last known state" retrieval
        self.r.hset(f"{self.channel_prefix}latest", channel, json.dumps(payload))
        return {"channel": full_channel, "status": "broadcasted"}

    def get_latest_intent(self, channel: str):
        """
        Get the last known state for a channel.
        """
        data = self.r.hget(f"{self.channel_prefix}latest", channel)
        if data:
            return json.loads(data)
        return None

# Singleton instance
blackboard_service = BlackboardService()
