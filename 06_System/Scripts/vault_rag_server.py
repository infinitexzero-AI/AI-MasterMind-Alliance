import os
import glob
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
import uvicorn

app = FastAPI(title="AILCC Vault RAG Server", version="1.0.0")

VAULT_DIR = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault"
CHROMA_HOST = "localhost"
CHROMA_PORT = 8000
COLLECTION_NAME = "vault_knowledge_base"

# Initialize ChromaDB Client
try:
    client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    print(f"✅ Vault RAG Server Connected to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}")
except Exception as e:
    print(f"❌ Failed to connect to ChromaDB: {e}")
    client = None
    collection = None

class QueryRequest(BaseModel):
    query: str
    num_results: int = 3

@app.post("/sync")
def sync_vault():
    """Reads all markdown files in the Intelligence Vault and upserts them into ChromaDB."""
    if not collection:
        raise HTTPException(status_code=500, detail="ChromaDB not connected.")
    
    md_files = glob.glob(f"{VAULT_DIR}/**/*.md", recursive=True)
    if not md_files:
        return {"status": "success", "message": "No markdown files found in the vault.", "count": 0}

    documents = []
    metadatas = []
    ids = []

    for file_path in md_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            if not content.strip():
                continue
                
            # Naive chunking: just use whole document for now as semantic context
            doc_id = str(Path(file_path).relative_to(VAULT_DIR))
            
            documents.append(content)
            metadatas.append({"source": doc_id, "type": "markdown"})
            ids.append(doc_id)
            
        except Exception as e:
            print(f"Warning: Failed to read {file_path}. Error: {e}")

    if documents:
        # Upsert in batches to prevent payload too large errors
        batch_size = 50
        for i in range(0, len(documents), batch_size):
            collection.upsert(
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size],
                ids=ids[i:i+batch_size]
            )
            
    return {"status": "success", "count": len(documents), "collection_total": collection.count()}

@app.post("/query")
def query_vault(request: QueryRequest):
    """Hits ChromaDB to find the most semantically relevant vault documents."""
    if not collection:
        raise HTTPException(status_code=500, detail="ChromaDB not connected.")
        
    results = collection.query(
        query_texts=[request.query],
        n_results=request.num_results
    )
    
    return {"query": request.query, "results": results}

if __name__ == "__main__":
    if client:
        print("🚀 Starting Vault RAG Server on port 8091...")
        uvicorn.run(app, host="0.0.0.0", port=8091)
    else:
        print("❌ Cannot start server without ChromaDB.")
