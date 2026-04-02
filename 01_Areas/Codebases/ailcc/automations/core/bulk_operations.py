"""
Bulk Agent Management
Handles bulk operations on multiple agents
"""

import os
import json
from typing import List, Dict
from datetime import datetime

def load_agents_file():
    """Load agents from registry"""
    agents_file = os.path.join(os.path.dirname(__file__), '../../agents/registry.json')
    if os.path.exists(agents_file):
        with open(agents_file, 'r') as f:
            return json.load(f)
    return {"agents": [], "stats": {}}

def save_agents_file(data):
    """Save agents to registry"""
    agents_file = os.path.join(os.path.dirname(__file__), '../../agents/registry.json')
    with open(agents_file, 'w') as f:
        json.dump(data, f, indent=2)

def bulk_ping_agents(agent_ids: List[str]) -> Dict:
    """
    Ping multiple agents at once
    
    Args:
        agent_ids: List of agent IDs to ping
    
    Returns:
        Dict with success/failure results
    """
    data = load_agents_file()
    results = {
        "success": [],
        "failed": [],
        "total": len(agent_ids)
    }
    
    for agent_id in agent_ids:
        agent = next((a for a in data["agents"] if a["id"] == agent_id), None)
        if agent:
            # Update last heartbeat
            agent["last_heartbeat"] = datetime.now().isoformat()
            results["success"].append(agent_id)
        else:
            results["failed"].append(agent_id)
    
    save_agents_file(data)
    return results

def bulk_update_status(agent_ids: List[str], status: str) -> Dict:
    """
    Update status for multiple agents
    
    Args:
        agent_ids: List of agent IDs
        status: New status value
    
    Returns:
        Update results
    """
    data = load_agents_file()
    results = {
        "updated": [],
        "failed": [],
        "total": len(agent_ids)
    }
    
    for agent_id in agent_ids:
        agent = next((a for a in data["agents"] if a["id"] == agent_id), None)
        if agent:
            agent["status"] = status
            agent["updated_at"] = datetime.now().isoformat()
            results["updated"].append(agent_id)
        else:
            results["failed"].append(agent_id)
    
    save_agents_file(data)
    return results

def bulk_reset_errors(agent_ids: List[str]) -> Dict:
    """
    Reset error counts for multiple agents
    
    Args:
        agent_ids: List of agent IDs
    
    Returns:
        Reset results
    """
    data = load_agents_file()
    results = {
        "reset": [],
        "failed": [],
        "total": len(agent_ids)
    }
    
    for agent_id in agent_ids:
        agent = next((a for a in data["agents"] if a["id"] == agent_id), None)
        if agent:
            agent["error_count"] = 0
            agent["updated_at"] = datetime.now().isoformat()
            results["reset"].append(agent_id)
        else:
            results["failed"].append(agent_id)
    
    save_agents_file(data)
    return results

def bulk_get_health(agent_ids: List[str]) -> List[Dict]:
    """
    Get health status for multiple agents
    
    Args:
        agent_ids: List of agent IDs
    
    Returns:
        List of agent health data
    """
    # Import here to avoid circular dependency
    from . import agent_registry
    
    health_data = []
    for agent_id in agent_ids:
        try:
            health = agent_registry.get_agent_health(agent_id)
            health_data.append(health)
        except Exception:
            health_data.append({
                "agent_id": agent_id,
                "error": "Failed to get health"
            })
    
    return health_data

def bulk_delete_agents(agent_ids: List[str]) -> Dict:
    """
    Delete multiple agents from registry
    
    Args:
        agent_ids: List of agent IDs to delete
    
    Returns:
        Deletion results
    """
    data = load_agents_file()
    results = {
        "deleted": [],
        "failed": [],
        "total": len(agent_ids)
    }
    
    original_count = len(data["agents"])
    data["agents"] = [a for a in data["agents"] if a["id"] not in agent_ids]
    deleted_count = original_count - len(data["agents"])
    
    results["deleted"] = agent_ids[:deleted_count]
    results["failed"] = agent_ids[deleted_count:]
    
    # Update stats
    data["stats"]["total_agents"] = len(data["agents"])
    
    save_agents_file(data)
    return results

def get_agents_by_platform(platform: str) -> List[str]:
    """
    Get all agent IDs for a specific platform
    
    Args:
        platform: Platform name ('desktop', 'browser', 'mobile', etc.)
    
    Returns:
        List of agent IDs
    """
    data = load_agents_file()
    return [a["id"] for a in data["agents"] if a.get("platform") == platform]

def get_unhealthy_agents() -> List[str]:
    """
    Get all unhealthy agent IDs
    
    Returns:
        List of unhealthy agent IDs
    """
    from . import agent_registry
    
    data = load_agents_file()
    unhealthy = []
    
    for agent in data["agents"]:
        try:
            health_status = agent_registry.get_health_status(agent)
            if health_status == "unhealthy":
                unhealthy.append(agent["id"])
        except Exception:
            pass
    
    return unhealthy
