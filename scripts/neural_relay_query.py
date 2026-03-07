import requests
import redis
import json
import sys
from datetime import datetime

# Configuration
CHROMA_QUERY_URL = "http://localhost:8091/query"
QDRANT_API_URL = "http://localhost:6333/collections" # Search logic would go here
REDIS_HOST = 'localhost'
REDIS_PORT = 6379

def query_unified_memory(query_text, limit=3):
    context_packet = {
        "query": query_text,
        "timestamp": datetime.now().isoformat(),
        "vault_knowledge": [],
        "experience_memories": [],
        "state_context": []
    }

    # 1. Query ChromaDB (Vault knowledge)
    try:
        res = requests.post(CHROMA_QUERY_URL, json={"query": query_text, "num_results": limit}, timeout=2)
        if res.ok:
            data = res.json()
            # Flatten results
            for i in range(len(data['results']['documents'][0])):
                context_packet["vault_knowledge"].append({
                    "source": data['results']['metadatas'][0][i]['source'],
                    "content": data['results']['documents'][0][i][:500],
                    "relevance": 0.9 # Mock relevance for now
                })
    except Exception as e:
        print(f"⚠️ Vault Query Failed: {e}")

    # 2. Query Redis (Recent State/Context)
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
        memories = r.hgetall("ailcc:memories")
        # Naive keyword match for simulation
        for key, val in memories.items():
            mem = json.loads(val)
            if query_text.lower() in mem.get('topic', '').lower():
                context_packet["state_context"].append(mem)
    except Exception as e:
        print(f"⚠️ Redis Query Failed: {e}")

    # 3. Qdrant (Experience) - Placeholder for vector search
    # In a full impl, we'd hit /collections/experience/points/search
    
    return context_packet

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Quantum Computing"
    results = query_unified_memory(query)
    print(json.dumps(results, indent=2))
