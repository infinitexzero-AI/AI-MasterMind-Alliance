
import logging
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MemoryManager:
    """
    Manages long-term mission history and context retrieval.
    """
    def __init__(self, memory_file_path: str = None):
        if not memory_file_path:
            self.memory_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'registries', 'mission_memory.json'))
        else:
            self.memory_file_path = memory_file_path
            
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        if not os.path.exists(self.memory_file_path):
            with open(self.memory_file_path, 'w') as f:
                json.dump({"missions": []}, f, indent=2)

    def save_mission(self, objective: str, outcome: str, domain: str, history: List[Dict[str, Any]]):
        """
        Save the result of a completed mission.
        """
        try:
            with open(self.memory_file_path, 'r') as f:
                data = json.load(f)
            
            mission_entry = {
                "timestamp": datetime.now().isoformat(),
                "objective": objective,
                "outcome": outcome,
                "domain": domain,
                "turn_count": len(history)
            }
            
            data["missions"].append(mission_entry)
            
            with open(self.memory_file_path, 'w') as f:
                json.dump(data, f, indent=2)
                
            logger.info(f"Saved mission to memory: {objective[:50]}...")
        except Exception as e:
            logger.error(f"Failed to save mission memory: {e}")

    def get_recent_missions(self, limit: int = 5, domain: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieve recent missions, optionally filtered by domain.
        """
        try:
            with open(self.memory_file_path, 'r') as f:
                data = json.load(f)
            
            missions = data.get("missions", [])
            
            if domain:
                missions = [m for m in missions if m.get("domain") == domain]
            
            # Sort by timestamp descending
            missions.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return missions[:limit]
        except Exception as e:
            logger.error(f"Failed to read mission memory: {e}")
            return []
    def get_graph_data(self) -> Dict[str, Any]:
        """
        Synthesize graph data (nodes and links) from mission memory and agent registry.
        """
        try:
            with open(self.memory_file_path, 'r') as f:
                data = json.load(f)
            
            missions = data.get("missions", [])
            nodes = []
            links = []
            
            # 1. Base Nodes (The Agents)
            # We'll pull these from the registry in the server, 
            # but for the memory manager we'll focus on Mission-centric nodes.
            
            seen_nodes = set()
            
            for m in missions:
                m_id = f"mission_{m.get('timestamp')}"
                nodes.append({
                    "id": m_id,
                    "label": m.get("objective")[:30] + "...",
                    "type": "mission",
                    "domain": m.get("domain"),
                    "timestamp": m.get("timestamp"),
                    "val": 10
                })
                
                # Link to a virtual "Orchestrator" node for now, 
                # or later link to specific agents if we attribute them in memory.
                links.append({
                    "source": "valentine-core",
                    "target": m_id,
                    "type": "executed"
                })
                
            return {"nodes": nodes, "links": links}
        except Exception as e:
            logger.error(f"Failed to generate graph data: {e}")
            return {"nodes": [], "links": []}
