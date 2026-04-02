import sqlite3
import struct
import requests
import json
import uuid
from datetime import datetime
import os

DB_PATH = os.path.expanduser("~/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT/vault_vector_store.db")
OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"

def get_embedding(text):
    print(f"🧠 [VectorBridge] Generating embedding via Ollama ({MODEL})...")
    try:
        response = requests.post(OLLAMA_EMBED_URL, json={
            "model": MODEL,
            "prompt": text
        }, timeout=45)
        if response.status_code == 200:
            return response.json().get("embedding", [])
        else:
            print(f"❌ [VectorBridge] Ollama rejected embedding: {response.text}")
            return []
    except Exception as e:
        print(f"❌ [VectorBridge] Ollama connection failed: {e}")
        return []

def upsert_to_sqlite(content, doc_path="Clinical_Logs.md", chunk_index=0):
    if not content or len(content) < 5:
        return False
        
    vector = get_embedding(content)
    if not vector:
        print("❌ [VectorBridge] Vector generation failed. Aborting SQLite ingestion.")
        return False
        
    vec_id = f"vec_{uuid.uuid4().hex[:8]}"
    timestamp = datetime.utcnow().isoformat()
    
    # Crucial: Pack Python float list into C-style Float32 buffer for JS Node compatibility
    try:
        buf = struct.pack(f'{len(vector)}f', *vector)
    except Exception as e:
        print(f"❌ [VectorBridge] Float packing error: {e}")
        return False
    
    try:
        # Connect to the exact database governed by the Node.js local_vector_store.ts
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Ensure the table schema matches the Node adapter expectations precisely
        cur.execute('''
            CREATE TABLE IF NOT EXISTS vectors (
                id TEXT PRIMARY KEY,
                vector BLOB NOT NULL,
                content TEXT,
                doc_path TEXT,
                chunk_index INTEGER,
                timestamp TEXT
            )
        ''')
        
        cur.execute('''
            INSERT OR REPLACE INTO vectors (id, vector, content, doc_path, chunk_index, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (vec_id, buf, content, doc_path, chunk_index, timestamp))
        
        conn.commit()
        conn.close()
        print(f"✅ [VectorBridge] Successfully injected zero-RAM semantic memory: {vec_id}")
        return True
    except Exception as e:
        print(f"❌ [VectorBridge] SQLite Injection failed: {e}")
        return False
        
if __name__ == "__main__":
    # Diagnostic self-test
    test_text = "Diagnostic memory packet: Testing the offline local SQLite vector bridge."
    upsert_to_sqlite(test_text, "Diagnostic.test", 0)
