import os
import json
import logging
import asyncio
from typing import Dict, Any

from comet_framework.llm_gateway import LLMGateway
from core.blackboard_daemon import BlackboardDaemon
from core.neural_skill_forge import NeuralSkillForge
from core.ghostwriter_daemon import GhostwriterDaemon
from core.publishing_bridge import PublishingBridge

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("SovereignAgency")

class SovereignAgencyDaemon:
    """
    Epoch X Phase 69: The Sovereign Software Company.
    Chains MCP Research -> Blackboard Design -> Forge Execution -> Ghostwriter Documentation
    into a singular, autonomous app-building pipeline.
    """
    def __init__(self):
        self.blackboard = BlackboardDaemon()
        self.forge = NeuralSkillForge()
        self.ghostwriter = GhostwriterDaemon()
        self.bridge = PublishingBridge()
        
        self.project_dir_base = os.path.expanduser("~/AILCC_PRIME/01_Areas/Agency_Builds")
        os.makedirs(self.project_dir_base, exist_ok=True)

    async def _research_phase(self, idea: str, ws_callback=None) -> str:
        if ws_callback: await ws_callback("AGENCY_RESEARCH", "IN_PROGRESS", f"Researching architecture for: {idea}")
        logger.info("Agency Step 1: Researching architecture patterns via MCP/Web...")
        
        # In a full implementation, we would query Exa or Perplexity via MCP here.
        # For baseline speed, we will use Haiku to generate an architectural manifesto
        system_prompt = "You are the Lead Architect. Research and propose the optimal tech stack and file structure for the given application idea. Output technical strategy and required files."
        
        research = await LLMGateway.ask_agent(
            provider="anthropic",
            api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            model="claude-3-haiku-20240307",
            system_prompt=system_prompt,
            user_prompt=idea
        )
        return research

    async def _design_phase(self, idea: str, research: str, ws_callback=None) -> Dict[str, Any]:
        if ws_callback: await ws_callback("AGENCY_DESIGN", "IN_PROGRESS", "Debating optimal file structure in Blackboard...")
        logger.info("Agency Step 2: Peer-Reviewing the Architecture Blueprint...")
        
        # Route through Blackboard for multi-agent validation
        debate_result = await self.blackboard.debate_and_resolve(
            f"Based on this research:\n{research}\n\nDesign the exact folder structure and list the Python/JS files needed to build '{idea}'. Return ONLY valid JSON: {{\"files\": [{{\"path\": \"src/main.py\", \"purpose\": \"...\"}}]}}"
        )
        return debate_result

    async def _execution_phase(self, project_path: str, files_to_build: list, ws_callback=None) -> bool:
        if ws_callback: await ws_callback("AGENCY_FORGE", "IN_PROGRESS", f"Forging {len(files_to_build)} files across the architecture...")
        logger.info(f"Agency Step 3: Neural Skill Forge synthesizing {len(files_to_build)} files...")
        
        await self.forge.initialize_forge() # clean sandbox
        
        for file_req in files_to_build:
            relative_path = file_req.get('path', 'script.py')
            purpose = file_req.get('purpose', '')
            
            # Sub-forge task
            code = await self.forge.generate_script(f"Write the code for {relative_path}. Purpose: {purpose}", language="python" if relative_path.endswith('.py') else "nodejs")
            
            # Save to absolute project path
            full_path = os.path.join(project_path, relative_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, "w") as f:
                f.write(code)
            logger.info(f"Forged -> {relative_path}")
            
        return True

    async def _documentation_phase(self, project_name: str, idea: str, ws_callback=None) -> str:
        if ws_callback: await ws_callback("AGENCY_DOCS", "IN_PROGRESS", "Ghostwriter drafting READMe and Docs...")
        logger.info("Agency Step 4: Ghostwriter drafting README...")
        
        readme_content = await self.ghostwriter.draft_manifesto(
            context_logs=f"Project Idea: {idea}. The Swarm autonomously synthesized this application.",
            topic=project_name
        )
        return readme_content

    async def run_development_cycle(self, project_name: str, idea: str, ws_callback=None) -> str:
        """Runs the entire 4-step autonomous agency pipeline."""
        try:
            safe_name = "".join(c if c.isalnum() else "_" for c in project_name).strip("_")
            project_path = os.path.join(self.project_dir_base, safe_name)
            os.makedirs(project_path, exist_ok=True)
            
            logger.info(f"--- SOVEREIGN AGENCY PIPELINE INITIATED: {safe_name} ---")
            
            # 1. Research
            research = await self._research_phase(idea, ws_callback)
            
            # 2. Design (Blackboard)
            design_res = await self._design_phase(idea, research, ws_callback)
            
            # Parse the JSON from the Blackboard output
            try:
                # Naive json extraction
                import re
                json_str = re.search(r'\{.*\}', design_res.get('code', '{}'), re.DOTALL)
                if json_str:
                    files_list = json.loads(json_str.group())['files']
                else:
                    files_list = [{"path": "main.py", "purpose": "Core logic"}, {"path": "utils.py", "purpose": "Helpers"}]
            except Exception as parse_e:
                logger.warning(f"Failed to parse Blackboard JSON, using generic fallback: {parse_e}")
                files_list = [{"path": "main.py", "purpose": "Main entry point for " + idea}]
                
            # 3. Execution (Forge)
            await self._execution_phase(project_path, files_list, ws_callback)
            
            # 4. Documentation (Ghostwriter)
            readme = await self._documentation_phase(project_name, idea, ws_callback)
            with open(os.path.join(project_path, "README.md"), "w") as f:
                f.write(readme)
                
            if ws_callback: await ws_callback("AGENCY_DEPLOYMENT", "COMPLETED", f"Project deployed successfully to {project_path}")
            logger.info(f"--- SOVEREIGN AGENCY PIPELINE COMPLETE: {project_path} ---")
            
            return f"Success: {project_path}"
            
        except Exception as e:
            logger.error(f"Agency Pipeline Failed: {e}")
            if ws_callback: await ws_callback("AGENCY_DEPLOYMENT", "FAILED", str(e))
            return f"Error: {e}"
