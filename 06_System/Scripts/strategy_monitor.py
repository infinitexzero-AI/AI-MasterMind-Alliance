import redis
import os
import json
import time

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
STRATEGY_CHANNEL = "swarm:blackboard:strategy"

def watch_strategy():
    print("🧠 AIMmA Hive Mind Strategy Monitor Active.")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        pubsub = r.pubsub()
        pubsub.subscribe(STRATEGY_CHANNEL)
        
        print(f"🔭 Watching for Strategic Pivots on: {STRATEGY_CHANNEL}")
        print("=" * 60)
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                proposal = data['data']
                timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(data['timestamp']))
                
                print(f"🚀 STRATEGIC PIVOT DETECTED at {timestamp}")
                print(f"   INTENT:    {proposal.get('intent')}")
                print(f"   RATIONALE: {proposal.get('rationale')}")
                print(f"   ACTION:    {proposal.get('proposed_action')}")
                print("-" * 60)

    except KeyboardInterrupt:
        print("\n👋 Monitor closed.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    watch_strategy()
