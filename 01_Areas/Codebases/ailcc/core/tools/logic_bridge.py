import os
import json
import logging
import subprocess
from pathlib import Path
from core.tool_manager import tool_manager

logger = logging.getLogger(__name__)

SANDBOX_SCRIPT = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/automations/integrations/logic_bridge_sandbox.py"

@tool_manager.register_tool("logic_bridge", "Generates, tests, or executes Python code in the Sovereign Logic Sandbox.")
def logic_bridge(name: str, code: str, action: str = "execute"):
    """
    Interfaces with the Sovereign Logic Sandbox to execute or test agent-generated code.
    
    Args:
        name: A unique name for the logic segment (e.g., 'data_cleaner_v1').
        code: The Python code to run. Avoid dangerous imports.
        action: 'execute' to run the code, 'test' to only check for sanitization.
        
    Returns:
        A dictionary containing the status and output of the operation.
    """
    logger.info(f"Logic Bridge: {action.upper()} request for '{name}'")
    
    if not os.path.exists(SANDBOX_SCRIPT):
        return {"status": "ERROR", "message": "Sandbox script not found."}

    cmd = ["python3", SANDBOX_SCRIPT, "--name", name, "--code", code]
    if action == "test":
        cmd = ["python3", SANDBOX_SCRIPT, "--test-run", code]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        # Parse the output if possible, otherwise return raw
        try:
            # The sandbox script prints logs to stderr/stdout and potentially result to stdout
            # If it's a test run, it prints "Sanitization Result: ..."
            if action == "test":
                return {"status": "SUCCESS", "output": result.stdout.strip()}
            
            # For execution, the sandbox writes a JSON log which we could return, 
            # but for the tool call we'll return the captured output.
            return {
                "status": "SUCCESS" if result.returncode == 0 else "FAILED",
                "output": result.stdout + result.stderr
            }
        except Exception as e:
            return {"status": "ERROR", "message": f"Output parsing error: {e}"}

    except subprocess.TimeoutExpired:
        return {"status": "TIMEOUT", "message": "Execution exceeded 15s limit."}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}
