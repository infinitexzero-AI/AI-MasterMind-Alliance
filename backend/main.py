from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import os
import shutil

app = FastAPI()

# Enable CORS for the dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis Connection
redis_host = os.getenv("REDIS_HOST", "localhost")
r = redis.Redis(host=redis_host, port=6379, db=0)

@app.get("/health")
def health_check():
    return {"status": "operational", "service": "Hippocampus API"}

@app.get("/memory/stats")
def memory_stats():
    try:
        info = r.info(section="memory")
        keys = r.dbsize()
        return {
            "keys_count": keys,
            "used_memory_human": info.get("used_memory_human", "0B"),
            "peak_memory_human": info.get("used_memory_peak_human", "0B"),
            "connection_status": "connected"
        }
    except Exception as e:
        return {
            "connection_status": "error",
            "error": str(e)
        }

@app.get("/vault/status")
def vault_status():
    vaults = [
        {"id": "system_drive", "path": "/Users/infinite27/AILCC_PRIME"},
        {"id": "xdrive_alpha", "path": "/Volumes/XDriveAlpha"}
    ]
    
    results = []
    for v in vaults:
        exists = os.path.exists(v["path"])
        usage = "N/A"
        if exists:
            try:
                total, used, free = shutil.disk_usage(v["path"])
                usage = f"{free // (2**30)} GiB free"
            except:
                pass
        
        results.append({
            "id": v["id"],
            "path": v["path"],
            "online": exists,
            "storage_status": usage
        })
        
    return results

# --- Ingestion Endpoints ---

from pydantic import BaseModel
from typing import Dict, Any

class MemoryItem(BaseModel):
    category: str  # e.g., "plans", "status", "knowledge"
    key: str       # e.g., "task_checklist"
    value: Dict[str, Any] # Structured JSON data

@app.post("/memory/ingest")
def ingest_memory(item: MemoryItem):
    """
    Ingest structured data into Redis.
    Structure: "category:key" -> JSON string
    """
    import json
    try:
        redis_key = f"{item.category}:{item.key}"
        # Redis stores strings, so we dump the JSON
        r.set(redis_key, json.dumps(item.value))
        return {"status": "success", "key": redis_key}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/memory/get/{key}")
def get_memory(key: str):
    """
    Retrieve structured data from Redis by key.
    """
    import json
    try:
        data = r.get(key)
        if not data:
            return {"status": "not_found", "key": key}
        return json.loads(data)
    except Exception as e:
        return {"status": "error", "error": str(e)}
