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
# Resolve path - check both core/ and parent agents/ directory
AGENTS_FILE_CORE = os.path.join(os.path.dirname(__file__), 'agents.json')
AGENTS_FILE_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'agents', 'registry.json')
AGENTS_FILE = AGENTS_FILE_ROOT if os.path.exists(AGENTS_FILE_ROOT) else AGENTS_FILE_CORE

class AgentUpdate(BaseModel):
    status: Optional[str] = None
    last_active: Optional[str] = None
    session_data: Optional[Dict] = None

class HealthMetrics(BaseModel):
    health_score: int  # 0-100
    health_status: str  # healthy|degraded|unhealthy
    response_time_ms: float
    uptime_percentage: float
    error_count: int
    last_heartbeat: str

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

def calculate_health_score(agent: Dict) -> int:
    """Calculate agent health score (0-100)"""
    score = 100
    
    # Check last active time
    last_active = agent.get('last_active')
    if last_active:
        try:
            last_active_dt = datetime.datetime.fromisoformat(last_active.replace('Z', '+00:00'))
            # Ensure both datetimes are timezone-aware
            if last_active_dt.tzinfo is None:
                last_active_dt = last_active_dt.replace(tzinfo=datetime.timezone.utc)
            now = datetime.datetime.now(datetime.timezone.utc)
            seconds_since_active = (now - last_active_dt).total_seconds()
        except:
            # Fallback for parsing errors
            seconds_since_active = 0
        
        # Deduct points based on inactivity (max -40 points)
        if seconds_since_active > 3600:  # 1 hour
            score -= 40
        elif seconds_since_active > 1800:  # 30 min
            score -= 30
        elif seconds_since_active > 600:  # 10 min
            score -= 20
        elif seconds_since_active > 300:  # 5 min
            score -= 10
    
    # Check status
    status = agent.get('status', 'idle')
    if status == 'idle':
        score -= 20
    elif status == 'offline':
        score -= 60
    
    # Check error count
    error_count = agent.get('health_metrics', {}).get('error_count', 0)
    score -= min(error_count * 5, 20)  # Max -20 points
    
    return max(0, min(100, score))

def get_health_status(score: int) -> str:
    """Get health status from score"""
    if score >= 80:
        return 'healthy'
    elif score >= 50:
        return 'degraded'
    else:
        return 'unhealthy'

def calculate_uptime_percentage(agent: Dict) -> float:
    """Calculate agent uptime percentage (last 24 hours)"""
    # Simplified: based on status and last active
    status = agent.get('status', 'idle')
    if status == 'active':
        return 100.0
    elif status == 'idle':
        return 75.0
    else:
        return 0.0

def get_agent_health(agent: Dict) -> Dict:
    """Get comprehensive health metrics for an agent"""
    health_score = calculate_health_score(agent)
    health_status = get_health_status(health_score)
    uptime = calculate_uptime_percentage(agent)
    
    # Get existing health metrics or defaults
    existing_health = agent.get('health_metrics', {})
    
    return {
        'health_score': health_score,
        'health_status': health_status,
        'response_time_ms': existing_health.get('response_time_ms', 0.0),
        'uptime_percentage': uptime,
        'error_count': existing_health.get('error_count', 0),
        'last_heartbeat': agent.get('last_active', '')
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
def get_all_health():
    """Get health metrics for all agents"""
    data = load_agents()
    agents = data.get('agents', [])
    
    health_data = []
    for agent in agents:
        health = get_agent_health(agent)
        health_data.append({
            'agent_id': agent.get('id'),
            'agent_name': agent.get('name'),
            'platform': agent.get('platform'),
            **health
        })
    
    # Count by status
    healthy = sum(1 for h in health_data if h['health_status'] == 'healthy')
    degraded = sum(1 for h in health_data if h['health_status'] == 'degraded')
    unhealthy = sum(1 for h in health_data if h['health_status'] == 'unhealthy')
    
    return {
        'agents': health_data,
        'summary': {
            'total': len(health_data),
            'healthy': healthy,
            'degraded': degraded,
            'unhealthy': unhealthy
        }
    }

@router.get("/health/agent/{agent_id}")
def get_agent_health_endpoint(agent_id: str):
    """Get health metrics for a specific agent"""
    data = load_agents()
    agents = data.get('agents', [])
    
    for agent in agents:
        if agent.get('id') == agent_id:
            health = get_agent_health(agent)
            return {
                'agent_id': agent_id,
                'agent_name': agent.get('name'),
                **health
            }
    
    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")

@router.post("/{agent_id}/ping")
def ping_agent(agent_id: str):
    """Ping agent to trigger heartbeat and health check"""
    data = load_agents()
    agents = data.get('agents', [])
    
    for agent in agents:
        if agent.get('id') == agent_id:
            # Update last_active
            agent['last_active'] = datetime.datetime.now().isoformat()
            agent['status'] = 'active'
            
            # Update health metrics
            if 'health_metrics' not in agent:
                agent['health_metrics'] = {}
            agent['health_metrics']['last_heartbeat'] = datetime.datetime.now().isoformat()
            
            update_stats(data)
            save_agents(data)
            
            health = get_agent_health(agent)
            return {
                'message': f"Agent {agent_id} pinged successfully",
                'health': health
            }
    
    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")

@router.get("/unhealthy/list")
def get_unhealthy_agents():
    """Get list of unhealthy or degraded agents"""
    data = load_agents()
    agents = data.get('agents', [])
    
    unhealthy_agents = []
    for agent in agents:
        health = get_agent_health(agent)
        if health['health_status'] in ['degraded', 'unhealthy']:
            unhealthy_agents.append({
                'agent_id': agent.get('id'),
                'agent_name': agent.get('name'),
                'platform': agent.get('platform'),
                **health
            })
    
    return {
        'count': len(unhealthy_agents),
        'agents': unhealthy_agents
    }
