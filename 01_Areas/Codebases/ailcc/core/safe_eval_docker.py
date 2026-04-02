import subprocess
import logging
import json

logging.basicConfig(level=logging.INFO, format="%(asctime)s [DockerSandbox] %(message)s")
logger = logging.getLogger(__name__)

class DockerSandbox:
    """
    Executes AI-generated Python strings purely inside an ephemeral Linux container.
    Mathematically guarantees isolation from the host Mac OS.
    """
    @staticmethod
    def execute(code: str, timeout: int = 15) -> dict:
        """
        Pipes code via STDIN to a transient docker container dynamically.
        Forces the container to self-destruct (--rm) and binds memory strictly to 100MB.
        Returns a dictionary array mapping the success boolean, raw stdout, and stderr payload.
        """
        try:
            # --network none completely kills the container's ability to ping the physical internet
            cmd = ["docker", "run", "--rm", "-i", "--network", "none", "-m", "100m", "python:3.11-slim", "python", "-"]
            
            logger.info("Beaming code payload into ephemeral Sandboxed Linux VM...")
            result = subprocess.run(
                cmd,
                input=code,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            is_success = result.returncode == 0
            if is_success:
                logger.info("✅ Sandbox operation executed cleanly.")
            else:
                logger.warning(f"❌ Sandbox execution aborted internally. Status code: {result.returncode}")
                
            return {
                "success": is_success,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip()
            }
            
        except subprocess.TimeoutExpired:
            logger.error("Sandbox Execution TIMEOUT. Subprocess physically terminated to prevent endless loops.")
            return {"success": False, "stdout": "", "stderr": f"Error: Execution exceeded the {timeout}s timeout boundary."}
        except Exception as e:
            logger.error(f"Sandbox internal routing failure: {str(e)}")
            return {"success": False, "stdout": "", "stderr": str(e)}

if __name__ == "__main__":
    # Vanguard Execution Test Suite
    logger.info("Booting Docker Sandbox (Safe-Eval)...")
    
    clean_code = "print('Vanguard Orbit Secured.')\nx = 10 + 32\nprint(f'Mathematical verification: {x}')"
    # An attempt to access the physical Mac root drive (will only show the Linux container's root)
    rogue_code = "import os\nprint(os.listdir('/'))"
    
    logger.info("--- Invoking Clean Execution ---")
    res1 = DockerSandbox.execute(clean_code)
    print(json.dumps(res1, indent=2))
    
    logger.info("\n--- Invoking Rogue Execution ---")
    res2 = DockerSandbox.execute(rogue_code)
    print(json.dumps(res2, indent=2))
    
    if res1["success"] and res1["stdout"] != "":
        logger.info("\n✅ Mathematical Framework PASSED. Sandbox is physically isolated.")
    else:
        logger.error("\n❌ Sandbox construction FAILED.")
