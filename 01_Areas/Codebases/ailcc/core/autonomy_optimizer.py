import asyncio
import json
import os
import logging
from datetime import datetime
import redis.asyncio as redis
import traceback

# AILCC Autonomy Optimizer (Ω)
# Monitors Synapse broadcasts and optimizes swarm orchestration dynamically.

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
REGISTRY_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'registries', 'agents_registry.json'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AutonomyOptimizer")

class AutonomyOptimizer:
    def __init__(self):
        self.redis = None
        self.registry_path = REGISTRY_PATH
        self.stats = {
            "synapses_processed": 0,
            "optimizations_proposed": 0,
            "prompts_rewritten": 0,
            "last_optimization": None
        }

    async def connect(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        logger.info(f"Connected to Redis at {REDIS_URL}")

    async def monitor_synapses(self):
        """
        Listen for NEURAL_SYNAPSE events and analyze agent health.
        """
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("NEURAL_SYNAPSE")
        
        logger.info("Optimizer active. Monitoring Neural Synapse stream...")
        
        async for message in pubsub.listen():
            if message['type'] == 'message':
                synapse = json.loads(message['data'])
                self.stats["synapses_processed"] += 1
                await self.analyze_synapse(synapse)

    async def analyze_synapse(self, synapse):
        """
        Analyze incoming intent for bottlenecks or success patterns.
        """
        agent = synapse.get("agent")
        intent = synapse.get("intent")
        confidence = synapse.get("confidence", 0)
        
        if confidence < 0.3:
            logger.warning(f"Low confidence detected for Agent {agent} on intent '{intent}'. Initiating meta-learning loop...")
            await self.propose_optimization(agent, "LOW_CONFIDENCE", intent)
        elif intent.startswith("ERROR_") or synapse.get("type") == "SYSTEM_ERROR" or synapse.get("severity") == "CRITICAL":
            logger.critical(f"Task Failure / Error detected for '{intent}'. Initiating Pivoting Strategy...")
            await self.auto_pivot_strategy(agent, intent)

    async def auto_pivot_strategy(self, agent_id, failed_intent):
        """
        Auto-generate a pivoting strategy and feed it back to the Singularity Engine.
        """
        logger.info(f"Auto-pivoting strategy for {agent_id} after failure on '{failed_intent}'")
        
        pivot_proposal = {
            "agent": "OPTIMIZER",
            "intent": "PIVOT_STRATEGY",
            "confidence": 0.99,
            "domain": "SYSTEM",
            "details": {
                "target": agent_id,
                "failed_intent": failed_intent,
                "action": "MACRO_ROADMAP_PIVOT_REQUESTED"
            },
            "timestamp": datetime.now().isoformat()
        }
        await self.redis.publish("NEURAL_SYNAPSE", json.dumps(pivot_proposal))
        self.stats["optimizations_proposed"] += 1

    async def propose_optimization(self, agent_id, reason, original_intent):
        """
        Propose a change to the agent registry (e.g., adding a fallback or adjusting triggers).
        In Phase 20, this involves drafting an improved system prompt.
        """
        logger.info(f"Drafting optimized instructions for {agent_id} due to {reason}")
        
        # Meta-Learning synthesis (simulated AI call for local autonomy)
        # In a full implementation, this would call the /api/system/synapse endpoint or an LLM.
        improved_directive = f"Improved clarity on intent: '{original_intent}'. Ensure strict adherence to expected JSON output and utilize MCP tools proactively."
        
        proposal = {
            "agent": "OPTIMIZER",
            "intent": f"OPTIMIZE_{agent_id}",
            "confidence": 0.95,
            "domain": "SYSTEM",
            "details": {
                "target": agent_id,
                "reason": reason,
                "action": "PROMPT_REWRITE_PROPOSED",
                "draft_prompt": improved_directive
            },
            "timestamp": datetime.now().isoformat()
        }
        
        await self.redis.publish("NEURAL_SYNAPSE", json.dumps(proposal))
        self.stats["optimizations_proposed"] += 1
        self.stats["last_optimization"] = datetime.now().isoformat()

    async def run(self):
        await self.connect()
        await self.monitor_synapses()

if __name__ == "__main__":
    optimizer = AutonomyOptimizer()
    try:
        asyncio.run(optimizer.run())
    except KeyboardInterrupt:
        logger.info("Optimizer terminated.")
