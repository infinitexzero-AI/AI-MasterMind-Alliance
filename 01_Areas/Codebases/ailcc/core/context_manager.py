
import json
import os
from typing import Any, Dict, Optional

STATE_FILE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/registries/task_state.json"

class ContextManager:
    """
    Manages the active system context, including the current project and workspace.
    Ensures that delegations and logins persist the correct state.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ContextManager, cls).__new__(cls)
            cls._instance._load_state()
        return cls._instance

    def _load_state(self):
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r') as f:
                    self.state = json.load(f)
            except Exception:
                self.state = {"tasks": [], "last_updated": None, "system_status": "active", "active_project": None}
        else:
            self.state = {"tasks": [], "last_updated": None, "system_status": "active", "active_project": None}

    def save_state(self):
        with open(STATE_FILE, 'w') as f:
            json.dump(self.state, f, indent=2)

    def set_active_project(self, project_name: str):
        self.state["active_project"] = project_name
        self.save_state()

    def get_active_project(self) -> Optional[str]:
        return self.state.get("active_project")

    def get_context_summary(self) -> Dict[str, Any]:
        return {
            "active_project": self.get_active_project(),
            "system_status": self.state.get("system_status"),
            "last_updated": self.state.get("last_updated")
        }

context_manager = ContextManager()
