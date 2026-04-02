import json
import logging
import datetime

logger = logging.getLogger("AgentRegistry")

class AgentRegistry:
    """
    Central repository for all active AI agents in the Life OS.
    Tracks status, roles, and capabilities.
    """
    def __init__(self):
        self.agents = {}
        # Seed with known agents
        self._seed_defaults()

    def _seed_defaults(self):
        self.register_agent("Comet", "Orchestrator", ["Research", "Dispatch", "Git"], "ONLINE")
        self.register_agent("Antigravity", "Desktop Automation", ["Files", "Terminal"], "OFFLINE") 
        self.register_agent("Grok", "Strategic Planner", ["Crypto", "Logic"], "ONLINE")
        self.register_agent("Claude", "Code Architect", ["Dev", "Refactor"], "ONLINE")
        self.register_agent("Gemini", "Multimodal", ["Google Workspace", "Vision"], "ONLINE")
        self.register_agent("WebScraper", "Data Fetch", ["Crawling", "Scraping"], "ONLINE")
        self.register_agent("MoodTracker", "Wellbeing Check", ["Sentiment Analysis", "Check-ins"], "ONLINE")

    def register_agent(self, name, role, capabilities, status="ONLINE"):
        self.agents[name] = {
            "name": name,
            "role": role,
            "capabilities": capabilities,
            "status": status,
            "last_seen": datetime.datetime.now().isoformat()
        }
        logger.info(f"Registry: Agent {name} updated to {status}")

    def update_status(self, name, status):
        if name in self.agents:
            self.agents[name]["status"] = status
            self.agents[name]["last_seen"] = datetime.datetime.now().isoformat()
        else:
            logger.warning(f"Registry: Attempted to update unknown agent {name}")

    def get_roster(self):
        """Returns list of agents for Dashboard display"""
        return list(self.agents.values())

    def to_json(self):
        return json.dumps(self.agents, indent=2)
