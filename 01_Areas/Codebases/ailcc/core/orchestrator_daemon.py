import os
import sys
import json
import logging
import asyncio
import subprocess
from datetime import datetime
import redis

# Orchestrator Daemon (Phase 35)
# Listens to the SWARM_INTENTS Redis channel for SPAWN_AGENT commands.
# Dynamically forks, tracks, and kills Vanguard Python sub-processes.
# Autonomously polls the Century Matrix task queue to execute work.

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
AILCC_PRIME = "/Users/infinite27/AILCC_PRIME"
PYTHON_BIN = "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3"
REGISTRY_FILE = os.path.join(AILCC_PRIME, "tasks/consolidated_task_registry.json")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [Orchestrator] %(message)s")
logger = logging.getLogger(__name__)

class SwarmOrchestrator:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.pubsub = self.redis.pubsub()
        self.active_agents = {} # PID -> Metadata

    def sync_state_to_redis(self):
        """Update the live system state blackboard with active orchestrated agents."""
        logger.info(f"Syncing state. Active Agents: {len(self.active_agents)}")
        self.redis.set("ailcc:system:orchestrator:active_agents", json.dumps(self.active_agents))

    def spawn_agent(self, agent_name, script_path, args=None):
        """Fork a new Python agent process."""
        full_path = os.path.join(AILCC_PRIME, script_path)
        if not os.path.exists(full_path):
            logger.error(f"Cannot spawn {agent_name}: Script not found at {full_path}")
            return None

        cmd = [PYTHON_BIN, full_path]
        if args:
            cmd.extend(args)

        logger.info(f"Spawning Agent: {agent_name} -> {cmd}")
        
        try:
            # Start process detached from the current shell
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                cwd=AILCC_PRIME
            )
            
            pid = process.pid
            self.active_agents[str(pid)] = {
                "name": agent_name,
                "script": script_path,
                "spawned_at": datetime.now().isoformat(),
                "status": "RUNNING"
            }
            
            self.sync_state_to_redis()
            return pid
            
        except Exception as e:
            logger.error(f"Failed to spawn {agent_name}: {e}")
            return None

    def kill_agent(self, pid_str):
        """Terminate a managed agent by PID."""
        if pid_str not in self.active_agents:
            logger.warning(f"Kill command ignored. PID {pid_str} is not managed by Orchestrator.")
            return

        agent_meta = self.active_agents[pid_str]
        logger.info(f"Terminating Agent: {agent_meta['name']} (PID: {pid_str})")
        
        try:
            os.kill(int(pid_str), 15) # SIGTERM
            self.active_agents.pop(pid_str)
            self.sync_state_to_redis()
        except ProcessLookupError:
            logger.warning(f"Process {pid_str} already dead. Cleaning up state.")
            self.active_agents.pop(pid_str)
            self.sync_state_to_redis()
        except Exception as e:
            logger.error(f"Error killing PID {pid_str}: {e}")

    async def monitor_loop(self):
        """Continuously verify managed processes are still alive."""
        while True:
            dead_pids = []
            for pid_str, meta in self.active_agents.items():
                pid = int(pid_str)
                try:
                    # os.kill with signal 0 does not kill the process, just checks if we have permission to send a signal to it (meaning it exists)
                    os.kill(pid, 0)
                except ProcessLookupError:
                    logger.info(f"Agent {meta['name']} (PID: {pid_str}) exited naturally.")
                    dead_pids.append(pid_str)
                except Exception:
                    pass
            
            if dead_pids:
                for p in dead_pids:
                    self.active_agents.pop(p)
                self.sync_state_to_redis()
                
            await asyncio.sleep(5)

    async def century_task_poller(self):
        """Autonomously grab QUEUED tasks from the unified registry and spawn workers."""
        logger.info("Century Task Poller armed. Scanning for QUEUED strategic directives...")
        while True:
            try:
                # Do not overwhelm the system; only spawn if we have < 3 active agents
                if len(self.active_agents) < 3 and os.path.exists(REGISTRY_FILE):
                    with open(REGISTRY_FILE, 'r') as f:
                        data = json.load(f)
                    
                    registry = data.get("registry", [])
                    queued_task = next((t for t in registry if t.get("status") == "QUEUED" and t.get("id", "").startswith("C-")), None)
                    
                    if queued_task:
                        logger.info(f"Target Acquired: [{queued_task['id']}] {queued_task['directive']}")
                        
                        # Transition state
                        queued_task["status"] = "ACTIVE"
                        if "telemetry" not in queued_task:
                            queued_task["telemetry"] = {}
                        queued_task["telemetry"]["lastEvent"] = "Agent processing via Orchestrator Daemon"
                        
                        # Save
                        with open(REGISTRY_FILE, 'w') as f:
                            json.dump(data, f, indent=4)
                            
                        # Broadcast update to the dashboard so UI knows a task started immediately
                        update_payload = {"intent": "FORCE_UI_SYNC"}
                        self.redis.publish("NEURAL_SYNAPSE", json.dumps(update_payload))
                        
                        # Spawn the appropriate worker script
                        script_path = "scripts/vanguard/vanguard_task_worker.py"
                        agent_name = queued_task.get("assignedTo", "VanguardWorker")
                        self.spawn_agent(agent_name, script_path, [queued_task["id"]])
                        
            except Exception as e:
                logger.error(f"Century Poller Error: {e}")
                
            # Poll every 15 seconds to prevent hammering the disk
            await asyncio.sleep(15)

    def handle_intent(self, message):
        """Parse incoming Redis intents for Orchestrator actions."""
        try:
            data = json.loads(message["data"])
            intent = data.get("intent")
            
            if intent == "SPAWN_AGENT":
                agent_name = data.get("agent_name", "UnknownAgent")
                script_path = data.get("script_path")
                args = data.get("args", [])
                
                if script_path:
                    self.spawn_agent(agent_name, script_path, args)
                    
            elif intent == "KILL_AGENT":
                pid_str = str(data.get("pid"))
                if pid_str:
                    self.kill_agent(pid_str)
                    
        except json.JSONDecodeError:
            pass
        except Exception as e:
            logger.error(f"Intent handling error: {e}")

    async def listen_for_intents(self):
        """Subscribe to the main Swarm bus for commands."""
        self.pubsub.subscribe(**{"NEURAL_SYNAPSE": self.handle_intent})
        logger.info("Orchestrator Daemon listening for SPAWN/KILL intents on NEURAL_SYNAPSE...")
        
        while True:
            # Must run pubsub get_message in a non-blocking way for asyncio
            msg = self.pubsub.get_message(ignore_subscribe_messages=True)
            if msg:
                self.handle_intent(msg)
            await asyncio.sleep(0.1)

    async def run(self):
        # Clear old state on boot
        self.redis.delete("ailcc:system:orchestrator:active_agents")
        
        await asyncio.gather(
            self.listen_for_intents(),
            self.monitor_loop(),
            self.century_task_poller()
        )

if __name__ == "__main__":
    orchestrator = SwarmOrchestrator()
    try:
        asyncio.run(orchestrator.run())
    except KeyboardInterrupt:
        logger.info("Orchestrator Daemon terminated.")

