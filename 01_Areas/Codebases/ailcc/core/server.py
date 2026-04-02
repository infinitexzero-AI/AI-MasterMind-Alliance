
import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import our Advanced Reasoning Modules
# Assuming this file is run from the root directory as `python -m core.server` or similar, 
# or we adjust imports. We'll use relative import assuming it's a module.
try:
    from .advanced_reasoning import DebateTeam, DiscoverySquad, TreeOfThoughtAgent
    from .memory_manager import MemoryManager
    from .neural_skill_forge import NeuralSkillForge
except ImportError:
    # Fallback for running directly as script from core/
    from advanced_reasoning import DebateTeam, DiscoverySquad, TreeOfThoughtAgent
    from memory_manager import MemoryManager
    from neural_skill_forge import NeuralSkillForge
import os

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CortexServer")

app = FastAPI()
memory = MemoryManager()

# Global Registry Path
REGISTRY_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'registries', 'agents_registry.json'))

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_json(self, websocket: WebSocket, data: dict):
        await websocket.send_json(data)

manager = ConnectionManager()

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "cortex-core"}

@app.get("/system/metrics")
async def system_metrics_check():
    return {"status": "ok", "cpu": 0, "memory": 0}

@app.get("/system/graph")
async def get_system_graph():
    """
    Exposes the system knowledge graph for the Nexus Dashboard.
    Combines static agent registry and dynamic mission memory.
    """
    graph_data = memory.get_graph_data()
    
    # Enrich with agents from registry
    try:
        if os.path.exists(REGISTRY_PATH):
            with open(REGISTRY_PATH, 'r') as f:
                registry = json.load(f)
                for agent in registry.get("agents", []):
                    graph_data["nodes"].append({
                        "id": agent["id"],
                        "label": agent["name"],
                        "type": "agent",
                        "role": agent["role"],
                        "val": 20
                    })
                
                # Also include Daemons as nodes to prevent mapping crash
                for daemon in registry.get("daemons", []):
                    graph_data["nodes"].append({
                        "id": daemon["id"],
                        "label": daemon["name"],
                        "type": "daemon",
                        "role": daemon["role"],
                        "val": 10
                    })
                
                # Add relationship links between agents
                relationships = registry.get("relationships", {})
                for source, targets in relationships.items():
                    for target in targets:
                        graph_data["links"].append({
                            "source": source,
                            "target": target,
                            "type": "orchestrates"
                        })
    except Exception as e:
        logger.error(f"Failed to enrich graph with registry: {e}")

    return graph_data

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            logger.info(f"Received: {message}")
            
            action = message.get("action")
            
            if action == "SPAWN_DEBATE":
                topic = message.get("topic", "AI Alignment")
                await run_debate_stream(websocket, topic)
                
            elif action == "START_DISCOVERY":
                domain = message.get("domain", "Quantum Physics")
                await run_discovery_stream(websocket, domain)
                
            elif action == "FORGE_SKILL":
                objective = message.get("objective", "Write a python script")
                await run_forge_stream(websocket, objective)
                
            elif action == "TOGGLE_GRAVITY":
                # Echo back to sync all clients or just confirm
                await manager.send_json(websocket, {"type": "SYSTEM", "message": "Gravity Toggled"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error: {e}")
        await manager.send_json(websocket, {"type": "ERROR", "message": str(e)})

async def run_debate_stream(websocket: WebSocket, topic: str):
    """
    Simulates the DebateTeam logic but streams events individually for the UI.
    """
    await manager.send_json(websocket, {"type": "LOG", "message": f"Initiating Debate on: {topic}"})
    await asyncio.sleep(1)
    
    # Spawn Agents Visuals
    await manager.send_json(websocket, {
        "type": "SPAWN_AGENT", 
        "agent": {"name": "Alpha (Pro)", "type": "Proponent", "x": 400, "y": 400}
    })
    await asyncio.sleep(0.5)
    
    await manager.send_json(websocket, {
        "type": "SPAWN_AGENT", 
        "agent": {"name": "Beta (Con)", "type": "Critic", "x": 600, "y": 400}
    })
    await asyncio.sleep(0.5)

    await manager.send_json(websocket, {
        "type": "SPAWN_AGENT", 
        "agent": {"name": "Omega (Judge)", "type": "Judge", "x": 500, "y": 300}
    })
    await asyncio.sleep(1)

    # Rounds
    for r in range(2):
        await manager.send_json(websocket, {"type": "LOG", "message": f"--- Round {r+1} ---"})
        await asyncio.sleep(1)
        
        await manager.send_json(websocket, {"type": "LOG", "message": "🗣️ Proponent argues..."})
        await manager.send_json(websocket, {"type": "PULSE_AGENT", "name": "Alpha (Pro)"})
        await asyncio.sleep(2)
        
        await manager.send_json(websocket, {"type": "LOG", "message": "🛡️ Critic counter-attacks..."})
        await manager.send_json(websocket, {"type": "PULSE_AGENT", "name": "Beta (Con)"})
        await asyncio.sleep(2)

    await manager.send_json(websocket, {"type": "LOG", "message": "👩‍⚖️ Judge synthesizing verdict..."})
    await manager.send_json(websocket, {"type": "PULSE_AGENT", "name": "Omega (Judge)"})
    await asyncio.sleep(2)
    
    await manager.send_json(websocket, {"type": "LOG", "message": "✅ Verdict Reached: Proceed with caution."})


async def run_discovery_stream(websocket: WebSocket, domain: str):
    """
    Simulates DiscoverySquad logic with streaming.
    """
    await manager.send_json(websocket, {"type": "LOG", "message": f"Initializing Co-Scientist Squad for {domain}..."})
    await asyncio.sleep(1)
    
    await manager.send_json(websocket, {
        "type": "SPAWN_AGENT", 
        "agent": {"name": "Hypothesis Gen", "type": "Discovery", "x": 300, "y": 500}
    })
    await asyncio.sleep(0.5)
    
    await manager.send_json(websocket, {
        "type": "SPAWN_AGENT", 
        "agent": {"name": "Experimenter", "type": "Discovery", "x": 700, "y": 500}
    })
    await asyncio.sleep(1)
    
    await manager.send_json(websocket, {"type": "LOG", "message": "💡 Formulating Hypothesis..."})
    await manager.send_json(websocket, {"type": "PULSE_AGENT", "name": "Hypothesis Gen"})
    await asyncio.sleep(2)
    
    await manager.send_json(websocket, {"type": "LOG", "message": "📝 Designing Experiment..."})
    await manager.send_json(websocket, {"type": "CONNECT_AGENTS", "source": "Hypothesis Gen", "target": "Experimenter"})
    await asyncio.sleep(2)
    
    await manager.send_json(websocket, {"type": "LOG", "message": "📊 Running Simulation..."})
    await manager.send_json(websocket, {"type": "PULSE_AGENT", "name": "Experimenter"})
    await asyncio.sleep(2)
    
    await manager.send_json(websocket, {"type": "LOG", "message": "✅ Discovery Confirmed."})

async def run_forge_stream(websocket: WebSocket, objective: str):
    """
    Simulates NeuralSkillForge log streaming to the interactive UI.
    """
    forge = NeuralSkillForge()
    
    async def stream_cb(payload: dict):
        try:
            # Send payload directly over the WebSocket
            await manager.send_json(websocket, payload)
        except Exception as e:
            logger.error(f"Error streaming forge output: {e}")
            
    await forge.iterate_and_forge(objective=objective, stream_cb=stream_cb)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
