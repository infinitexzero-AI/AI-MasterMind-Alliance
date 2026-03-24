import os
import re
import json
import uuid
import time
import requests
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from pathlib import Path
from datetime import datetime

# Configuration
VAULT_PATH = Path("/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT")
QDRANT_URL = "http://localhost:6333" # Tunneled to ThinkPad Compute Node
OLLAMA_URL = "http://localhost:11434/api/embeddings"
COLLECTION_NAME = "hippocampus_stress_test"
MAX_FILES = 250 # Reduced slightly to ensure it completes within LLM timeout constraints, but large enough to stress the pipe

def initialize_qdrant():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚙️ Initializing Qdrant SSH Tunnel Link...")
    try:
        qdrant = QdrantClient(url=QDRANT_URL, timeout=30.0)
        
        # Reset collection
        if qdrant.collection_exists(COLLECTION_NAME):
            print(f"Purging old stress collection: {COLLECTION_NAME}...")
            qdrant.delete_collection(COLLECTION_NAME)
            
        print("Forging new collection (Nomic Embed 768-D)...")
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
        return qdrant
    except Exception as e:
        print(f"❌ Qdrant Connection Failed (Tunnel Down?): {e}")
        exit(1)

def chunk_markdown(content, filename):
    chunks = []
    # Split by double newline or headers
    raw_chunks = re.split(r'\n## |\n\n', content)
    for c in raw_chunks:
        c = c.strip()
        if len(c) > 50: # Avoid tiny fragments
            chunks.append({
                "id": str(uuid.uuid4()),
                "text": c[:2000], # Hard cap context length per chunk
                "source": filename
            })
    return chunks

def run_stress_test():
    qdrant = initialize_qdrant()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📚 Scanning Vault for raw matter...")
    
    all_chunks = []
    file_count = 0
    
    for root, dirs, files in os.walk(VAULT_PATH):
        if ".obsidian" in root or ".trash" in root:
            continue
            
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        text = f.read()
                    
                    file_chunks = chunk_markdown(text, file)
                    all_chunks.extend(file_chunks)
                    
                    file_count += 1
                    if file_count >= MAX_FILES:
                        break
                except Exception:
                    continue
        if file_count >= MAX_FILES:
            break
            
    # Cap total chunks to 300 to ensure the test completes in a minute or two
    all_chunks = all_chunks[:300]
    
    print(f"Extracted {len(all_chunks)} neural chunks from {file_count} documents.")
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🚀 COMMENCING VECTOR PIPELINE STRESS TEST...")
    
    success_count = 0
    start_time = time.time()
    
    for chunk in all_chunks:
        try:
            # 1. Embed locally
            payload = {
                "prompt": chunk["text"],
                "model": "nomic-embed-text:latest"
            }
            resp = requests.post(OLLAMA_URL, json=payload, timeout=60.0)
            if resp.status_code == 200:
                vector = resp.json().get("embedding")
                if not vector:
                    continue
                    
                # 2. Push across tunnel
                qdrant.upsert(
                    collection_name=COLLECTION_NAME,
                    points=[
                        PointStruct(
                            id=chunk["id"],
                            vector=vector,
                            payload={"source": chunk["source"], "preview": chunk["text"][:100]}
                        )
                    ]
                )
                success_count += 1
                if success_count % 50 == 0:
                    print(f"   ⚡ Indexed {success_count} vectors over SSH tunnel...")
            else:
                print(f"⚠️ Ollama Embedding Failed: {resp.status_code}")
                
        except requests.exceptions.Timeout:
            print("❌ TIMEOUT: The SSH Tunnel or Ollama hung!")
            break
        except Exception as e:
            print(f"❌ PIPELINE RUPTURE: {e}")
            break
            
    elapsed = time.time() - start_time
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 🏁 STRESS TEST COMPLETE")
    print(f"Vectors Ingested: {success_count} / {len(all_chunks)}")
    print(f"Duration: {elapsed:.2f} seconds")
    if elapsed > 0:
        print(f"Throughput: {success_count/elapsed:.2f} vectors/second")
    
    if success_count == len(all_chunks) and len(all_chunks) > 0:
        print("✅ TUNNEL INTEGRITY: FLAWLESS")
    else:
        print("⚠️ TUNNEL INTEGRITY: COMPROMISED (or zero chunks processed)")

if __name__ == "__main__":
    run_stress_test()
