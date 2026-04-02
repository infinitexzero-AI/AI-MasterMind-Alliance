import os
import json
import logging
from typing import Dict, Any, Optional

from comet_framework.llm_gateway import LLMGateway

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("MultiAgentBlackboard")

class BlackboardDaemon:
    """
    Epoch IX Phase 66: The Multi-Agent Blackboard.
    Forces consensus between multiple LLMs (Architect, Red Team, Judge) before executing complex logic.
    """
    def __init__(self):
        # Load keys directly to ensure independent operation from the Orchestrator if needed
        self.grok_key = os.environ.get("XAI_API_KEY", "")
        self.anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
        self.openai_key = os.environ.get("OPENAI_API_KEY", "")
        
        # Local model for final judgment
        self.local_judge_model = "gemma:2b"

    async def debate_and_resolve(self, objective: str) -> Dict[str, Any]:
        """
        Takes an objective, pushes it through a 3-agent peer review process,
        and returns the final consensus code safe for execution.
        """
        logger.info(f"Initiating Blackboard Debate for Objective: {objective[:50]}...")
        
        # --- AGENT 1: The Architect (Grok/OpenAI) ---
        logger.info("Step 1: Architect generating initial baseline...")
        architect_prompt = "You are the Architect. Generate the complete, functional python script for the following objective. Output ONLY raw python code, no markdown wrappers."
        baseline_code = await LLMGateway.ask_agent(
            provider="grok", 
            api_key=self.grok_key, 
            model="grok-beta", 
            system_prompt=architect_prompt, 
            user_prompt=f"OBJECTIVE: {objective}"
        )
        
        # Clean up markdown if the LLM ignored instructions
        if "```python" in baseline_code:
            baseline_code = baseline_code.split("```python")[1].split("```")[0].strip()
        
        # --- AGENT 2: The Red Teamer (Claude) ---
        logger.info("Step 2: Red Teamer aggressively reviewing the baseline...")
        red_team_prompt = """You are an aggressive Security and Logic Auditor (Red Team). 
        Critique the provided Python code. Identify any syntax errors, infinite loops, security flaws, or edge cases. 
        If it is perfect, respond exactly with 'PASSED'.
        If it has flaws, describe the flaws and provide the corrected code."""
        
        critique = await LLMGateway.ask_agent(
            provider="anthropic",
            api_key=self.anthropic_key,
            model="claude-3-haiku-20240307",
            system_prompt=red_team_prompt,
            user_prompt=f"OBJECTIVE: {objective}\n\nBASELINE CODE:\n```python\n{baseline_code}\n```"
        )
        
        if "PASSED" in critique.strip() and len(critique.strip()) < 10:
            logger.info("Red Teamer approved Architect's code without changes.")
            return {"status": "success", "code": baseline_code, "debate_log": "Approved instantly."}
            
        # --- AGENT 3: The Judge (Ollama - Local) ---
        logger.info("Step 3: Discrepancy detected. Local Judge synthesizing final consensus...")
        judge_prompt = """You are the Supreme Judge. You have the original code and a critique. 
        Synthesize the final, flawless python script. 
        Output ONLY the raw python code. No explanations, no markdown wrappers."""
        
        consensus_code = await LLMGateway.ask_agent(
            provider="ollama",
            api_key="local",
            model=self.local_judge_model,
            system_prompt=judge_prompt,
            user_prompt=f"ORIGINAL CODE:\n{baseline_code}\n\nCRITIQUE:\n{critique}"
        )
        
        if "```python" in consensus_code:
            consensus_code = consensus_code.split("```python")[1].split("```")[0].strip()
            
        debate_log = f"**Critique Summary:**\n{critique}"
        logger.info("Consensus reached safely.")
        
        return {
            "status": "success",
            "code": consensus_code.strip(),
            "debate_log": debate_log
        }
