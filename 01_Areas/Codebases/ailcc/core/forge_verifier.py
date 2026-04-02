import os
import json
import logging
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Forge Verifier (Phase 22)
# Background daemon that autonomously runs tests on scripts in the logic sandbox.

logging.basicConfig(level=logging.INFO, format="%(asctime)s [ForgeVerifier] %(message)s")
logger = logging.getLogger(__name__)

SANDBOX_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/logic_sandbox")
VERIFICATION_LOGS = SANDBOX_DIR / "verification_results"

class ForgeVerifier:
    def __init__(self):
        os.makedirs(VERIFICATION_LOGS, exist_ok=True)

    def run_tests(self, script_path: Path):
        """Runs the script and captures its health."""
        logger.info(f"Verifying script: {script_path.name}")
        
        start_time = time.time()
        try:
            # For now, we simple execute. In a more advanced version, 
            # we'd scan for and run matching .test.py files or use pytest.
            result = subprocess.run(
                ["python3", str(script_path)],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            duration = time.time() - start_time
            return {
                "success": result.returncode == 0,
                "duration": duration,
                "output": result.stdout + result.stderr,
                "exit_code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Timeout", "duration": 5.0}
        except Exception as e:
            return {"success": False, "error": str(e), "duration": 0}

    def scan(self):
        """Scans the sandbox for new scripts and runs verification."""
        if not SANDBOX_DIR.exists():
            return

        for f in SANDBOX_DIR.glob("*.py"):
            # Check if we already verified this version
            result_file = VERIFICATION_LOGS / f"{f.stem}_verdict.json"
            if result_file.exists():
                # For now, simple existence check. 
                # In prod, we'd check mtime vs result_file mtime.
                if result_file.stat().st_mtime > f.stat().st_mtime:
                    continue

            verdict = self.run_tests(f)
            verdict["verified_at"] = datetime.now().isoformat()
            
            with open(result_file, 'w') as out:
                json.dump(verdict, out, indent=2)
            
            logger.info(f"✅ Verdict for {f.name}: {'PASSED' if verdict['success'] else 'FAILED'}")

    def run(self):
        logger.info("Forge Verifier active. Monitoring logic_sandbox for new synthesis...")
        while True:
            try:
                self.scan()
            except Exception as e:
                logger.error(f"Scanner error: {e}")
            
            time.sleep(30) # Scan every 30 seconds

if __name__ == "__main__":
    verifier = ForgeVerifier()
    verifier.run()
