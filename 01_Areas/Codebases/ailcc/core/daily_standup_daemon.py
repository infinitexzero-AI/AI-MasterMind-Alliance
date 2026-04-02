import os
import json
import time
import logging
import asyncio
from datetime import datetime
import redis

# Use absolute paths to access the brain
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
METHODOLOGY_PATH = "/Users/infinite27/.gemini/antigravity/brain/542d6997-c7f5-4473-a5ab-29dba653bafb/AILCC_Swarm_Methodology.md"
TASK_PATH = "/Users/infinite27/.gemini/antigravity/brain/542d6997-c7f5-4473-a5ab-29dba653bafb/task.md"
OMNI_QUEUE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/nexus_state/active_tasks.json"

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [StandupDaemon] %(message)s")
logger = logging.getLogger(__name__)

from core.inference_bridge import inference_bridge, InferenceStrategy

class DailyStandupDaemon:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        # Check every 24 hours (86400 seconds)
        self.run_interval = 86400 
        self.last_run = 0

    async def execute_standup(self):
        logger.info("Initiating Daily Swarm Standup Sequence...")
        
        # Read Methodology
        if not os.path.exists(METHODOLOGY_PATH):
            logger.error(f"Methodology file not found at {METHODOLOGY_PATH}")
            return
            
        with open(METHODOLOGY_PATH, 'r') as f:
            methodology = f.read()
            
        # Read Task md
        if not os.path.exists(TASK_PATH):
            logger.error(f"Task file not found at {TASK_PATH}")
            return
            
        with open(TASK_PATH, 'r') as f:
            tasks_list = f.read()

        system_prompt = (
            "You are the central commander of the AI Mastermind Alliance. Your objective is to read "
            "the current task list and the core 15 Mindset methodology, then synthesize the ABSOLUTE HIGHEST IMPACT "
            "focus for the day for the Swarm to execute. You must output exactly one JSON object with the format: "
            "{ 'title': '... short clear title', 'directive': '... specific directive', 'why': '... explanation aligned with mindsets', 'confidence': 0.95 }"
        )

        prompt = (
            f"Here is the Swarm Methodology:\n\n{methodology}\n\n"
            f"Here is the current Roadmap / Task history:\n\n{tasks_list}\n\n"
            "Based on these, generate the single most critical Daily Focus for the Swarm as a raw JSON object."
        )

        logger.info("Dispatching to Inference Bridge (Priority: PERFORMANCE / Kimi K2.5)...")
        try:
            response = await inference_bridge.dispatch(prompt, strategy=InferenceStrategy.PERFORMANCE, system_prompt=system_prompt)
            logger.info("Received Synthesis from Inference Bridge.")
            
            # Simple extractor for json in backticks if the model wraps it
            if '```json' in response:
                content = response.split('```json')[1].split('```')[0].strip()
            elif '```' in response:
                content = response.split('```')[1].replace('json', '').strip()
            else:
                content = response.strip()
                
            focus_data = json.loads(content)
            
            self._inject_into_omnitracker(focus_data)
            
        except Exception as e:
            logger.error(f"Standup Inference Failed: {e}")

    def _inject_into_omnitracker(self, focus_data):
        logger.info(f"Injecting Daily Focus into OmniTracker: {focus_data.get('title')}")
        
        try:
            tasks = []
            if os.path.exists(OMNI_QUEUE):
                with open(OMNI_QUEUE, 'r') as f:
                    try:
                        tasks = json.load(f)
                    except json.JSONDecodeError:
                        tasks = []
                        
            # Remove any previous PRIORITY_ALPHA setup if any
            tasks = [t for t in tasks if t.get('priority') != 'ALPHA']
            
            new_task = {
                "id": f"STANDUP-{datetime.now().strftime('%Y%m%d')}",
                "source": "STANDUP_DAEMON",
                "assignedTo": "ALL_AGENTS",
                "priority": "ALPHA",
                "category": "ALIGNMENT",
                "track": "TECH",
                "title": focus_data.get('title', 'Daily Operations Focus'),
                "directive": focus_data.get('directive', 'Execute standard operations'),
                "narrative": "The Daily Standup Daemon has mandated this focus.",
                "why": focus_data.get('why', ''),
                "status": "IN_PROGRESS",
                "context": {"methodology": "AILCC_Swarm_Methodology"},
                "telemetry": {"progress": 0, "lastEvent": "Injected by Kimi K2.5 Synthesis"}
            }
            
            tasks.insert(0, new_task)
            
            os.makedirs(os.path.dirname(OMNI_QUEUE), exist_ok=True)
            with open(OMNI_QUEUE, 'w') as f:
                json.dump(tasks, f, indent=2)
                
            logger.info("✅ Daily Standup priority injected.")
            
            # Broadcast over Redis
            synapse = {
                "agent": "STANDUP_DAEMON",
                "intent": "SET_DAILY_FOCUS",
                "confidence": float(focus_data.get('confidence', 0.99)),
                "domain": "ALIGNMENT",
                "details": {"title": focus_data.get('title')},
                "timestamp": datetime.now().isoformat()
            }
            self.redis.publish("NEURAL_SYNAPSE", json.dumps(synapse))
            
        except Exception as e:
            logger.error(f"OmniTracker Injection Failed: {e}")

    async def run(self):
        logger.info("Daily Standup Daemon initialized.")
        while True:
            current_time = time.time()
            if current_time - self.last_run >= self.run_interval:
                await self.execute_standup()
                self.last_run = current_time
            await asyncio.sleep(60)

if __name__ == "__main__":
    import argparse
    import sys
    
    # Pre-parse args inside here to avoid conflict with standard `asyncio.run`
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-standup", action="store_true", help="Force run the standup sequence immediately")
    
    # Only parse known args in case of unexpected ones
    args, unknown = parser.parse_known_args()

    daemon = DailyStandupDaemon()
    if args.force_standup:
        # Trick the interval check into running immediately
        daemon.last_run = time.time() - daemon.run_interval - 1
        
    try:
        asyncio.run(daemon.run())
    except KeyboardInterrupt:
        logger.info("Daily Standup Daemon terminated.")
