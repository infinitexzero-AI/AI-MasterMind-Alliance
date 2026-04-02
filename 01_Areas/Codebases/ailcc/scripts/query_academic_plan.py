import os
import sys
import requests
from qdrant_client import QdrantClient

# Connect to local Qdrant Engine
qdrant = QdrantClient(url="http://localhost:6333")
COLLECTION_NAME = "hippocampus_academic"

# Determine semantic semantic search
query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Adaptive Policy and Two-Eyed Seeing"

# Generate Ollama Embedding for Query
url = "http://10.0.0.6:11434/api/embeddings"
payload = {"prompt": query, "model": "nomic-embed-text:latest"}

print(f"Generating vectors for query: '{query}' via Mac Ollama...")
resp = requests.post(url, json=payload)
if resp.status_code != 200:
    print(f"Failed to embed query: {resp.text}")
    exit(1)

query_vector = resp.json()["embedding"]

# Search Hippocampus Engine
hits = qdrant.search(
    collection_name=COLLECTION_NAME,
    query_vector=query_vector,
    limit=1
)

print(f"\n" + "="*50)
print(f"VANGUARD SWARM NEURAL RETRIEVAL: '{query}'")
print(f"="*50)
if hits:
    hit = hits[0]
    print(f">> IDENTIFIED COGNITIVE CHUNK: {hit.payload.get('title')}")
    print(f">> CONFIDENCE SCORE: {hit.score:.4f}")
    print("-" * 50)
    print(str(hit.payload.get('content'))[:600] + "...\n")
else:
    print("No cognitive resonance found in Hippocampus.")
