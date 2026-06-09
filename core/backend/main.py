from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import json
import psutil
import time
import redis
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from services.neural_memory_service import memory_service
from services.blackboard_service import blackboard_service
from services.health_monitor_service import health_monitor
from services.strategy_service import strategy_service
from services.mcp_service import mcp_service
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background health monitor
    health_monitor.start()
    yield
    # Shutdown: Stop the monitor
    health_monitor.stop()

app = FastAPI(lifespan=lifespan)

# Enable CORS for the dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Token Limit Circuit Breaker Middleware
import tiktoken
from fastapi import Request
from fastapi.responses import JSONResponse

MAX_TOKENS = 500000

async def get_body(request: Request):
    body = await request.body()
    # Repopulate the body so endpoints can still consume it
    async def receive():
        return {"type": "http.request", "body": body}
    request._receive = receive
    return body

@app.middleware("http")
async def token_limit_circuit_breaker(request: Request, call_next):
    if request.method in ["POST", "PUT"]:
        body = await get_body(request)
        if body:
            try:
                enc = tiktoken.get_encoding("cl100k_base")
                tokens = len(enc.encode(body.decode("utf-8")))
                if tokens > MAX_TOKENS:
                    return JSONResponse(
                        status_code=413, 
                        content={"status": "error", "error": f"Circuit Breaker Tripped: Payload contains {tokens} tokens, exceeding {MAX_TOKENS} limit."}
                    )
            except Exception:
                pass
    
    response = await call_next(request)
    return response

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
        
        # Calculate key distribution by namespace
        namespaces = {}
        all_keys = r.keys("*")
        for key in all_keys:
            key_str = key.decode("utf-8")
            ns = key_str.split(":")[0] if ":" in key_str else "default"
            namespaces[ns] = namespaces.get(ns, 0) + 1

        return {
            "keys_count": keys,
            "used_memory_human": info.get("used_memory_human", "0B"),
            "peak_memory_human": info.get("used_memory_peak_human", "0B"),
            "namespaces": namespaces,
            "connection_status": "connected"
        }
    except Exception as e:
        return {
            "connection_status": "error",
            "error": str(e)
        }

@app.get("/system/metrics")
def get_system_metrics():
    try:
        cpu = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_usage": cpu,
            "memory": {
                "total": mem.total,
                "available": mem.available,
                "percent": mem.percent
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "timestamp": time.time()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/vault/index")
def get_vault_index():
    try:
        data = r.get("vault:index")
        if not data:
            return []
        return json.loads(data)
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/vault/search")
def search_vault(q: str):
    try:
        data = r.get("vault:index")
        if not data:
            return []
        index = json.loads(data)
        
        # Simple fuzzy search
        results = []
        query = q.lower()
        for item in index:
            if query in item['title'].lower() or query in item.get('summary', '').lower() or query in item['name'].lower():
                results.append(item)
        
        return results
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/system/graph")
def get_system_graph():
    return {
        "nodes": [
            {"id": "Antigravity", "group": "agent", "val": 20},
            {"id": "Valentine", "group": "agent", "val": 15},
            {"id": "Comet", "group": "agent", "val": 15},
            {"id": "Hippocampus", "group": "core", "val": 25},
            {"id": "Redis", "group": "core", "val": 18},
            {"id": "Vault", "group": "core", "val": 18},
            {"id": "Linear", "group": "integration", "val": 12},
            {"id": "N8N", "group": "integration", "val": 12},
            {"id": "Browser Agent", "group": "agent", "val": 12}
        ],
        "links": [
            {"source": "Antigravity", "target": "Hippocampus", "label": "core_sync"},
            {"source": "Valentine", "target": "Hippocampus", "label": "vision_sync"},
            {"source": "Comet", "target": "Hippocampus", "label": "scout_sync"},
            {"source": "Hippocampus", "target": "Redis", "label": "persistence"},
            {"source": "Comet", "target": "Linear", "label": "task_dispatch"},
            {"source": "Antigravity", "target": "Vault", "label": "intel_indexing"},
            {"source": "Redis", "target": "Vault", "label": "metadata_cache"},
            {"source": "Browser Agent", "target": "Hippocampus", "label": "web_intelligence"}
        ]
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

# --- Linear integration ---

class LinearTask(BaseModel):
    ticket_id: str
    description: str
    title: str

@app.post("/task/linear")
def handle_linear_webhook(task: LinearTask):
    """
    Receives an incoming ticket from Linear via n8n.
    Saves it into the Redis Swarm Pulse queue for Antigravity processing.
    """
    import json
    import time
    try:
        redis_key = f"task:linear:{task.ticket_id}"
        payload = {
            "id": task.ticket_id,
            "title": task.title,
            "description": task.description,
            "source": "linear",
            "status": "pending",
            "timestamp": time.time()
        }
        r.set(redis_key, json.dumps(payload))
        return {"status": "success", "message": f"Linear ticket {task.ticket_id} routed to Mastermind queue."}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# --- Voice-to-Task Pipeline ---
from fastapi import UploadFile, File
import uuid

@app.post("/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    """
    Receives an audio blob from the Dashboard, saves it temporarily, and (eventually) passes it to Whisper.
    For now, it saves the file to the active pipeline directory and queues a task.
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs("voice_memos", exist_ok=True)
        filename = f"voice_memos/voice_{uuid.uuid4().hex}.webm"
        
        with open(filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # In a generic pipeline, we would call openai.Audio.transcribe here
        mock_transcript = "Mock implementation: Deploy AI models to production via Swarm."
        
        # Insert a simulated task into the Linear queue
        ticket_id = f"LIN-V{uuid.uuid4().hex[:4].upper()}"
        redis_key = f"task:linear:{ticket_id}"
        payload = {
            "id": ticket_id,
            "title": f"Voice Memo: {mock_transcript[:20]}...",
            "description": f"Transcribed Audio:\n\n{mock_transcript}\n\nAudio saved at: {filename}",
            "source": "voice",
            "status": "pending",
        }
        import json
        r.set(redis_key, json.dumps(payload))
        
        return {"status": "success", "transcript": mock_transcript, "ticket_id": ticket_id}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# --- Swarm Blackboard (Communication) Endpoints ---

class BlackboardMessage(BaseModel):
    channel: str
    message: Dict[str, Any]
    sender: Optional[str] = "unknown_agent"

@app.post("/swarm/broadcast")
def swarm_broadcast(msg: BlackboardMessage):
    try:
        result = blackboard_service.broadcast(msg.channel, msg.message, msg.sender)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/swarm/intent/{channel}")
def get_swarm_intent(channel: str):
    try:
        intent = blackboard_service.get_latest_intent(channel)
        if intent:
            return {"status": "success", "intent": intent}
        return {"status": "not_found", "message": f"No active intent on channel: {channel}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- Strategy Synthesis (Hive Mind) Endpoints ---

@app.post("/swarm/strategy/synthesize")
def synthesize_strategy():
    try:
        result = strategy_service.synthesize_next_step()
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- mcp (Tool Discovery) Endpoints ---

@app.get("/swarm/tools/discover")
def discover_tools():
    try:
        tools = mcp_service.list_discovered_tools()
        return {"status": "success", "count": len(tools), "tools": tools}
    except Exception as e:
        return {"status": "error", "message": str(e)}
# --- Neural Memory (RAG) Endpoints ---

class MemoryQuery(BaseModel):
    query: str
    n_results: Optional[int] = 5

class MemoryUpsert(BaseModel):
    id: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

@app.post("/memory/query")
def query_memory(q: MemoryQuery):
    try:
        results = memory_service.query_knowledge(q.query, q.n_results)
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/memory/upsert")
def upsert_memory(item: MemoryUpsert):
    try:
        result = memory_service.upsert_knowledge(item.id, item.content, item.metadata)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
