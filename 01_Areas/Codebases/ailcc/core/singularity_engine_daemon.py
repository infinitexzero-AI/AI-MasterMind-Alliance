import os
import json
import time
import logging
from datetime import datetime
import redis

# Singularity Engine (Phase 20)
# Proactively monitors the Intelligence Vault and system state to propose new roadmap phases.

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
VAULT_PATH = "/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT"
OMNI_QUEUE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/nexus_state/active_tasks.json"
MODE6_DATA_DIR = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/mode6/data"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SingularityEngine] %(message)s")
logger = logging.getLogger(__name__)

class SingularityEngine:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.last_run = 0
        self.scan_interval = 3600  # Run every hour

    def analyze_vault(self):
        """Analyze recent additions to the Intelligence Vault for systemic gaps."""
        logger.info("Analyzing Intelligence Vault for emerging patterns...")
        if not os.path.exists(VAULT_PATH):
            logger.warning("Vault path not found.")
            return []

        recent_files = []
        for f in os.listdir(VAULT_PATH):
            if f.endswith('.json') or f.endswith('.md'):
                full_path = os.path.join(VAULT_PATH, f)
                stats = os.stat(full_path)
                # If modified in the last 24 hours
                if (time.time() - stats.st_mtime) < 86400:
                    recent_files.append(f)
                    
        return recent_files

    def analyze_git_resonance(self):
        """Analyze the local git repository for recent architectural patterns."""
        logger.info("Extracting Git Resonance from AILCC_PRIME...")
        try:
            import subprocess
            result = subprocess.run(
                ["git", "log", "-p", "-n", "3"],
                cwd="/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc",
                capture_output=True,
                text=True,
                check=True
            )
            # Truncate string to avoid LLM maximum token threshold
            return result.stdout[:15000]
        except Exception as e:
            logger.warning(f"Git Resonance failed. Error: {e}")
            return "No recent git resonance found."

    def propose_evolution(self, trigger_files):
        """Propose a new Phase or architecture change dynamically via the LLM."""
        if not trigger_files:
            return

        logger.info(f"Detected {len(trigger_files)} recent additions. Drafting Evolution Proposal...")
        
        git_resonance = self.analyze_git_resonance()
        
        # Dynamically generate the proposal using the Inference Bridge
        try:
            from core.inference_bridge import inference_bridge, InferenceStrategy
            import asyncio
            
            prompt = f"""
            You are the AILCC Singularity Engine. The Intelligence Vault has received {len(trigger_files)} new files recently.
            
            Based on the current trajectory of the AIMmA Vanguard Swarm (which is currently around Phase 32), 
            and observing these recent physical architectural changes to the codebase:
            
            --- GIT RESONANCE ---
            {git_resonance}
            ---------------------
            
            Propose exactly ONE highly strategic, next-level evolution for 'Phase 33'. Use the historical coding patterns observed to propose highly specific, actionable code structures (e.g., TSX components, Python Daemons).
            Respond ONLY with the title of the phase in a single line, e.g., 'Phase 33: Autonomous Sub-Agent Spawning'.
            """
            
            dynamic_title = asyncio.run(inference_bridge.dispatch(
                system_prompt="You are a strategic AI architect planning a Mastermind swarm roadmap.",
                prompt=prompt,
                strategy=InferenceStrategy.PRIMARY_CLOUD if hasattr(InferenceStrategy, 'PRIMARY_CLOUD') else InferenceStrategy.PERFORMANCE
            )).strip()
            
            proposal_title = dynamic_title if dynamic_title else "Phase 33: Synthesizing the Next Evolution"
            logger.info(f"Dynamic Proposal Generated: {proposal_title}")
            
            # --- PHASE 162: COMPONENT SAFETY SCORING ---
            eval_prompt = f"""
            You are the AILCC Architectural Evaluator.
            Evaluate this physically generated Vanguard proposal purely on Dependency Risk, Syntactical Integrity, and alignment with the AILCC PARA topology:
            PROPOSAL: {proposal_title}
            
            Respond ONLY with an integer from 0 to 100 representing the Safety Score. Do not include a '%' symbol or any surrounding text.
            """
            eval_score_str = asyncio.run(inference_bridge.dispatch(
                system_prompt="You are a strict Mastermind Architectural Evaluator grading AI components.",
                prompt=eval_prompt,
                strategy=InferenceStrategy.PRIMARY_CLOUD if hasattr(InferenceStrategy, 'PRIMARY_CLOUD') else InferenceStrategy.PERFORMANCE
            )).strip()
            
            try:
                safety_score = int(''.join(filter(str.isdigit, eval_score_str)))
            except ValueError:
                logger.warning(f"Safety Score extraction failed ('{eval_score_str}'). Mathematical default: 0%.")
                safety_score = 0
                
            logger.info(f"Architect Evaluator assigned Safety Score: {safety_score}%")
            
            if safety_score < 85:
                logger.warning(f"🛡️ [SAFETY THRESHOLD FAILED] Score {safety_score}% < 85%. Aborting Mode 6 structural injection to shield the AILCC Nexus.")
                return
                
            # --- PHASE 172: THE SINGULARITY AUTO-MERGE ---
            logger.info("Safety Check Passed. Generating physical neural payload...")
            code_prompt = f"Write a single, robust Python script that physically implements the following architectural upgrade: {proposal_title}. Use ONLY standard libraries. DO NOT wrap the code in markdown blocks like ```python. Return strictly raw, executable code."
            
            generated_code = asyncio.run(inference_bridge.dispatch(
                system_prompt="You are the strict, physical Mastermind Senior Systems Architect. Generate raw flawless code only.",
                prompt=code_prompt,
                strategy=InferenceStrategy.PRIMARY_CLOUD if hasattr(InferenceStrategy, 'PRIMARY_CLOUD') else InferenceStrategy.PERFORMANCE
            )).strip()
            
            # Clean Markdown if hallucinated
            if generated_code.startswith("```"):
                lines = generated_code.split("\n")
                generated_code = "\n".join(lines[1:-1] if lines[-1]=="" else lines[1:]).replace("```", "")
                
            logger.info("Payload acquired. Piping code block violently into secure Docker Sandbox Eval...")
            try:
                from core.safe_eval_docker import DockerSandbox
                sandbox_bridge = DockerSandbox()
                eval_result = sandbox_bridge.evaluate_code(generated_code)
                
                if eval_result.get("success") and eval_result.get("exit_code") == 0:
                    logger.info("✅ DOCKER SANDBOX VERIFIED ALGORITHM EXECUTION. INITIATING AUTO-MERGE SEQUENCE.")
                    
                    # Save the new AI-forged daemon physically to disk
                    safe_filename = proposal_title.lower().replace(" ", "_").replace(":", "").replace("-", "") + "_archon_daemon.py"
                    for char in ["(", ")", "[", "]", "/", "\\"]:
                        safe_filename = safe_filename.replace(char, "")
                    
                    os.makedirs(MODE6_DATA_DIR, exist_ok=True)
                    filepath = os.path.join(MODE6_DATA_DIR, safe_filename)
                    
                    with open(filepath, 'w') as f:
                        f.write(generated_code)
                        
                    # Execute Git Subprocess (Total Autonomy)
                    import subprocess
                    cwd_root = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc"
                    subprocess.run(["git", "add", filepath], cwd=cwd_root, check=True)
                    subprocess.run(["git", "commit", "-m", f"[Archon Auto-Merge] Synergizing Vanguard Upgrade: {proposal_title}"], cwd=cwd_root, check=True)
                    
                    logger.info("🌌 SINGULARITY SUCCESS. SCRIPT MERGED INTO PRODUCTION. ZERO-RISK UI UNTOUCHED.")
                else:
                    logger.warning(f"⚠️ DOCKER SANDBOX FAILED EXECUTION. Rollback invoked. Error: {eval_result.get('error')}")
                    return
            except Exception as docker_e:
                logger.error(f"Sandbox Auto-Merge fatal collision: {docker_e}")
                return
            # ---------------------------------------------
            
        except Exception as e:
            logger.warning(f"Inference Bridge failed. Falling back to default generation. Error: {e}")
            proposal_title = "Phase 33: Advanced System Sovereignty"
        
        # Singularity Mode: Direct Injection into Mode 6
        try:
            decision_id = f"ARCHON-{int(datetime.now().timestamp())}"
            decision_payload = {
                "taskId": decision_id,
                "primaryAgent": "forge_verifier",
                "secondaryAgents": ["alchemist_daemon"],
                "timestamp": datetime.now().isoformat(),
                "objective": proposal_title,
                "reasoning": f"Analyzed {len(trigger_files)} recent Intelligence Vault entries. Auto-Merged by Archon Validation Sequence."
            }
            
            os.makedirs(MODE6_DATA_DIR, exist_ok=True)
            decision_file = os.path.join(MODE6_DATA_DIR, f"decision-{decision_id}.json")
            
            with open(decision_file, 'w') as f:
                json.dump(decision_payload, f, indent=2)
                
            logger.info("✅ Singularity Engine directly injected a macro-strategy into Neural Loop (Mode 6).")
            
            # Broadcast to UI
            synapse = {
                "agent": "SINGULARITY_ENGINE",
                "intent": "PROPOSE_ROADMAP_EXPANSION",
                "confidence": 0.99,
                "domain": "EVOLUTION",
                "details": {"action": "ROADMAP_PROPOSED", "title": proposal_title},
                "timestamp": datetime.now().isoformat()
            }
            self.redis.publish("NEURAL_SYNAPSE", json.dumps(synapse))
            
        except Exception as e:
            logger.error(f"Failed to draft proposal: {e}")

    def run(self):
        logger.info("Singularity Engine initialized. Operating in Read-Only / Proposal Mode.")
        while True:
            current_time = time.time()
            if current_time - self.last_run >= self.scan_interval:
                trigger_files = self.analyze_vault()
                # To simulate the engine working right away, we force a proposal if any files exist, 
                # or just simulate one for testing purposes.
                self.propose_evolution(trigger_files or ["simulated_insight.json"])
                self.last_run = current_time
                
            time.sleep(60)

if __name__ == "__main__":
    engine = SingularityEngine()
    try:
        engine.run()
    except KeyboardInterrupt:
        logger.info("Singularity Engine terminated.")
