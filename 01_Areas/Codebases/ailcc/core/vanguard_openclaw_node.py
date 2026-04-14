import os
import asyncio
import json
import logging
from pathlib import Path
from core.openclaw_research_daemon import OpenClawResearchDaemon
from comet_framework.llm_gateway import LLMGateway

# Setup Performance-First logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [VanguardNode] %(message)s")
logger = logging.getLogger(__name__)

class VanguardResearchNode(OpenClawResearchDaemon):
    """
    High-Performance Research Node for the ThinkPad.
    Prioritizes raw throughput and bypasses GUI hooks for CLI efficiency.
    """
    def __init__(self):
        super().__init__()
        self.node_id = os.environ.get("COMPUTERNAME", "Vanguard-ThinkPad")
        logger.info(f"Node Initialized: {self.node_id} (Hardware-Sovereign Mode)")

    async def execute_research(self, task_id, prompt):
        """
        Overridden execution: Force logic to the local Ollama if possible,
        otherwise use the cloud gateway but with high-priority threading.
        """
        logger.info(f"🛠️ Executing High-Throughput Research: {task_id}")
        
        # Performance Mode check
        mode = os.getenv("PERFORMANCE_MODE", "PEAK")
        if mode == "SUPPRESSED":
            logger.warning("Compute Suppression Active. Slowing research loop to protect hardware.")
            await asyncio.sleep(5)

        # Route to Ollama for privacy and raw speed
        try:
            response = await LLMGateway.ask_agent(
                provider="ollama",
                api_key="local",
                model="gemma3:4b",
                system_prompt="You are a High-Performance Research Node in the AILCC Alliance.",
                user_prompt=prompt
            )
            return response
        except Exception as e:
            logger.error(f"Local Research Failed: {e}. Falling back to Cloud Gateway.")
            return await super().execute_research(task_id, prompt)

async def main():
    node = VanguardResearchNode()
    # Continuous loop to check for tasks in the local Hippocampus
    logger.info("Vanguard Node Active. Waiting for Task Pulse...")
    while True:
        # Check task queue (simulation for now until Redis/MQ integration)
        await asyncio.sleep(20)

if __name__ == "__main__":
    asyncio.run(main())
