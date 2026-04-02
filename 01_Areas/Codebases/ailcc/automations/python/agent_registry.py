"""
Agent Registry System
Manages all AI agents across desktop, mobile, browser, and background platforms
"""

import os
import json
import datetime
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Load agent registry
AGENTS_FILE = os.path.join(os.path.dirname(__file__), 'agents.json')

class AgentUpdate(BaseModel):
    status: Optional[str] = None
    last_active: Optional[str] = None
    session_data: Optional[Dict] = None

class AgentRegistration(BaseModel):
    id: str
    name: str
    platform: str
    device: str
    capabilities: List[str]
    sync_method: str
    endpoint: Optional[str] = None

def load_agents() -> Dict:
    """Load agents from JSON file"""
    if os.path.exists(AGENTS_FILE):
        with open(AGENTS_FILE, 'r') as f:
            return json.load(f)
    return {"agents": [], "stats": {}}

def save_agents(data: Dict):
    """Save agents to JSON file"""
    with open(AGENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def update_stats(data: Dict):
    """Update registry statistics"""
    agents = data.get('agents', [])
    active = sum(1 for a in agents if a.get('status') == 'active')
    idle = sum(1 for a in agents if a.get('status') == 'idle')
    
    platforms = {}
    for agent in agents:
        p = agent.get('platform')
        platforms[p] = platforms.get(p, 0) + 1
    
    data['stats'] = {
        'total_agents': len(agents),
        'active_agents': active,
        'idle_agents': idle,
        'platforms': platforms,
        'last_updated': datetime.datetime.now().isoformat()
    }

# Create router
router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.get("/")
def list_agents():
    """List all registered agents"""
    data = load_agents()
    return data

@router.get("/{agent_id}")
def get_agent(agent_id: str):
    """Get specific agent details"""
    data = load_agents()
    agents = data.get('agents', [])
    
    for agent in agents:
        if agent.get('id') == agent_id:
            return agent
    
    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")

@router.post("/register")
def register_agent(agent: AgentRegistration):
    """Register a new agent"""
    data = load_agents()
    agents = data.get('agents', [])
    
    # Check if agent already exists
    for existing in agents:
        if existing.get('id') == agent.id:
            raise HTTPException(status_code=400, detail=f"Agent {agent.id} already registered")
    
    # Add new agent
    new_agent = agent.dict()
    new_agent['status'] = 'active'
    new_agent['last_active'] = datetime.datetime.now().isoformat()
    new_agent['session_data'] = {
        'conversations': 0,
        'tasks_completed': 0,
        'intel_contributed': 0,
        'artifacts_created': 0
    }
    
    agents.append(new_agent)
    data['agents'] = agents
    update_stats(data)
    save_agents(data)
    
    return {"message": f"Agent {agent.id} registered successfully", "agent": new_agent}

@router.put("/{agent_id}/heartbeat")
def agent_heartbeat(agent_id: str):
    """Update agent last_active timestamp"""
    data = load_agents()
    agents = data.get('agents', [])
    
    for agent in agents:
        if agent.get('id') == agent_id:
            agent['last_active'] = datetime.datetime.now().isoformat()
            agent['status'] = 'active'
            update_stats(data)
            save_agents(data)
            return {"message": f"Agent {agent_id} heartbeat updated"}
    
    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")

@router.put("/{agent_id}/status")
def update_agent_status(agent_id: str, update: AgentUpdate):
    """Update agent status and session data"""
    data = load_agents()
    agents = data.get('agents', [])
    
    for agent in agents:
        if agent.get('id') == agent_id:
            if update.status:
                agent['status'] = update.status
            if update.last_active:
                agent['last_active'] = update.last_active
            if update.session_data:
                agent['session_data'].update(update.session_data)
            
            update_stats(data)
            save_agents(data)
            return {"message": f"Agent {agent_id} updated", "agent": agent}
    
    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")

@router.get("/platform/{platform}")
def get_agents_by_platform(platform: str):
    """Get all agents for a specific platform"""
    data = load_agents()
    agents = data.get('agents', [])
    
    filtered = [a for a in agents if a.get('platform') == platform]
    return {
        "platform": platform,
        "count": len(filtered),
        "agents": filtered
    }

@router.get("/status/{status}")
def get_agents_by_status(status: str):
    """Get all agents with a specific status"""
    data = load_agents()
    agents = data.get('agents', [])
    
    filtered = [a for a in agents if a.get('status') == status]
    return {
        "status": status,
        "count": len(filtered),
        "agents": filtered
    }

@router.get("/health/all")
def get_all_agent_health():
    """Get health status for all agents"""
    data = load_agents()
    agents = data.get('agents', [])
    now = datetime.datetime.now()
    
    health_data = []
    summary = {"total": len(agents), "healthy": 0, "degraded": 0, "unhealthy": 0}
    
    for agent in agents:
        # Parse timestamp safely
        last_active_str = agent.get('last_active', now.isoformat())
        try:
            last_active = datetime.datetime.fromisoformat(last_active_str)
        except ValueError:
            last_active = now

        diff_seconds = (now - last_active).total_seconds()
        
        # Determine status
        status = "healthy"
        score = 100
        
        # Deduction for inactivity
        if diff_seconds > 300: # 5 mins
            status = "degraded"
            score -= 20
        if diff_seconds > 900: # 15 mins
            status = "unhealthy"
            score -= 40
            
        # Deduction for errors (mock logic if error_count isn't tracked yet)
        error_count = agent.get('error_count', 0)
        if error_count > 0:
            status = "degraded" if status != "unhealthy" else "unhealthy"
            score -= (error_count * 10)
            
        if score < 0: score = 0
        
        summary[status] += 1
        
        health_data.append({
            "agent_id": agent['id'],
            "agent_name": agent.get('name', 'Unknown'),
            "platform": agent.get('platform', 'Unknown'),
            "health_status": status,
            "health_score": score,
            "response_time_ms": agent.get('latency_ms', 45), # Mock
            "uptime_percentage": agent.get('uptime', 99.9), # Mock
            "last_heartbeat": last_active_str,
            "error_count": error_count
        })
        
    return {"summary": summary, "agents": health_data}

@router.post("/{agent_id}/ping")
def ping_agent(agent_id: str):
    """Simulate pinging an agent"""
    # In a real system, this would send a WS message or HTTP req to the agent
    # We reuse heartbeat logic to simulate 'waking up'
    return agent_heartbeat(agent_id)

@router.post("/bulk/ping")
def bulk_ping_agents(payload: dict):
    agent_ids = payload.get('agent_ids', [])
    results = []
    for aid in agent_ids:
        try:
            agent_heartbeat(aid)
            results.append({"id": aid, "status": "success"})
        except:
            results.append({"id": aid, "status": "failed"})
    return {"results": results}

@router.post("/bulk/reset-errors")
def bulk_reset_errors(payload: dict):
    agent_ids = payload.get('agent_ids', [])
    return {"message": "Errors reset (simulated)"}
