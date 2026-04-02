import os
import re
import json
import requests
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance

# Connect to local Qdrant Engine (ThinkPad Native Port 6333)
qdrant = QdrantClient(url="http://localhost:6333")
COLLECTION_NAME = "hippocampus_academic"

# Nomic Embed Text gives 768 dim vectors
print("Re-aligning Qdrant Collection to 768 dimensions for Nomic...")
try:
    if qdrant.collection_exists(COLLECTION_NAME):
        qdrant.delete_collection(COLLECTION_NAME)
    
    qdrant.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    )
    print(f"Created cognitive collection: {COLLECTION_NAME}")
except Exception as e:
    print(f"Error checking/creating collection: {e}")
    exit(1)

# Target the locally transferred file relative to AILCC_PRIME root 
# It's actually at C:/Users/infin/AILCC_PRIME/02_Resources/Academics/00_Academic_Master_Plan.md
file_path = "C:/Users/infin/AILCC_PRIME/02_Resources/Academics/00_Academic_Master_Plan.md"
if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Intelligent Markdown Chunking (Split by H2 Chapters)
chunks = []
sections = re.split(r'\n## ', text)
for i, section in enumerate(sections):
    if not section.strip(): continue
    title = section.split('\n')[0].strip()
    if i == 0 and not section.startswith('##'):
        title = "Introduction & Meta Analytics"
    else:
        section = "## " + section
    chunks.append({
        "id": str(uuid.uuid4()),
        "title": title,
        "text_content": section.strip()
    })

print(f"Split Academic Master Plan into {len(chunks)} contextual macro-chunks.")

# Embed and Ingest over Mac's Ollama 
url = "http://localhost:11434/api/embeddings"
print(f"Initiating neural projection using Nomic Embed via SSH Tunnel ({url})...")

points = []
for chunk in chunks:
    payload = {
        "prompt": chunk["text_content"],
        "model": "nomic-embed-text:latest"
    }
    resp = requests.post(url, json=payload)
    if resp.status_code == 200:
        vector = resp.json()["embedding"]
        points.append(
            PointStruct(
                id=chunk["id"],
                vector=vector,
                payload={"title": chunk["title"], "source": "00_Academic_Master_Plan.md", "content": chunk["text_content"]}
            )
        )
        print(f"Embedded chunk vector: {chunk['title']}")
    else:
        print(f"Failed to embed {chunk['title']} - HTTP {resp.status_code}: {resp.text}")

# Upsert Qdrant Points
if points:
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    print(f"\n[SUCCESS] Successfully ingested {len(points)} semantic vectors into Hippocampus Qdrant Engine using Ollama!")
