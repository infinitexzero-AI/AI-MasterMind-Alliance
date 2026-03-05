import redis
import json
import random

r = redis.Redis(host='localhost', port=6379, db=0)

def seed():
    topics = ["AI Architecture", "Synaptic Pruning", "Distributed Systems", "Cinematic UI", "Biometric Security"]
    for i in range(20):
        memory = {
            "id": f"seed-{i}",
            "topic": random.choice(topics),
            "x": random.uniform(5, 95),
            "y": random.uniform(5, 95),
            "importance": random.uniform(0.3, 0.9),
            "timestamp": "2026-03-05T16:00:00Z"
        }
        r.hset("ailcc:memories", f"memory-{i}", json.dumps(memory))
    print("✅ Seeded 20 semantic coordinates for the Heat-Map.")

if __name__ == "__main__":
    seed()
