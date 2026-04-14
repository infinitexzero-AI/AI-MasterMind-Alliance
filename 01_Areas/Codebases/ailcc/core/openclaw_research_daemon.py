import asyncio
import json
import logging
from pathlib import Path
from core.daemon_factory import ReactiveDaemon
from comet_framework.llm_gateway import LLMGateway

logger = logging.getLogger("OpenClawDaemon")

class OpenClawResearchDaemon(ReactiveDaemon):
    """
    Phase 92: MiniMax-M2.7 OpenClaw Integration.
    Autonomously scans the Commander's active Human Skills and deploys MiniMax-M2.7 via Ollama to execute deep-research 1% curriculum synthesis.
    """
    def __init__(self):
        super().__init__(name="OpenClawResearch", role="Self-Improvement Synthesizer")
        # Dynamic root resolution for cross-platform (Mac/Windows) compatibility
        self.codebase_root = Path(__file__).resolve().parents[1] # c:\Users\infin\AILCC_PRIME\01_Areas\Codebases\ailcc
        self.project_root = self.codebase_root.parents[4] # c:\Users\infin\AILCC_PRIME
        self.base_dir = self.project_root / "01_Areas" / "1_percent_diary"
        self.skills_file = self.base_dir / "skills_matrix.json"
        
    async def get_channels(self):
        # Listens for explicit manual triggers via Redis
        return ["channel:openclaw_exec"]

    async def handle_event(self, channel, message):
        if channel == "channel:openclaw_exec":
            await self._execute_research_sprint()

    async def run(self):
        await self.setup()
        await self.broadcast_status("OpenClawResearch", "ONLINE", "Monitoring Synergistic Skill Tree for active human growth nodes.")
        
        while True:
            # Autonomous cycle: Once every 36 hours, auto-research the lowest performing skill
            try:
                await self._execute_research_sprint()
            except Exception as e:
                logger.error(f"OpenClaw autonomous loop failed: {e}")
            await asyncio.sleep(129600)  # 36 hours
            
    async def _execute_research_sprint(self):
        if not self.skills_file.exists():
            return
            
        with open(self.skills_file, 'r') as f:
            skills_data = json.load(f)
            
        nodes = skills_data.get("nodes", [])
        if not nodes:
            return
            
        # Select the skill with the lowest human score to focus self-improvement
        target_node = sorted(nodes, key=lambda x: x['human_dimension']['current_score'])[0]
        skill_name = target_node['human_dimension']['skill_name']
        
        await self.broadcast_status("OpenClawResearch", "RESEARCHING", f"Deploying MiniMax-M2.7 OpenClaw to research: {skill_name}")
        
        system_prompt = self._load_heuristic()
        user_prompt = f"Teach yourself {skill_name}. Provide a 1% daily action curriculum based on the best practices you analyze from the web."
        
        # Dispatch to M2.7 via Ollama using the standard AILCC LLMGateway
        response = await LLMGateway.ask_agent(
            provider="ollama",
            api_key="",  # Local Ollama
            model="minimax-m2.7:cloud", 
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            skip_context=True
        )
        
        # Pipe synthesis directly into Hippocampus RAG (simulated logic here)
        logger.info(f"OpenClaw Synthesis Complete for {skill_name}. Integrating to Hippocampus.")
        await self._pipe_to_hippocampus(skill_name, response)
        
        await self.broadcast_status("OpenClawResearch", "COMPLETED", f"Curriculum for {skill_name} generated and stored.")
        
    def _load_heuristic(self):
        heuristic_path = self.codebase_root / "core" / "skill_templates" / "openclaw_heuristic.json"
        if heuristic_path.exists():
            with open(heuristic_path, 'r') as f:
                return json.load(f).get("system_prompt", "")
        return "You are MiniMax-M2.7 running via OpenClaw. Execute self-improvement tasks."
        
    async def _pipe_to_hippocampus(self, skill_name, research_data):
        # Integrates findings directly into the broader AILCC memory bank
        try:
            r = await self._get_redis()
            payload = json.dumps({
                "type": "OPENCLAW_RESEARCH",
                "skill": skill_name,
                "data": research_data
            })
            await r.publish("channel:hippocampus_ingest", payload)
        except Exception as e:
            logger.error(f"Failed to pipe to Hippocampus: {e}")

if __name__ == "__main__":
    daemon = OpenClawResearchDaemon()
    asyncio.run(daemon.run())
