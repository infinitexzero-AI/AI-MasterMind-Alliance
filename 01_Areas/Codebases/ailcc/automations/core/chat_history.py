"""
Agent Chat History Module
Stores and manages chat conversation history for AI agents
"""

import os
import json
import datetime
from typing import Dict, List, Optional

CHAT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), '../../agents/chat_history.json')

def load_chat_history() -> Dict:
    """Load chat history data"""
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, 'r') as f:
            return json.load(f)
    return {
        "conversations": [],
        "stats": {
            "total_messages": 0,
            "total_conversations": 0,
            "agents": {}
        }
    }

def save_chat_history(data: Dict):
    """Save chat history data"""
    os.makedirs(os.path.dirname(CHAT_HISTORY_FILE), exist_ok=True)
    with open(CHAT_HISTORY_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def save_message(agent_id: str, message: str, role: str = "user", metadata: Dict = None) -> Dict:
    """
    Save a chat message to history
    
    Args:
        agent_id: ID of the agent
        message: Message content
        role: Message role ('user', 'assistant', 'system')
        metadata: Optional metadata (context, tokens, etc.)
    """
    data = load_chat_history()
    
    message_entry = {
        "id": f"msg_{len(data['conversations']) + 1}_{int(datetime.datetime.now().timestamp())}",
        "agent_id": agent_id,
        "role": role,
        "message": message,
        "timestamp": datetime.datetime.now().isoformat(),
        "metadata": metadata or {}
    }
    
    data["conversations"].append(message_entry)
    data["stats"]["total_messages"] += 1
    
    # Update agent stats
    if agent_id not in data["stats"]["agents"]:
        data["stats"]["agents"][agent_id] = {
            "total_messages": 0,
            "last_interaction": None
        }
    
    data["stats"]["agents"][agent_id]["total_messages"] += 1
    data["stats"]["agents"][agent_id]["last_interaction"] = message_entry["timestamp"]
    
    save_chat_history(data)
    return message_entry

def get_agent_chat_history(agent_id: str, limit: int = 100, offset: int = 0) -> List[Dict]:
    """
    Get chat history for a specific agent
    
    Args:
        agent_id: Agent ID
        limit: Maximum messages to return
        offset: Offset for pagination
    """
    data = load_chat_history()
    
    # Filter by agent
    agent_messages = [msg for msg in data["conversations"] if msg["agent_id"] == agent_id]
    
    # Sort by timestamp descending (newest first)
    agent_messages.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Apply pagination
    return agent_messages[offset:offset + limit]

def get_all_chat_history(limit: int = 100, offset: int = 0, agent_id: str = None) -> Dict:
    """
    Get chat history for all agents or a specific agent
    
    Args:
        limit: Maximum messages to return
        offset: Offset for pagination
        agent_id: Optional agent ID filter
    """
    data = load_chat_history()
    
    conversations = data["conversations"]
    
    if agent_id:
        conversations = [msg for msg in conversations if msg["agent_id"] == agent_id]
    
    # Sort by timestamp descending
    conversations.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "conversations": conversations[offset:offset + limit],
        "total": len(conversations),
        "stats": data["stats"]
    }

def search_chat_history(query: str, agent_id: str = None, limit: int = 50) -> List[Dict]:
    """
    Search chat history by message content
    
    Args:
        query: Search query
        agent_id: Optional agent ID filter
        limit: Maximum results to return
    """
    data = load_chat_history()
    
    query_lower = query.lower()
    results = []
    
    for msg in data["conversations"]:
        if agent_id and msg["agent_id"] != agent_id:
            continue
        
        if query_lower in msg["message"].lower():
            results.append(msg)
    
    # Sort by timestamp descending
    results.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return results[:limit]

def get_conversation_thread(message_id: str, context_size: int = 10) -> List[Dict]:
    """
    Get conversation context around a specific message
    
    Args:
        message_id: Message ID
        context_size: Number of messages before/after to include
    """
    data = load_chat_history()
    
    # Find message index
    msg_index = next((i for i, msg in enumerate(data["conversations"]) if msg["id"] == message_id), None)
    
    if msg_index is None:
        return []
    
    # Get context window
    start = max(0, msg_index - context_size)
    end = min(len(data["conversations"]), msg_index + context_size + 1)
    
    return data["conversations"][start:end]

def delete_agent_history(agent_id: str) -> int:
    """
    Delete all chat history for an agent
    
    Args:
        agent_id: Agent ID
    
    Returns:
        Number of messages deleted
    """
    data = load_chat_history()
    
    original_count = len(data["conversations"])
    data["conversations"] = [msg for msg in data["conversations"] if msg["agent_id"] != agent_id]
    deleted_count = original_count - len(data["conversations"])
    
    # Update stats
    if agent_id in data["stats"]["agents"]:
        del data["stats"]["agents"][agent_id]
    
    data["stats"]["total_messages"] = len(data["conversations"])
    
    save_chat_history(data)
    return deleted_count

def export_chat_history(agent_id: str = None, format: str = "json") -> str:
    """
    Export chat history in various formats
    
    Args:
        agent_id: Optional agent ID filter
        format: Export format ('json', 'txt', 'csv')
    
    Returns:
        Formatted export string
    """
    data = load_chat_history()
    
    conversations = data["conversations"]
    if agent_id:
        conversations = [msg for msg in conversations if msg["agent_id"] == agent_id]
    
    if format == "json":
        return json.dumps(conversations, indent=2)
    
    elif format == "txt":
        lines = []
        for msg in conversations:
            timestamp = datetime.datetime.fromisoformat(msg["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")
            lines.append(f"[{timestamp}] {msg['agent_id']} ({msg['role']}): {msg['message']}")
            lines.append("")
        return "\n".join(lines)
    
    elif format == "csv":
        lines = ["timestamp,agent_id,role,message"]
        for msg in conversations:
            # Escape quotes in message
            message = msg["message"].replace('"', '""')
            lines.append(f'"{msg["timestamp"]}","{msg["agent_id"]}","{msg["role"]}","{message}"')
        return "\n".join(lines)
    
    return json.dumps(conversations, indent=2)

def get_chat_stats() -> Dict:
    """Get overall chat statistics"""
    data = load_chat_history()
    
    stats = data["stats"].copy()
    
    # Calculate additional stats
    if data["conversations"]:
        stats["first_message"] = min(msg["timestamp"] for msg in data["conversations"])
        stats["last_message"] = max(msg["timestamp"] for msg in data["conversations"])
        
        # Count by role
        role_counts = {}
        for msg in data["conversations"]:
            role = msg["role"]
            role_counts[role] = role_counts.get(role, 0) + 1
        stats["by_role"] = role_counts
    
    return stats
