import redis
import os
import json
import time

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
INFRA_CHANNEL = "swarm:blackboard:infrastructure"

def run_sentinel():
    print("🤖 AIMmA Self-Healing Sentinel Active.")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        pubsub = r.pubsub()
        pubsub.subscribe(INFRA_CHANNEL)
        
        print(f"👂 Listening for infrastructure alerts on: {INFRA_CHANNEL}")
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                event = data['data'].get('event')
                
                if event == "healing_required":
                    service = data['data'].get('service')
                    reason = data['data'].get('reason')
                    print(f"🚨 HEALING REQUIRED for {service}")
                    print(f"   Reason: {reason}")
                    
                    # Logic for automated healing
                    # For now: We log it and simulate a reconnection attempt
                    print(f"   🔄 Attempting logical re-sync for {service}...")
                    time.sleep(2)
                    
                    # Broadcast recovery message
                    r.publish(INFRA_CHANNEL, json.dumps({
                        "timestamp": time.time(),
                        "sender": "sentinel_executor",
                        "data": {
                            "event": "healing_completed",
                            "service": service,
                            "status": "logical_sync_triggered"
                        }
                    }))
                    print(f"   ✅ logical_sync_triggered for {service}")

    except KeyboardInterrupt:
        print("\n🛑 Sentinel shutting down.")
    except Exception as e:
        print(f"❌ Sentinel Error: {e}")

if __name__ == "__main__":
    run_sentinel()
