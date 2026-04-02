#!/usr/bin/env python3
"""
swarm_debater.py — Phase VI: CrewAI Tycoon Debater
==================================================
This script utilizes CrewAI to instantiate a formal multi-agent debate
over high-stakes Tycoon decisions (e.g., East Coast Fresh Coats quotes).

It defines three distinct agents:
1. Scout: Analyzes market pricing and competitor behavior.
2. Architect: Drafts the initial quote based on raw inputs.
3. Judge: Ruthlessly reviews the quote for profitability and flags risks.

The output is deposited into the Hippocampus as a verified quote recommendation.

Usage:
    python3 swarm_debater.py --quote "Full exterior paint job for a 2-story house in Moncton, 2500 sq ft."
"""

import os
import json
import logging
import argparse
from pathlib import Path

# Only import crewai if available, to allow syntax checking
try:
    from crewai import Agent, Task, Crew, Process
except ImportError:
    print("CrewAI not installed. Run: pip install crewai")
    exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SwarmDebater] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
TYCOON_REPORTS  = HIPPOCAMPUS_DIR / "tycoon_reports"
DEBATE_DEPLOY_PATH = TYCOON_REPORTS / "crewai_quote_debate.json"

def create_swarm(quote_details: str):
    # 1. Define the Agents
    scout = Agent(
        role='Market Pricing Analyst',
        goal='Analyze the local market rate for painting jobs in Moncton/New Brunswick.',
        backstory='You are an expert in East Coast labor rates, material costs, and competitor pricing for residential painting.',
        verbose=True,
        allow_delegation=False
    )

    architect = Agent(
        role='Quote Drafter',
        goal='Draft a comprehensive and professional quote based on the Scout\'s market analysis and the raw job details.',
        backstory='You are the primary estimator for East Coast Fresh Coats. You balance competitive pricing with high profitability margins.',
        verbose=True,
        allow_delegation=True
    )

    judge = Agent(
        role='Profitability Judge',
        goal='Ruthlessly review the Architect\'s drafted quote to find profit leaks or underestimations.',
        backstory='You are a cynical, margin-obsessed CFO. You look for ways a job could go wrong and cost the business money.',
        verbose=True,
        allow_delegation=False
    )

    # 2. Define the Tasks
    task_scout = Task(
        description=f'Analyze current market rates for this specific job: {quote_details}. Output the expected low, median, and high price bounds.',
        expected_output='A summary of local market rates and material cost estimates.',
        agent=scout
    )

    task_architect = Task(
        description='Using the Scout\'s market data, draft an official line-item quote for East Coast Fresh Coats targeting a 40% profit margin.',
        expected_output='A detailed painting quote including labor, materials, and total cost.',
        agent=architect
    )

    task_judge = Task(
        description='Review the drafted quote from the Architect. Highlight any risks, suggest price increases if it is too low, and approve or reject the final number.',
        expected_output='A final verdict with the approved quote amount and identified risks.',
        agent=judge
    )

    # 3. Instantiate the Crew
    crew = Crew(
        agents=[scout, architect, judge],
        tasks=[task_scout, task_architect, task_judge],
        process=Process.sequential, # Execute tasks sequentially
        verbose=True
    )

    logger.info(f"🚀 Launching CrewAI Swarm Debate for: '{quote_details}'")
    
    # Needs OPENAI_API_KEY or customized LLM setup via crewai tools/llm parameters
    result = crew.kickoff()
    return result

def deposit_result(quote_details: str, result: str):
    os.makedirs(TYCOON_REPORTS, exist_ok=True)
    
    payload = {
        "job_details": quote_details,
        "crewai_debate_result": str(result),
        "status": "APPROVED_BY_SWARM"
    }
    
    DEBATE_DEPLOY_PATH.write_text(json.dumps(payload, indent=2))
    logger.info(f"💾 CrewAI Debate Payload deposited to {DEBATE_DEPLOY_PATH.name}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CrewAI Swarm Debater for Tycoon Quotes")
    parser.add_argument("--quote", type=str, required=True, help="Raw details of the painting quote to debate")
    args = parser.parse_args()

    # Note: Requires an LLM backend to run successfully (e.g., OpenAI API key in env).
    if not os.environ.get("OPENAI_API_KEY") and not os.environ.get("XAI_API_KEY"):
         logger.warning("No standard API key found in environment. CrewAI may fail if a local LLM is not configured.")
    
    try:
        final_result = create_swarm(args.quote)
        deposit_result(args.quote, final_result)
        print("\\n=== CREWAI FINAL VERDICT ===")
        print(final_result)
    except Exception as e:
        logger.error(f"CrewAI execution failed: {e}")
