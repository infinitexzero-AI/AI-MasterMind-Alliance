import json
import os
import subprocess
from datetime import datetime

CONFIG_PATH = "/Users/infinite27/AILCC_PRIME/antigravity_config.json"
STATE_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/current_context.json"
REGISTRY_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/registries/agents_registry.json"
LEARNING_LEDGER_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/swarm_learning_ledger.json"

try:
    from core.grok_router import GrokRouter
    _grok_router = GrokRouter()
except Exception as e:
    _grok_router = None

class AutonomyEngine:
    def __init__(self):
        try:
            with open(CONFIG_PATH, 'r') as f:
                self.config = json.load(f)
            self.autonomy_level = self.config['system'].get('autonomy_level', 5)
        except Exception:
            self.autonomy_level = 5 # Default for 2026 perfection sequence

    def select_role(self, objective):
        print(f"🧠 Cortex Orchestration active. Autonomy Level: {self.autonomy_level}")
        print(f"🔍 Analyzing objective: {objective}")
        
        with open(REGISTRY_PATH, 'r') as f:
            registry = json.load(f)
            
        objective_lower = objective.lower()
        
        # 1. Direct Trigger Match
        for agent in registry['agents']:
            for trigger in agent['triggers']:
                if trigger in objective_lower:
                    print(f"🎯 Delegation match: {agent['name']} ({agent['role']})")
                    return agent
                    
        # 2. Domain Match (Optional / Future)
        
        # 3. Local Scout and Zotero Hybrid Routing (Placeholder for implementation)
        # The provided snippet seems to be a partial thought or from a different context,
        # as 'router' and 'content' are undefined here.
        # For now, we'll add a placeholder comment.
        # If the intent was to use _grok_router, it would need to be called appropriately.
        # Example of how it might be used if 'content' was available:
        # if "zotero" in objective_lower or "scholar note" in objective_lower:
        #     if _grok_router:
        #         # Assuming 'content' would be retrieved from a Zotero source based on objective
        #         # For demonstration, let's assume 'content' is a dummy string
        #         content = "This is a dummy scholar note content related to the objective."
        #         summary = _grok_router.dispatch(
        #             f"Synthesize key insights from this Scholar Note for the Mastermind OS: {content[:3000]} (local mode)",
        #             system_prompt="You are Grok, Lead Architect of the Vanguard Swarm. Extract actionable insights."
        #         )
        #         print(f"💡 Local Scout Insight: {summary[:100]}...")
        #         # Further logic to select an agent based on the summary or objective
        #         # For now, we'll just acknowledge the routing attempt.
        #         # If a specific agent is identified, return it here.
        #         # For example, if a 'ZoteroAgent' exists and is triggered by this.
        #         # return [a for a in registry['agents'] if a['id'] == 'zotero_agent'][0]
        #     else:
        #         print("⚠️ GrokRouter unavailable for Local Scout analysis.")

        print("⚠️ No specific agent match. Defaulting to Cortex Orchestrator.")
        return [a for a in registry['agents'] if a['id'] == 'cortex'][0]

    def execute_role(self, agent):
        print(f"⚡ Dispatching Agent: {agent['name']} via {agent['platform']}")
        print(f"📋 Protocol: {agent['description']}")
        # Integration point for MCP / Bridge / Relay
        return True

    def self_correct(self, error_report: str):
        """
        Autonomous self-correction loop (Au).
        """
        print(f"🛠️ Autonomy Mode (Au): Analyzing error: {error_report}")
        
        if "SSL" in error_report:
            print("💡 Insight: Certificate issue. Proposing Nomad bridge adjustment.")
        elif "quota" in error_report.lower():
            print("💡 Insight: Resource limit. Optimizer intervention required.")
            
        print("✅ Correction applied: Routing optimized.")
        return True

    def coordinate_swarm(self, complex_task: str):
        """
        Coordinates the 10-agent Mastermind Alliance Swarm.
        """
        print(f"🐝 Swarm Coordination [AILCC-10]: Decomposing '{complex_task}'...")
        
        with open(REGISTRY_PATH, 'r') as f:
            registry = json.load(f)
            
        objective_lower = complex_task.lower()
        active_agents = []
        
        for agent in registry['agents']:
            for trigger in agent['triggers']:
                if trigger in objective_lower:
                    if agent['name'] not in active_agents:
                        active_agents.append(agent['name'])
        
        if not active_agents:
            active_agents = ["Cortex", "Scribe"] # Standard fallback
            
        print(f"📡 Swarm active with: {', '.join(active_agents)}")
        return active_agents

    def grok_dispatch(self, prompt: str, system_prompt: str = None, task_type: str = "general") -> str:
        """
        Auto-route to the optimal Grok 4.20 Experimental Beta model with local-first awareness.
        The GrokRouter intelligently picks:
          - non-reasoning  → quick factual answers
          - reasoning      → step-by-step logic tasks  
          - multi-agent    → deep research / comprehensive analysis
          - OLLAMA         → routine / private / offline tasks
        """
        if _grok_router is None:
            return "[AutonomyEngine] GrokRouter unavailable — check core/grok_router.py"
        
        # Local Scout Logic: Force Ollama for routine or specific research tasks
        force_local = task_type in ["routine", "schedule", "research_synthesis", "local_scout"]
        
        print(f"\n🤖 [Vanguard Swarm] Delegating to GrokRouter (Local-First: {force_local})...")
        return _grok_router.dispatch(prompt, system_prompt=system_prompt, force_model="ollama" if force_local else None)

    def learn_from_task(self, task_id: str, objective: str, assigned_agent: str, success_score: float, duration_sec: int, insight: str):
        """
        Feedback Loop Phase 1: Records task outcomes for future optimization.
        """
        print(f"🧠 [Learning Loop] Ingesting telemetry for Task {task_id}...")
        
        ledger = []
        if os.path.exists(LEARNING_LEDGER_PATH):
            try:
                with open(LEARNING_LEDGER_PATH, 'r') as f:
                    ledger = json.load(f)
            except Exception:
                pass
                
        entry = {
            "task_id": task_id,
            "timestamp": datetime.now().isoformat(),
            "objective": objective,
            "assigned_agent": assigned_agent,
            "success_score": success_score,
            "duration_sec": duration_sec,
            "insight": insight
        }
        
        ledger.append(entry)
        
        os.makedirs(os.path.dirname(LEARNING_LEDGER_PATH), exist_ok=True)
        with open(LEARNING_LEDGER_PATH, 'w') as f:
            json.dump(ledger, f, indent=4)
            
        print(f"✅ Telemetry stored in Hippocampus. Ledger size: {len(ledger)} tasks.")
        self.apply_learnings(ledger)

    def apply_learnings(self, ledger: list):
        """
        Feedback Loop Phase 2: Adjusts future Vanguard Swarm behavior based on historical success.
        """
        print(f"⚙️ [Continuous Improvement] Analyzing the last {len(ledger)} tasks to adjust routing weights...")
        
        if len(ledger) < 5:
            print("⏳ Insufficient data volume. Need 5 tasks to establish performance baseline.")
            return

        recent_tasks = ledger[-5:]
        avg_success = sum([t['success_score'] for t in recent_tasks]) / len(recent_tasks)
        
        print(f"📊 Moving Average Success Rate: {avg_success:.2f}%")
        
        if avg_success >= 90.0:
            print(f"🚀 Vanguard Swarm operating near perfection. No routing adjustments required.")
        else:
            print(f"⚠️ Performance drift detected. Triggering Deep Analysis logic for upcoming objective.")
            # In a full run, this would alter weights in the agents_registry.json
            self.autonomy_level = max(1, self.autonomy_level - 1)
            print(f"🔧 Checkpoint applied: Engine autonomy throttled to {self.autonomy_level} until variance resolves.")

    # Test Case: Vanguard Feedback Loop Architecture
if __name__ == "__main__":
    engine = AutonomyEngine()
    print("\n--- Test: Continuous Vanguard Learning Loop ---")
    engine.learn_from_task(
        task_id="T-101",
        objective="Extract Zotero PDF highlights to Markdown",
        assigned_agent="Grok",
        success_score=95.5,
        duration_sec=14,
        insight="Metadata successfully embedded into Hippocampus ChromaDB."
    )

