"""
Task Assignment System
Manages assignment of Linear tasks to AI agents
"""

import os
import json
import datetime
from typing import Dict, List, Optional

ASSIGNMENTS_FILE = os.path.join(os.path.dirname(__file__), '../../agents/task_assignments.json')

def load_assignments() -> Dict:
    """Load task assignments data"""
    if os.path.exists(ASSIGNMENTS_FILE):
        with open(ASSIGNMENTS_FILE, 'r') as f:
            return json.load(f)
    return {
        "assignments": [],
        "agent_workload": {},
        "stats": {
            "total_assigned": 0,
            "total_completed": 0,
            "total_in_progress": 0
        }
    }

def save_assignments(data: Dict):
    """Save assignments data"""
    os.makedirs(os.path.dirname(ASSIGNMENTS_FILE), exist_ok=True)
    with open(ASSIGNMENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def assign_task(task_id: str, task_title: str, agent_id: str, task_url: str = None, priority: int = 2) -> Dict:
    """
    Assign a Linear task to an agent
    
    Args:
        task_id: Linear task identifier (e.g., "AI-123")
        task_title: Task title
        agent_id: ID of the agent to assign to
        task_url: Optional Linear task URL
        priority: Task priority (0-4)
    """
    data = load_assignments()
    
    # Check if task already assigned
    existing = next((a for a in data["assignments"] if a["task_id"] == task_id), None)
    if existing:
        # Update existing assignment
        existing["agent_id"] = agent_id
        existing["updated_at"] = datetime.datetime.now().isoformat()
    else:
        # Create new assignment
        assignment = {
            "id": f"assign_{len(data['assignments']) + 1}",
            "task_id": task_id,
            "task_title": task_title,
            "task_url": task_url,
            "agent_id": agent_id,
            "priority": priority,
            "status": "assigned",
            "assigned_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat(),
            "completed_at": None,
            "notes": ""
        }
        data["assignments"].append(assignment)
        data["stats"]["total_assigned"] += 1
    
    # Update agent workload
    if agent_id not in data["agent_workload"]:
        data["agent_workload"][agent_id] = {
            "total_assigned": 0,
            "in_progress": 0,
            "completed": 0,
            "tasks": []
        }
    
    workload = data["agent_workload"][agent_id]
    if existing:
        # Remove from old agent's workload if reassigned
        old_agent = existing.get("agent_id")
        if old_agent and old_agent != agent_id and old_agent in data["agent_workload"]:
            old_workload = data["agent_workload"][old_agent]
            old_workload["tasks"] = [t for t in old_workload["tasks"] if t != task_id]
            old_workload["total_assigned"] = max(0, old_workload["total_assigned"] - 1)
    
    if task_id not in workload["tasks"]:
        workload["tasks"].append(task_id)
        workload["total_assigned"] += 1
        workload["in_progress"] += 1
    
    save_assignments(data)
    return existing if existing else assignment

def update_task_status(task_id: str, status: str, notes: str = None) -> Optional[Dict]:
    """
    Update task assignment status
    
    Args:
        task_id: Linear task identifier
        status: New status ('assigned', 'in_progress', 'completed', 'blocked')
        notes: Optional notes about the status change
    """
    data = load_assignments()
    
    assignment = next((a for a in data["assignments"] if a["task_id"] == task_id), None)
    if not assignment:
        return None
    
    old_status = assignment["status"]
    assignment["status"] = status
    assignment["updated_at"] = datetime.datetime.now().isoformat()
    
    if notes:
        assignment["notes"] = notes
    
    if status == "completed":
        assignment["completed_at"] = datetime.datetime.now().isoformat()
    
    # Update agent workload
    agent_id = assignment["agent_id"]
    if agent_id in data["agent_workload"]:
        workload = data["agent_workload"][agent_id]
        
        if old_status != "completed" and status == "completed":
            workload["in_progress"] = max(0, workload["in_progress"] - 1)
            workload["completed"] += 1
            data["stats"]["total_completed"] += 1
            data["stats"]["total_in_progress"] = max(0, data["stats"]["total_in_progress"] - 1)
        elif old_status == "assigned" and status == "in_progress":
            data["stats"]["total_in_progress"] += 1
    
    save_assignments(data)
    return assignment

def get_agent_assignments(agent_id: str, include_completed: bool = False) -> List[Dict]:
    """Get all task assignments for an agent"""
    data = load_assignments()
    
    assignments = [a for a in data["assignments"] if a["agent_id"] == agent_id]
    
    if not include_completed:
        assignments = [a for a in assignments if a["status"] != "completed"]
    
    # Sort by priority (high to low) then by assigned date
    assignments.sort(key=lambda x: (-x.get("priority", 0), x.get("assigned_at", "")))
    
    return assignments

def get_all_assignments(status: str = None) -> List[Dict]:
    """Get all task assignments, optionally filtered by status"""
    data = load_assignments()
    
    assignments = data["assignments"]
    
    if status:
        assignments = [a for a in assignments if a["status"] == status]
    
    assignments.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    
    return assignments

def get_agent_workload_summary(agent_id: str = None) -> Dict:
    """Get workload summary for one or all agents"""
    data = load_assignments()
    
    if agent_id:
        workload = data["agent_workload"].get(agent_id, {
            "total_assigned": 0,
            "in_progress": 0,
            "completed": 0,
            "tasks": []
        })
        return {
            "agent_id": agent_id,
            **workload
        }
    else:
        # Return all agent workloads sorted by current workload
        workload_list = []
        for aid, wl in data["agent_workload"].items():
            workload_list.append({
                "agent_id": aid,
                **wl
            })
        workload_list.sort(key=lambda x: x["in_progress"], reverse=True)
        return {
            "agents": workload_list,
            "stats": data["stats"]
        }

def unassign_task(task_id: str) -> bool:
    """Remove task assignment"""
    data = load_assignments()
    
    assignment = next((a for a in data["assignments"] if a["task_id"] == task_id), None)
    if not assignment:
        return False
    
    # Update agent workload
    agent_id = assignment["agent_id"]
    if agent_id in data["agent_workload"]:
        workload = data["agent_workload"][agent_id]
        if task_id in workload["tasks"]:
            workload["tasks"].remove(task_id)
        workload["total_assigned"] = max(0, workload["total_assigned"] - 1)
        if assignment["status"] != "completed":
            workload["in_progress"] = max(0, workload["in_progress"] - 1)
    
    # Remove assignment
    data["assignments"] = [a for a in data["assignments"] if a["task_id"] != task_id]
    data["stats"]["total_assigned"] = max(0, data["stats"]["total_assigned"] - 1)
    
    if assignment["status"] != "completed":
        data["stats"]["total_in_progress"] = max(0, data["stats"]["total_in_progress"] - 1)
    
    save_assignments(data)
    return True
