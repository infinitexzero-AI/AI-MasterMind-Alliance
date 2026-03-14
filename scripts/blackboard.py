import redis
import os
import json
import time
import sys

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
CHANNEL_PATTERN = "swarm:blackboard:*"

def monitor_blackboard():
    print(f"📡 Connecting to AIMmA Swarm Blackboard on {REDIS_HOST}...")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        pubsub = r.pubsub()
        pubsub.psubscribe(CHANNEL_PATTERN)
        
        print(f"🟢 Listening for swarm intents on pattern: {CHANNEL_PATTERN}")
        print("-" * 60)
        
        for message in pubsub.listen():
            if message['type'] == 'pmessage':
                channel = message['channel']
                data = json.loads(message['data'])
                timestamp = time.strftime('%H:%M:%S', time.localtime(data['timestamp']))
                sender = data['sender']
                payload = data['data']
                
                print(f"[{timestamp}] CHANNEL: {channel.replace('swarm:blackboard:', '').upper()}")
                print(f"           SENDER:  {sender}")
                print(f"           INTENT:  {json.dumps(payload, indent=11).strip()}")
                print("-" * 60)

    except KeyboardInterrupt:
        print("\n🛑 Monitor stopped by user.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    monitor_blackboard()
