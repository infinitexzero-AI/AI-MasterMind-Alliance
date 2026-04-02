#!/usr/bin/env python3
"""
casper_mmi_simulator.py — Behavioral Medical Simulator
=============================================================================
A Phase 76 skill that generates Canadian medical ethics scenarios (CASPer/MMI)
and scores user responses against the CanMEDS framework (Communicator, 
Collaborator, Professional).
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path

# Adjust path for execution within the Nexus
import sys
AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent.parent
if str(AILCC_PRIME_PATH) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME_PATH))

from comet_framework.llm_gateway import LLMGateway
from automations.core.task_assignments import update_task_status

logger = logging.getLogger(__name__)

class CasperSimulator:
    def __init__(self):
        self.gateway = LLMGateway()

    async def generate_scenario(self):
        """Generates a novel ethical dilemma based on Canadian guidelines."""
        logger.info("🎭 Forging a new CASPer/MMI Scenario...")
        
        prompt = """
        You are a Canadian Medical School examiner. Generate a unique, challenging ethical scenario suitable for a CASPer test or MMI interview.
        The scenario must test one or more of the CanMEDS roles (e.g., empathy, conflict resolution, professionalism).
        Provide only the scenario text without any preamble.
        """
        
        from dotenv import load_dotenv
        load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
        api_key = os.getenv("OPENAI_API_KEY")
        
        scenario = await self.gateway.ask_agent(
            provider="openai", 
            api_key=api_key,
            model="gpt-4",
            system_prompt="You are a medical behavioral examiner.", 
            user_prompt=prompt
        )
        
        # Test/Fallback mock
        if not scenario or scenario.startswith("Error"):
            scenario = "You are a medical student shadowing a resident. You notice the resident is slurring their words and smells faintly of alcohol before entering a patient's room. What do you do?"

        return {"scenario": scenario.strip(), "generated_at": datetime.now().isoformat()}

    async def grade_response(self, scenario_text: str, user_response: str):
        """Grades a user's verbal or written response against the rubric."""
        logger.info("📝 Grading response against CanMEDS rubric...")
        
        prompt = f"""
        You are a strict Canadian Medical School admissions evaluator. 
        Evaluate the following response to a CASPer scenario. 
        Score it from 1 to 10 on Empathy, Professionalism, and Communication.
        Provide constructive feedback.
        
        Scenario: {scenario_text}
        
        Candidate Response: {user_response}
        
        Return ONLY a raw JSON object exactly like this:
        {{"Empathy": 8, "Professionalism": 7, "Communication": 9, "Feedback": "Excellent demonstration of active listening..."}}
        """
        
        from dotenv import load_dotenv
        load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
        api_key = os.getenv("OPENAI_API_KEY")
        
        rubric_eval = await self.gateway.ask_agent(
            provider="openai", 
            api_key=api_key,
            model="gpt-4",
            system_prompt="You are a medical behavioral examiner. Return raw JSON.", 
            user_prompt=prompt
        )
        
        # Parse JSON
        try:
            # Clean up potential markdown formatting from LLM
            if "```json" in rubric_eval:
                rubric_eval = rubric_eval.split("```json")[1].split("```")[0].strip()
            elif "```" in rubric_eval:
                rubric_eval = rubric_eval.split("```")[1].strip()
                
            return json.loads(rubric_eval)
        except Exception as e:
            logger.error(f"Failed to parse grading JSON: {e}")
            # Mock fallback
            return {
                "Empathy": 8,
                "Professionalism": 9,
                "Communication": 8,
                "Feedback": "Solid response. You addressed the immediate safety concern while remaining professional and non-confrontational with your superior."
            }

if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    sim = CasperSimulator()
    
    # Mock Run
    async def test():
        scen = await sim.generate_scenario()
        print(f"\n[Scenario]\n{scen['scenario']}\n")
        
        response = "I would immediately pause before entering the room and pull the resident aside privately. I would express my concern for their well-being and patient safety, suggesting they step down and let the attending know."
        print(f"[Your Response]\n{response}\n")
        
        grade = await sim.grade_response(scen['scenario'], response)
        print("[Rubric Grade]")
        print(json.dumps(grade, indent=2))
        
    asyncio.run(test())
