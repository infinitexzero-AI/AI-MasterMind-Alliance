import os
import json
import time
import requests
from datetime import datetime
from pathlib import Path
from semantic_router import SemanticRouter

# GROKIPEDIA RESEARCH AGENT v1.0
# Part of the AI Mastermind Alliance "March 2026 Strategy"

VAULT_PATH = Path("/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT")
DIRECTIVES_PATH = VAULT_PATH / "directives"
INTELLIGENCE_VAULT = VAULT_PATH / "04_Intelligence_Vault"
MODE6_DATA_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/mode6/data")

# Dynamic Model Selection (Fallback to gpt-4o if strict routing is offline)
OPTIMAL_MODEL = os.environ.get("AILCC_OPTIMAL_MODEL", "gpt-4o")


class GrokipediaAgent:
    def __init__(self):
        self.active = True
        if not DIRECTIVES_PATH.exists():
            DIRECTIVES_PATH.mkdir(parents=True, exist_ok=True)
        print("💡 GROKIPEDIA AGENT: Operational. Monitoring vault for directives...")

    def scan_directives(self):
        directives = list(DIRECTIVES_PATH.glob("*.directive"))
        for directive_file in directives:
            self.process_directive(directive_file)

    def process_directive(self, file_path):
        print(f"📡 Processing Directive: {file_path.name}")
        try:
            with open(file_path, 'r') as f:
                content = f.read().strip()
            
            # Simple metadata extraction
            topic = file_path.stem.replace("research_", "").replace("_", " ").title()
            
            # Ensure Data Directory exists
            MODE6_DATA_DIR.mkdir(parents=True, exist_ok=True)
            
            # Epoch 50: Dynamic Cognitive Routing
            router = SemanticRouter(fast_model="llama3")
            route_data = router.evaluate_task(topic, content)
            primary_agent = route_data["agent"]
            
            # Compile Swarm JSON Task Payload
            task_id = f"research-{int(time.time())}"
            payload = {
                "taskId": task_id,
                "primaryAgent": primary_agent,
                "secondaryAgents": [],
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "topic": topic,
                    "source": file_path.name,
                    "complexity": route_data["complexity"],
                    "routing_reason": route_data["reason"]
                },
                "taskData": f"Autonomously research the following topic and provide a comprehensive intelligence report formatted in Markdown. Focus on key systems, architectures, and actionable strategy.\n\nTopic: {topic}\nContext/Directive: {content}"
            }
            
            output_file = MODE6_DATA_DIR / f"decision-{task_id}.json"
            with open(output_file, 'w') as f:
                json.dump(payload, f, indent=2)
            
            print(f"✅ Handoff to Neural Loop: {output_file.name}")
            
            # Cleanup processed directive
            file_path.unlink()
            
        except Exception as e:
            print(f"❌ Task Dispatch Failure: {str(e)}")

    # Deprecated: No longer needed. Mock report generation explicitly removed in favor of real Swarm execution.

    def run(self):
        while self.active:
            self.scan_directives()
            time.sleep(10) # 10s research pulse

if __name__ == "__main__":
    agent = GrokipediaAgent()
    agent.run()
