import os
import time
import json
import logging
import asyncio
import redis.asyncio as redis
from datetime import datetime
from dotenv import load_dotenv

import sys
from pathlib import Path
AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent.parent
if str(AILCC_PRIME_PATH) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME_PATH))

# Try to use existing gateway if available
try:
    from comet_framework.llm_gateway import LLMGateway
except ImportError:
    LLMGateway = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [SelfHealDaemon] - %(levelname)s - %(message)s')
logger = logging.getLogger("SelfHealDaemon")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class SelfHealingDaemon:
    def __init__(self):
        self.redis = None
        self.log_paths = [
            os.path.join(AILCC_PRIME_PATH, "system.log"),
            os.path.join(AILCC_PRIME_PATH, "comet_output.log"),
            os.path.join(AILCC_PRIME_PATH, "dashboard.log")
        ]
        self.known_issues = set()
        self.openai_key = os.getenv("OPENAI_API_KEY")

        # Start tracking log offset
        self.file_cursors = {p: 0 for p in self.log_paths if os.path.exists(p)}

    async def connect(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        await self.redis.ping()
        logger.info("Connected to AILCC Redis Pub/Sub.")

    async def monitor_logs(self):
        """Tails specified log files searching for known error signatures."""
        logger.info(f"Monitoring logs: {self.log_paths}")
        while True:
            for path in list(self.file_cursors.keys()):
                if not os.path.exists(path):
                    continue
                
                try:
                    with open(path, 'r') as f:
                        f.seek(self.file_cursors[path])
                        lines = f.readlines()
                        if lines:
                            self.file_cursors[path] = f.tell()
                            for line in lines:
                                await self.analyze_line(line, path)
                except Exception as e:
                    logger.error(f"Error reading log {path}: {e}")

            await asyncio.sleep(5)  # Poll every 5s

    async def analyze_line(self, line: str, source: str):
        """Heuristics to detect actionable infrastructure warnings."""
        if "Agent not found" in line or "Host telemetry unavailable" in line or "connection refused" in line.lower() or "permission denied" in line.lower():
            # Create a deterministic signature to avoid spam
            sig = line.strip()[:100]
            if sig in self.known_issues:
                return
            
            # Prevent infinite memory leaks over monthly uptime scales
            if len(self.known_issues) > 1000:
                self.known_issues.clear()
                
            self.known_issues.add(sig)
            logger.warning(f"Anomaly Detected! '{sig}' -> Engaging Self-Healing Protocol.")
            await self.generate_patch_ticket(line, source)

    async def generate_patch_ticket(self, error_line: str, source: str):
        """Uses LLMGateway to generate an auto-patch prompt for 'Gordon'."""
        prompt_instruction = f"""
        You are the AILCC Architectural Observer. 
        The system just encountered an error in `{os.path.basename(source)}`:
        ERROR: {error_line}
        
        Write a concise, 2-line prompt that the user can copy and paste to 'Gordon' (their autonomous coding agent) to permanently fix this bug.
        Include instructions on checking docker-compose volume mounts, redis streams, or python daemon restarting if applicable.
        """
        
        try:
            if LLMGateway and self.openai_key:
                logger.info("Drafting patch ticket via LLMGateway...")
                ticket_solution = await LLMGateway.ask_agent(
                    "openai", 
                    self.openai_key, 
                    "gpt-4o-mini", 
                    "You are a DevOps expert.", 
                    prompt_instruction
                )
            else:
                ticket_solution = "Fallback: Please ask Gordon to inspect the Docker socket mounts and daemon configurations related to the recent error trace."

            payload = {
                "signal_id": f"heal-{datetime.now().timestamp()}",
                "source": "SELF_HEALING_DAEMON",
                "type": "ARCHITECTURAL_TICKET",
                "severity": "CRITICAL",
                "message": f"Auto-Patch Suggested: {ticket_solution.strip()}",
                "timestamp": datetime.now().isoformat()
            }
            
            await self.redis.publish("NEURAL_SYNAPSE", json.dumps(payload))
            logger.info("Auto-Patch ticket published to Neural Synapse.")

        except Exception as e:
            logger.error(f"Failed to generate patch ticket: {e}")


if __name__ == "__main__":
    load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
    daemon = SelfHealingDaemon()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(daemon.connect())
    try:
        loop.run_until_complete(daemon.monitor_logs())
    except KeyboardInterrupt:
        logger.info("Self-healing daemon terminated.")
