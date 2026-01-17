from fastapi import FastAPI
from qdrant_client import QdrantClient
import uvicorn
import os

app = FastAPI()

# Connect to the Local Embedded Storage
STORAGE_PATH = "/Users/infinite27/AILCC_PRIME/06_System/Hippocampus/qdrant_storage"
client = QdrantClient(path=STORAGE_PATH)

@app.get("/collections")
def get_collections():
    # Mimic Qdrant API structure slightly or just return what we need
    # The Node.js client expects { result: { collections: [...] } } or similar
    # But my metrics.ts calls client.getCollections() which hits /collections
    # Qdrant API response for /collections is { result: { collections: [...] }, time: ... }
    return {
        "result": {
            "collections": [
                {"name": col.name} for col in client.get_collections().collections
            ]
        }
    }

@app.get("/collections/{collection_name}")
def get_collection(collection_name: str):
    # Qdrant API response for /collections/{name} includes result.points_count
    try:
        col = client.get_collection(collection_name)
        return {
            "result": {
                "status": str(col.status),
                "points_count": col.points_count,
                "vectors_count": col.vectors_count,
            }
        }
    except Exception as e:
        return {"result": None, "status": "error", "message": str(e)}

if __name__ == "__main__":
    print(f"🧠 Hippocampus Server (Python) starting on port 6333...")
    print(f"📂 Serving Storage: {STORAGE_PATH}")
    uvicorn.run(app, host="0.0.0.0", port=6333)
