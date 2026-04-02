import os
import json
import logging
import subprocess
import shutil
import asyncio
from datetime import datetime
from uuid import uuid4

# The AILCC Neural Skill Forge (Phase 57)
# Dynamically writes, tests, and validates novel scripts to acquire new skills.

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("NeuralSkillForge")

FORGE_DIR = "/tmp/forge"

class NeuralSkillForge:
    def __init__(self):
        # We'll use Inference Bridge for code generation
        try:
            import sys
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
            from core.inference_bridge import inference_bridge, InferenceStrategy
            self.bridge = inference_bridge
            self.strategy = InferenceStrategy.PERFORMANCE
        except ImportError as e:
            logger.warning(f"Inference Bridge not found. Forge requires LLM access to generate code. Error: {e}")
            self.bridge = None

        self.language_configs = {
            "python": {
                "extension": ".py",
                "execute_cmd": ["python3"]
            },
            "nodejs": {
                "extension": ".js",
                "execute_cmd": ["node"]
            }
        }

    async def initialize_forge(self):
        # Clean up any old forge workspaces
        if os.path.exists(FORGE_DIR):
            shutil.rmtree(FORGE_DIR, ignore_errors=True)
        os.makedirs(FORGE_DIR, exist_ok=True)
        logger.info(f"Forge workspace initialized at {FORGE_DIR}")

    async def generate_script(self, objective: str, language: str = "python") -> str:
        """Generates a raw script using the LLM based on the objective."""
        if not self.bridge:
            raise RuntimeError("LLM Bridge disconnected. Cannot forge skills.")

        logger.info(f"Forging new {language} skill for: '{objective}'")
        
        system_prompt = (
            f"You are the AILCC Neural Skill Forge. Your job is to output a strictly raw, executable {language} script "
            f"that accomplishes the exact objective requested. Do NOT wrap the code in markdown blocks like ```python. "
            f"Output ONLY the raw code text so it can be directly saved and run."
        )

        # Force synchronous execution of async bridge for simplicity in orchestration loop integration if needed,
        # but since we are async here, we just await it.
        try:
            raw_code = await self.bridge.dispatch(
                system_prompt=system_prompt,
                prompt=objective,
                strategy=self.strategy
            )
            # Cleanup markdown if the LLM ignores instructions
            raw_code = raw_code.strip()
            if raw_code.startswith("```"):
                lines = raw_code.split("\n")
                if len(lines) > 2:
                    raw_code = "\n".join(lines[1:-1])
            return raw_code
        except Exception as e:
            logger.error(f"Failed to generate code via bridging: {e}")
            return ""

    async def test_script(self, code: str, language: str) -> tuple[bool, str, str]:
        """Runs the script in the sandbox and returns success, stdout, and stderr."""
        config = self.language_configs.get(language, self.language_configs["python"])
        
        script_id = f"skill_{uuid4().hex[:8]}"
        script_path = os.path.join(FORGE_DIR, f"{script_id}{config['extension']}")
        
        with open(script_path, "w") as f:
            f.write(code)
            
        logger.info(f"Testing forged skill: {script_path}")
        
        try:
            result = subprocess.run(
                config['execute_cmd'] + [script_path],
                capture_output=True,
                text=True,
                timeout=30 # 30 second max execution for safety
            )
            
            success = result.returncode == 0
            return success, result.stdout, result.stderr
            
        except subprocess.TimeoutExpired:
            return False, "", "TIMEOUT EXPIRED: Script took longer than 30 seconds."
        except Exception as e:
            return False, "", str(e)

    async def iterate_and_forge(self, objective: str, language: str = "python", max_retries: int = 3, stream_cb=None) -> dict:
        """The main outer loop. Tries to create a working script, using errors as feedback if it fails."""
        await self.initialize_forge()
        
        current_objective = objective
        best_code = ""

        if stream_cb: await stream_cb({"type": "log", "message": f"Initializing {language.upper()} Forge Environment..."})

        for attempt in range(max_retries):
            logger.info(f"Forge Iteration {attempt + 1}/{max_retries}")
            if stream_cb: await stream_cb({"type": "log", "message": f"--- Forge Iteration {attempt + 1}/{max_retries} ---"})
            if stream_cb: await stream_cb({"type": "log", "message": f"Synthesizing optimal logic path via LLM inference..."})
            
            code = await self.generate_script(current_objective, language)
            if not code:
                if stream_cb: await stream_cb({"type": "error", "message": "LLM returned empty code."})
                return {"success": False, "error": "LLM returned empty code."}
                
            if stream_cb: await stream_cb({"type": "code", "content": code})
            if stream_cb: await stream_cb({"type": "log", "message": "Executing code in isolated sandbox validation chamber..."})
            
            success, stdout, stderr = await self.test_script(code, language)
            
            if success:
                logger.info("✅ Skill forged and verified successfully.")
                if stream_cb: await stream_cb({"type": "success", "message": "✅ Skill forged and verified successfully.", "stdout": stdout})
                
                # Persist the successful skill to long-term vector memory
                try:
                    from core.memory_ingest_daemon import MemoryIngestDaemon
                    memory = MemoryIngestDaemon()
                    memory.ingest_forged_skill(objective, code, language)
                    if stream_cb: await stream_cb({"type": "log", "message": "Skill injected into permanent vector memory."})
                except Exception as e:
                    logger.error(f"Failed to ingest skill into memory: {e}")
                    if stream_cb: await stream_cb({"type": "error", "message": f"Failed to persist skill: {e}"})
                    
                return {
                    "success": True,
                    "code": code,
                    "language": language,
                    "stdout": stdout
                }
            else:
                logger.warning(f"❌ Skill verification failed. Error:\n{stderr}")
                if stream_cb: await stream_cb({"type": "error", "message": f"Verification failed:\n{stderr}"})
                # Append error to objective for next loop
                current_objective = (
                    f"Original Objective: {objective}\n\n"
                    f"Previous code attempt:\n{code}\n\n"
                    f"This caused the following error:\n{stderr}\n\n"
                    f"Fix the code and return only the raw fixed script."
                )
                best_code = code # Keep track of last attempt
                
        logger.error(f"Failed to forge skill after {max_retries} attempts.")
        if stream_cb: await stream_cb({"type": "error", "message": f"Failed to forge skill after {max_retries} attempts."})
        return {
            "success": False,
            "code": best_code,
            "error": "Max iterations reached without success."
        }
        
if __name__ == "__main__":
    # Isolated stand-alone testing capability
    async def run_test():
        forge = NeuralSkillForge()
        logger.info("Starting isolated Forge Test...")
        result = await forge.iterate_and_forge("Write a python script that prints 'Hello from the Neural Forge!'")
        print(f"Final Result:\n{json.dumps(result, indent=2)}")

    asyncio.run(run_test())
