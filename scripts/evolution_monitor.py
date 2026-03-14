import redis
import os
import json
import time

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
STRATEGY_CHANNEL = "swarm:blackboard:strategy"

def watch_evolution():
    print("🧬 AIMmA Evolutionary Pivot Monitor Active.")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        pubsub = r.pubsub()
        pubsub.subscribe(STRATEGY_CHANNEL)
        
        print(f"📡 Monitoring for Recursive Jumps on: {STRATEGY_CHANNEL}")
        print("=" * 60)
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                proposal = data['data']
                sender = data['sender']
                timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(data['timestamp']))
                
                if sender == "evolution_coordinator":
                    print(f"\n✨ EVOLUTIONARY PIVOT PROPOSED at {timestamp}")
                    print(f"   INTENT:    {proposal.get('intent')}")
                    print(f"   RATIONALE: {proposal.get('rationale')}")
                    print(f"   ACTION:    {proposal.get('proposed_action')}")
                    print("=" * 60)
                    
                    # Log the evolution jump to a local roadmap file
                    if proposal.get('intent') == "EVOLVE_SYSTEM_ARCHITECTURE":
                        try:
                            with open("generated_roadmap.md", "a") as f:
                                f.write(f"\n## Phase 5 Ideation ({timestamp})\n")
                                f.write(f"- **Rationale**: {proposal.get('rationale')}\n")
                                f.write(f"- **Proposed Action**: {proposal.get('proposed_action')}\n")
                        except Exception as e:
                            print(f"   [!] Failed to save to generated_roadmap.md: {e}")

    except KeyboardInterrupt:
        print("\n👋 Monitor closed.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    watch_evolution()
