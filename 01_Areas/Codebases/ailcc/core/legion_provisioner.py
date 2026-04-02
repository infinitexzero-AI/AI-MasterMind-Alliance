import os
import json
import time
import logging
from datetime import datetime
import redis
import psutil
import sys

# Ensure import works from central point
sys.path.append("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc")
try:
    from automations.integrations.wealth_executor import verify_infrastructure_budget
except ImportError:
    verify_infrastructure_budget = None

from core.tools.logic_bridge import logic_bridge

# The Legion Provisioner (Phase 24)
# Monitors local host resources and autonomously uses The Forge to craft cloud-init 
# scripts, proposing external Mesh Node provisioning if local resources are tapped.

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
OMNI_QUEUE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/nexus_state/active_tasks.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [LegionProvisioner] %(message)s")
logger = logging.getLogger(__name__)

class LegionProvisioner:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.last_run = 0
        self.check_interval = 300  # Check stats every 5 minutes
        
        # Thresholds
        self.cpu_threshold = 90.0 # 90%
        self.mem_threshold = 95.0 # 95%

    def check_constraints(self) -> bool:
        """Returns True if system is starved of resources."""
        cpu = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory().percent
        
        logger.debug(f"Telemetry -> CPU: {cpu}%, Mem: {mem}%")
        
        if cpu > self.cpu_threshold or mem > self.mem_threshold:
            logger.warning(f"Resource Starvation Detected! CPU: {cpu}%, Mem: {mem}%")
            return True
        return False

    def synthesize_cloud_init(self) -> str:
        """Uses the sandbox to dynamically generate a cloud-init script for a new relay node."""
        logger.info("Using The Forge to synthesize cloud-init script for standard Ubuntu VPS...")
        
        # We simulate the AI generation by using the logic_bridge to run a script that outputs the yaml.
        code = '''
print("""#cloud-config
package_update: true
package_upgrade: true
packages:
  - nodejs
  - npm
  - git

runcmd:
  - git clone https://github.com/example/ailcc-mesh-relay.git /opt/relay
  - cd /opt/relay && npm install
  - pm2 start server.js --name "mesh-node"
""")
'''
        result = logic_bridge("legion_cloud_init_gen", code, action="execute")
        if result.get("status") == "SUCCESS":
            return result.get("output", "").strip()
        else:
            logger.error("Failed to synthesize cloud-init script.")
            return ""

    def propose_expansion(self, cloud_init: str):
        """Propose a new Drop/VPS deployment to the OmniTracker."""
        logger.info("Drafting Legion Expansion Proposal for OmniTracker...")
        try:
            tasks = []
            if os.path.exists(OMNI_QUEUE):
                with open(OMNI_QUEUE, 'r') as f:
                    try:
                        tasks = json.load(f)
                    except json.JSONDecodeError:
                        pass
                
            task_id = f"LEGION-DEPLOY-{int(datetime.now().timestamp())}"
            
            # Execute Financial Tycoon Check
            if verify_infrastructure_budget:
                if not verify_infrastructure_budget(5.0):
                    logger.warning("Expansion aborted: Tycoon infrastructure budget breached.")
                    return
            
            # Formulate the proposal
            proposal = {
                "id": task_id,
                "title": "Legion Expansion: Deploy External Mesh Node",
                "domain": "INFRASTRUCTURE",
                "urgency": "HIGH",
                "status": "pending_approval",
                "action_type": "vps_provision",
                "metadata": {
                    "reason": "Local CPU/Memory starvation thresholds breached.",
                    "provider": "DigitalOcean",
                    "estimated_cost": "$5.00/mo",
                    "cloud_init_snippet": cloud_init[:200] + "..." if len(cloud_init) > 200 else cloud_init
                }
            }
            
            # Prevent spamming the queue
            if not any(t.get("domain") == "INFRASTRUCTURE" and t.get("status") == "pending_approval" for t in tasks):
                tasks.append(proposal)
                
                os.makedirs(os.path.dirname(OMNI_QUEUE), exist_ok=True)
                with open(OMNI_QUEUE, 'w') as f:
                    json.dump(tasks, f, indent=2)
                    
                logger.info("✅ Legion Expansion Proposal injected into OmniTracker.")
                
                synapse = {
                    "agent": "THE_LEGION",
                    "intent": "SWARM_SCALING_PROPOSED",
                    "confidence": 0.99,
                    "domain": "INFRASTRUCTURE",
                    "details": {"action": "VPS_PROVISION", "cost": "$5.00/mo"},
                    "timestamp": datetime.now().isoformat()
                }
                self.redis.publish("NEURAL_SYNAPSE", json.dumps(synapse))
            else:
                logger.info("Expansion proposal already pending constraint resolution.")
                
        except Exception as e:
            logger.error(f"Failed to push expansion proposal: {e}")

    def run(self):
        logger.info("Legion Provisioner active. Monitoring system topology...")
        import sys
        
        # Smoke Test
        if "--simulate-constraint" in sys.argv:
            logger.warning("Simulating local resource constraint...")
            cloud_init = self.synthesize_cloud_init()
            if cloud_init:
                self.propose_expansion(cloud_init)
            return

        while True:
            current_time = time.time()
            if current_time - self.last_run >= self.check_interval:
                if self.check_constraints():
                    cloud_init = self.synthesize_cloud_init()
                    if cloud_init:
                        self.propose_expansion(cloud_init)
                self.last_run = current_time
            time.sleep(30)

if __name__ == "__main__":
    provisioner = LegionProvisioner()
    try:
        provisioner.run()
    except KeyboardInterrupt:
        logger.info("Legion Provisioner terminated.")
