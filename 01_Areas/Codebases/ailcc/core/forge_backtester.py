import os
import json
import logging
import time
from datetime import datetime
import redis

from core.tools.logic_bridge import logic_bridge

# Forge Backtester (Phase 23)
# Listens for Alchemist strategies, executes backtests in the Forge sandbox, 
# and injects verified proposals into the OmniTracker.

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
OMNI_QUEUE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/nexus_state/active_tasks.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [ForgeBacktester] %(message)s")
logger = logging.getLogger(__name__)

class ForgeBacktester:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)

    def push_to_omnitracker(self, strategy: dict, metrics: dict):
        """Pushes a verified strategy to the OmniTracker for Biometric approval."""
        logger.info(f"Submitting {strategy['strategy_name']} to OmniTracker.")
        
        try:
            tasks = []
            if os.path.exists(OMNI_QUEUE):
                with open(OMNI_QUEUE, 'r') as f:
                    try:
                        tasks = json.load(f)
                    except json.JSONDecodeError:
                        pass
                
            task_id = f"YIELD-PROPOSAL-{int(datetime.now().timestamp())}"
            
            # Formulate the proposal
            proposal = {
                "id": task_id,
                "title": f"Yield Strategy: {strategy['strategy_name']}",
                "domain": "TYCOON",
                "urgency": "HIGH",
                "status": "pending_approval",
                "action_type": "algorithmic_deployment",
                "metadata": {
                    "asset_class": strategy.get("asset_class"),
                    "rationale": strategy.get("rationale"),
                    "rules": strategy.get("rules"),
                    "backtest_metrics": metrics
                }
            }
            
            tasks.append(proposal)
            
            os.makedirs(os.path.dirname(OMNI_QUEUE), exist_ok=True)
            with open(OMNI_QUEUE, 'w') as f:
                json.dump(tasks, f, indent=2)
                
            logger.info("✅ Yield Proposal successfully injected into OmniTracker.")
            
            # Broadcast to UI
            synapse = {
                "agent": "THE_ALCHEMIST",
                "intent": "YIELD_PROPOSAL_GENERATED",
                "confidence": 0.95,
                "domain": "TYCOON",
                "details": {"strategy": strategy['strategy_name'], "metrics": metrics},
                "timestamp": datetime.now().isoformat()
            }
            self.redis.publish("NEURAL_SYNAPSE", json.dumps(synapse))
            
        except Exception as e:
            logger.error(f"Failed to push to OmniTracker: {e}")

    def process_queue(self):
        """Pops items from the backtest queue and executes them."""
        logger.info("Listening for Alchemist strategies...")
        
        while True:
            try:
                # Blocking pop from Redis queue
                item = self.redis.brpop("alchemist:backtest_queue", timeout=0)
                if item:
                    _, payload_str = item
                    payload = json.loads(payload_str)
                    
                    strategy = payload.get("strategy")
                    code = payload.get("code")
                    
                    if not strategy or not code:
                        logger.warning("Invalid payload received.")
                        continue
                        
                    logger.info(f"Backtesting Strategy: {strategy.get('strategy_name')}")
                    
                    # 1. Execute backtest logic in the sandbox
                    name = f"backtest_{int(time.time())}"
                    result = logic_bridge(name, code, action="execute")
                    
                    if result.get("status") == "SUCCESS":
                        # Attempt to parse metrics from output
                        try:
                            # The script might output other things, so we search for a JSON dictionary
                            # or just try to parse the whole output if it's clean.
                            # For robustness, we'll try to extract anything that looks like JSON.
                            out_str = result.get("output", "").strip()
                            
                            # Simple heuristic: find text between { and }
                            start_idx = out_str.find('{')
                            end_idx = out_str.rfind('}')
                            
                            if start_idx != -1 and end_idx != -1:
                                json_str = out_str[start_idx:end_idx+1]
                                metrics = json.loads(json_str)
                                
                                # 2. Filter criteria (e.g., must have >0 Sharpe)
                                if metrics.get("sharpe_ratio", 0) > 1.0 or metrics.get("annualized_return", 0) > 0.1:
                                    logger.info(f"Strategy passed thresholds. Metrics: {metrics}")
                                    self.push_to_omnitracker(strategy, metrics)
                                else:
                                    logger.info(f"Strategy rejected due to poor metrics: {metrics}")
                            else:
                                logger.warning("Could not find JSON metrics in backtest output.")
                                logger.debug(f"Raw Output: {out_str}")
                                
                        except Exception as e:
                            logger.error(f"Failed to parse backtest metrics: {e}")
                    else:
                        logger.error(f"Backtest execution failed: {result.get('message', result.get('output'))}")
                        
            except Exception as e:
                logger.error(f"Queue processing error: {e}")
                time.sleep(5)

    def get_test_payload(self):
         return {
            "strategy": {
                "strategy_name": "Simulated Moving Average Crossover",
                "asset_class": "Equities (SPY)",
                "rationale": "Captures momentum during macro regime shifts.",
                "rules": {"entry": "50 SMA > 200 SMA", "exit": "50 SMA < 200 SMA"}
            },
            "code": "print('{\"sharpe_ratio\": 1.5, \"annualized_return\": 0.12, \"max_drawdown\": 0.15}')"
         }

if __name__ == "__main__":
    backtester = ForgeBacktester()
    import sys
    if "--test-run" in sys.argv:
        logger.info("Running test cycle...")
        payload = backtester.get_test_payload()
        backtester.redis.lpush("alchemist:backtest_queue", json.dumps(payload))
    
    try:
        backtester.process_queue()
    except KeyboardInterrupt:
        logger.info("Forge Backtester terminated.")
