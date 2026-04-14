import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import redis
import hashlib
import time

app = FastAPI(title="AI Command Center API", version="1.0.1")

# Connect to the Redis Neural Synapse (Shared with JS Relay)
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, socket_timeout=2)

# Global Vision Configuration (State)
vision_config = {
    "diff_threshold": 5.0,
    "quota_cooldown": 60,
    "active_courses": ["GENS-2101", "HLTH-1011", "CLAS-2501", "MATH-1151"]
}



# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SystemStatus(BaseModel):
    status: str
    phase: str
    health: str
    last_sync: Optional[str] = None
    redis_connected: bool

class VisionAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    image_path: Optional[str] = None
    prompt: Optional[str] = None

class VisionConfigUpdate(BaseModel):
    diff_threshold: Optional[float] = None
    quota_cooldown: Optional[int] = None
    active_courses: Optional[list[str]] = None



@app.get("/")
async def root():
    return {"message": "AI Command Center API is online"}

@app.get("/api/v1/status", response_model=SystemStatus)
async def get_status():
    # Attempt to read from .alliance_memory.json or active_dashboard_state.json
    redis_ok = False
    try:
        redis_ok = r.ping()
    except:
        pass

    try:
        # Relative path logic: AILCC_ROOT is up 3 levels from server/api
        memory_path = "../../../.alliance_memory.json"
        if os.path.exists(memory_path):
            with open(memory_path, "r") as f:
                memory = json.load(f)
                return {
                    "status": "Active",
                    "phase": memory.get("current_phase", "5"),
                    "health": memory.get("system_health", "Green"),
                    "last_sync": memory.get("last_updated"),
                    "redis_connected": redis_ok
                }
    except Exception as e:
        print(f"Error reading memory: {e}")
    
    return {
        "status": "Active",
        "phase": "5",
        "health": "Green",
        "last_sync": "N/A",
        "redis_connected": redis_ok
    }

@app.post("/api/v1/vision/analyze")
async def analyze_image(request: VisionAnalysisRequest):
    """
    Proxied analyze endpoint with Image Hashing/Caching to mitigate Quota 429 errors.
    """
    if not request.image_path:
        return {"error": "image_path required"}
    
    # 1. Generate Image Hash
    try:
        with open(request.image_path, "rb") as f:
            img_data = f.read()
            img_hash = hashlib.md5(img_data).hexdigest()
    except Exception as e:
        return {"error": f"Failed to hash image: {e}"}

    # 2. Check Cache (Redis)
    cache_key = f"vision:cache:{img_hash}"
    cached_result = r.get(cache_key)
    if cached_result:
        print(f"[*] Cache Hit for {request.image_path}")
        return json.loads(cached_result)

    # 3. If no cache, this is where we would call Gemini
    # For now, we return a 'cache_miss' signal or the caller can handle it
    # But to be a true proxy, we'd call Gemini here.
    return {
        "status": "cache_miss",
        "hash": img_hash,
        "message": "Call the actual LLM agent; result not found in Cortex cache."
    }

@app.post("/api/v1/vision/cache")
async def cache_vision_result(img_hash: str, result: dict):
    """Store analyzed result in Redis cache."""
    cache_key = f"vision:cache:{img_hash}"
    r.setex(cache_key, 86400 * 7, json.dumps(result)) # Cache for 1 week
    return {"status": "indexed"}

@app.get("/api/v1/vision/config")
async def get_vision_config():
    return vision_config

@app.post("/api/v1/vision/config")
async def update_vision_config(update: VisionConfigUpdate):
    if update.diff_threshold is not None:
        vision_config["diff_threshold"] = update.diff_threshold
    if update.quota_cooldown is not None:
        vision_config["quota_cooldown"] = update.quota_cooldown
    if update.active_courses is not None:
        vision_config["active_courses"] = update.active_courses
    return {"status": "updated", "config": vision_config}
    
@app.get("/api/v1/academics/profile")
async def get_academic_profile():
    path = "../../../hippocampus_storage/academic_matrix/competency_profile.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"error": "Profile not found"}

@app.get("/api/v1/academics/summer")
async def get_summer_plan():
    path = "../../../hippocampus_storage/academic_matrix/summer_2026.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"error": "Summer plan not found"}

@app.get("/api/v1/tasks/registry")
async def get_task_registry():
    path = "tasks/consolidated_task_registry.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"error": "Registry not found"}

@app.get("/api/v1/health")
async def health_check():
    # Shallow health check for theortex
    redis_ok = False
    try:
        redis_ok = r.ping()
    except:
        pass
    
    return {
        "status": "healthy" if redis_ok else "degraded", 
        "service": "cortex-api",
        "redis": "connected" if redis_ok else "disconnected"
    }


@app.get("/api/v1/skills")
async def get_skills():
    path = "../../../hippocampus_storage/skills.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"error": "Skills not found"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")
            
            if action == "FORGE_SKILL":
                objective = payload.get("objective")
                await websocket.send_json({"type": "log", "message": f"Analyzing objective: {objective}"})
                
                # Simulate Forge logic (In Phase 2 we connect this to an actual LLM/Agent)
                time.sleep(1)
                await websocket.send_json({"type": "log", "message": "Synthesizing research framework..."})
                time.sleep(1)
                
                simulated_code = f"# Skill: {objective}\n# Generated for AILCC Vanguard\n\ndef execute_protocol():\n    print('Executing protocol for: {objective}')\n    return True\n"
                await websocket.send_json({"type": "code", "content": simulated_code})
                
                # Persist the new skill
                skills_path = "../../../hippocampus_storage/skills.json"
                new_skill_id = f"S_FORGED_{int(time.time())}"
                
                if os.path.exists(skills_path):
                    with open(skills_path, "r+") as f:
                        skills_data = json.load(f)
                        new_skill = {
                            "id": new_skill_id,
                            "domain": "RESEARCH",
                            "name": objective[:30],
                            "description": f"Synthesized skill for objective: {objective}",
                            "level": 1,
                            "evidence_links": [],
                            "prerequisite_courses": []
                        }
                        skills_data["skills"].append(new_skill)
                        f.seek(0)
                        json.dump(skills_data, f, indent=2)
                        f.truncate()
                        await websocket.send_json({"type": "success", "message": f"Skill forged and indexed successfully: {new_skill_id}"})
                else:
                    await websocket.send_json({"type": "error", "message": f"Skills database not found at {skills_path}"})

    except WebSocketDisconnect:
        print("Client disconnected from Neural Forge")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
