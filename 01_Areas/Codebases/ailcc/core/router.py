
import json
import os
import logging
from typing import Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentRouter:
    def __init__(self, registry_path: str = None):
        if not registry_path:
            # Default to the standard location
            registry_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'registries', 'agents_registry.json'))
        
        self.registry_path = registry_path
        self.registry = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        """Load the agent registry from JSON."""
        try:
            with open(self.registry_path, 'r') as f:
                registry = json.load(f)
            logger.info(f"Loaded Registry Version: {registry.get('version', 'unknown')}")
            return registry
        except FileNotFoundError:
            logger.error(f"Registry file not found at {self.registry_path}")
            return {"agents": []}
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in registry file at {self.registry_path}")
            return {"agents": []}

    def route_task(self, task_description: str) -> Dict[str, Any]:
        """
        Route a task to the best matching agent based on triggers and capabilities.
        Returns a dictionary with routing decision details.
        """
        logger.info(f"Routing Task: '{task_description}'")
        
        best_agent = None
        highest_score = 0
        scores = {}

        for agent in self.registry.get('agents', []):
            score = 0
            # Check triggers (high weight)
            for trigger in agent.get('triggers', []):
                if trigger.lower() in task_description.lower():
                    score += 10
            
            # Check capabilities (medium weight)
            for cap in agent.get('capabilities', []):
                keywords = cap.lower().split()
                matches = sum(1 for kw in keywords if kw in task_description.lower())
                score += matches * 2
            
            scores[agent['id']] = score
            
            if score > highest_score:
                highest_score = score
                best_agent = agent
        
        # Default to Orchestrator if no clear match or low confidence
        if not best_agent:
             best_agent = next((a for a in self.registry.get('agents', []) if a['id'] == self.registry.get('orchestrator')), None)
             logger.info("No strong match found. Defaulting to Orchestrator.")

        decision = {
            "task": task_description,
            "selected_agent": best_agent,
            "score": highest_score,
            "all_scores": scores,
            "endpoint": best_agent['endpoints']['api'] if best_agent else None
        }

        # Log the decision
        if best_agent:
            logger.info(f"✅ ROUTING DECISION: Delegate to {best_agent['name']} (Score: {highest_score})")
        else:
            logger.warning("⚠️ ROUTING FAILIURE: No agents found in registry.")

        return decision
