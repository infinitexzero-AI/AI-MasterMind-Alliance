import os
import json
from typing import List, Dict, Any

class MCPService:
    def __init__(self):
        self.tools_dir = "/app/scripts"
        self.automations_dir = "/app/automations"

    def list_discovered_tools(self) -> List[Dict[str, Any]]:
        """
        Scan the scripts and automations directories to discover available tools.
        """
        tools = []
        
        # 1. Scan Scripts
        if os.path.exists(self.tools_dir):
            for filename in os.listdir(self.tools_dir):
                if filename.endswith(".py") or filename.endswith(".sh"):
                    tools.append({
                        "name": filename,
                        "type": "script",
                        "path": os.path.join(self.tools_dir, filename),
                        "description": self._extract_description(os.path.join(self.tools_dir, filename))
                    })

        # 2. Scan Automations
        if os.path.exists(self.automations_dir):
            for root, dirs, files in os.walk(self.automations_dir):
                for filename in files:
                    if filename.endswith(".py") or filename.endswith(".json"):
                        tools.append({
                            "name": filename,
                            "type": "automation",
                            "path": os.path.join(root, filename),
                            "description": f"Automation found in {os.path.relpath(root, self.automations_dir)}"
                        })
        
        return tools

    def _extract_description(self, file_path: str) -> str:
        """
        Attempt to extract a docstring or comment-based description from a file.
        """
        try:
            with open(file_path, 'r') as f:
                first_line = f.readline().strip()
                if first_line.startswith("#"):
                    return first_line.replace("#", "").strip()
        except:
            pass
        return "No description available."

# Singleton instance
mcp_service = MCPService()
