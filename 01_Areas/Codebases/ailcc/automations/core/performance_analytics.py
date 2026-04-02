"""
Agent Performance Analytics
Tracks and analyzes agent performance metrics over time
"""

import os
import json
import datetime
from typing import Dict, List, Optional

ANALYTICS_FILE = os.path.join(os.path.dirname(__file__), '../../agents/performance_analytics.json')

def load_analytics() -> Dict:
    """Load performance analytics data"""
    if os.path.exists(ANALYTICS_FILE):
        with open(ANALYTICS_FILE, 'r') as f:
            return json.load(f)
    return {
        "agents": {},
        "global_stats": {
            "total_tasks_completed": 0,
            "total_response_time_ms": 0,
            "total_errors": 0,
            "start_date": datetime.datetime.now().isoformat()
        }
    }

def save_analytics(data: Dict):
    """Save analytics data"""
    os.makedirs(os.path.dirname(ANALYTICS_FILE), exist_ok=True)
    with open(ANALYTICS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def record_task_completion(agent_id: str, task_type: str, duration_ms: float, success: bool = True):
    """
    Record a task completion for analytics
    
    Args:
        agent_id: ID of the agent that completed the task
        task_type: Type of task (e.g., 'intel', 'navigation', 'file_analysis')
        duration_ms: Time taken to complete task in milliseconds
        success: Whether the task was successful
    """
    data = load_analytics()
    
    # Initialize agent data if not exists
    if agent_id not in data["agents"]:
        data["agents"][agent_id] = {
            "tasks_completed": 0,
            "tasks_failed": 0,
            "total_response_time_ms": 0,
            "avg_response_time_ms": 0,
            "task_types": {},
            "performance_history": []
        }
    
    agent_data = data["agents"][agent_id]
    
    # Update task counts
    if success:
        agent_data["tasks_completed"] += 1
        data["global_stats"]["total_tasks_completed"] += 1
    else:
        agent_data["tasks_failed"] += 1
        data["global_stats"]["total_errors"] += 1
    
    # Update response times
    agent_data["total_response_time_ms"] += duration_ms
    total_tasks = agent_data["tasks_completed"] + agent_data["tasks_failed"]
    agent_data["avg_response_time_ms"] = agent_data["total_response_time_ms"] / total_tasks if total_tasks > 0 else 0
    
    # Update task type stats
    if task_type not in agent_data["task_types"]:
        agent_data["task_types"][task_type] = {"count": 0, "avg_duration_ms": 0, "total_duration_ms": 0}
    
    task_type_data = agent_data["task_types"][task_type]
    task_type_data["count"] += 1
    task_type_data["total_duration_ms"] += duration_ms
    task_type_data["avg_duration_ms"] = task_type_data["total_duration_ms"] / task_type_data["count"]
    
    # Add to performance history (keep last 100 entries)
    agent_data["performance_history"].append({
        "timestamp": datetime.datetime.now().isoformat(),
        "task_type": task_type,
        "duration_ms": duration_ms,
        "success": success
    })
    agent_data["performance_history"] = agent_data["performance_history"][-100:]
    
    save_analytics(data)
    return agent_data

def get_agent_analytics(agent_id: str, days: int = 7) -> Dict:
    """
    Get analytics for a specific agent
    
    Args:
        agent_id: Agent ID
        days: Number of days to include in history
    """
    data = load_analytics()
    
    if agent_id not in data["agents"]:
        return {
            "agent_id": agent_id,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "avg_response_time_ms": 0,
            "task_types": {},
            "recent_performance": []
        }
    
    agent_data = data["agents"][agent_id]
    
    # Filter performance history by days
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
    recent_performance = [
        entry for entry in agent_data.get("performance_history", [])
        if datetime.datetime.fromisoformat(entry["timestamp"]) > cutoff_date
    ]
    
    return {
        "agent_id": agent_id,
        "tasks_completed": agent_data.get("tasks_completed", 0),
        "tasks_failed": agent_data.get("tasks_failed", 0),
        "avg_response_time_ms": round(agent_data.get("avg_response_time_ms", 0), 2),
        "task_types": agent_data.get("task_types", {}),
        "recent_performance": recent_performance[-50:]  # Last 50 entries
    }

def get_all_analytics(days: int = 7) -> Dict:
    """Get analytics for all agents"""
    data = load_analytics()
    
    agents_analytics = []
    for agent_id in data["agents"]:
        agents_analytics.append(get_agent_analytics(agent_id, days))
    
    # Calculate global stats
    total_tasks = sum(a["tasks_completed"] for a in agents_analytics)
    total_failed = sum(a["tasks_failed"] for a in agents_analytics)
    avg_response = sum(a["avg_response_time_ms"] * a["tasks_completed"] for a in agents_analytics) / total_tasks if total_tasks > 0 else 0
    
    return {
        "agents": agents_analytics,
        "global_stats": {
            "total_agents": len(agents_analytics),
            "total_tasks_completed": total_tasks,
            "total_tasks_failed": total_failed,
            "success_rate": (total_tasks / (total_tasks + total_failed) * 100) if (total_tasks + total_failed) > 0 else 0,
            "avg_response_time_ms": round(avg_response, 2),
            "start_date": data["global_stats"].get("start_date", datetime.datetime.now().isoformat())
        }
    }

def get_performance_trends(agent_id: Optional[str] = None, days: int = 7) -> List[Dict]:
    """
    Get performance trends over time
    
    Args:
        agent_id: Optional agent ID to filter by
        days: Number of days to analyze
    """
    data = load_analytics()
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
    
    # Collect all performance data
    all_performance = []
    
    if agent_id:
        # Single agent
        if agent_id in data["agents"]:
            all_performance = data["agents"][agent_id].get("performance_history", [])
    else:
        # All agents
        for agent_data in data["agents"].values():
            all_performance.extend(agent_data.get("performance_history", []))
    
    # Filter by date and sort
    filtered = [
        entry for entry in all_performance
        if datetime.datetime.fromisoformat(entry["timestamp"]) > cutoff_date
    ]
    filtered.sort(key=lambda x: x["timestamp"])
    
    # Group by day for trending
    daily_stats = {}
    for entry in filtered:
        date = entry["timestamp"][:10]  # YYYY-MM-DD
        if date not in daily_stats:
            daily_stats[date] = {
                "date": date,
                "tasks": 0,
                "successes": 0,
                "failures": 0,
                "total_duration_ms": 0,
                "avg_duration_ms": 0
            }
        
        daily_stats[date]["tasks"] += 1
        if entry["success"]:
            daily_stats[date]["successes"] += 1
        else:
            daily_stats[date]["failures"] += 1
        daily_stats[date]["total_duration_ms"] += entry["duration_ms"]
    
    # Calculate averages
    for stats in daily_stats.values():
        stats["avg_duration_ms"] = round(stats["total_duration_ms"] / stats["tasks"], 2) if stats["tasks"] > 0 else 0
        stats["success_rate"] = round((stats["successes"] / stats["tasks"] * 100), 2) if stats["tasks"] > 0 else 0
    
    return list(daily_stats.values())
