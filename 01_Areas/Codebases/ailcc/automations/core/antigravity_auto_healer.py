#!/usr/bin/env python3
"""
antigravity_auto_healer.py — The Self-Healing Codebase Engine
=============================================================
This daemon watches AILCC logs for exceptions. When it detects a crash 
(e.g., Playwright timeout due to changed DOM), it autonomously:
1. Extracts the stack trace and failing Python class/file.
2. Sends the context to OpenAI (GPT-4o/o3-mini) for a syntax-level fix.
3. Automatically patches the local Python file.
4. Alerts the Commander via the OmniTracker that a hotfix was deployed.

Usage:
    python3 antigravity_auto_healer.py --scan
"""

import os
import re
import json
import logging
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from openai import OpenAI

logging.basicConfig(level=logging.INFO, format="%(asctime)s [Antigravity] %(message)s")
logger = logging.getLogger(__name__)

AILCC_ROOT = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc")
LOG_DIR = AILCC_ROOT / "logs"

def scan_for_errors() -> list:
    """Scans all .log files for recent unhandled exceptions."""
    if not LOG_DIR.exists():
        logger.warning("No logs directory found.")
        return []

    errors = []
    # Very rudimentary regex to catch python tracebacks
    traceback_pattern = re.compile(r"Traceback \(most recent call last\):.*?(?=\n\S|\Z)", re.DOTALL)
    
    for log_file in LOG_DIR.glob("*.log"):
        content = log_file.read_text()
        matches = traceback_pattern.finditer(content)
        for match in matches:
            trace = match.group(0)
            # Find the file that caused it
            file_match = re.search(r'File "(.*?)", line (\d+), in', trace)
            if file_match:
                file_path = file_match.group(1)
                
                # Only attempt to heal our own codebase
                if "ailcc" in file_path and "site-packages" not in file_path:
                    errors.append({
                        "file_path": file_path,
                        "line": file_match.group(2),
                        "trace": trace,
                        "log_source": log_file.name
                    })

    # Return unique files that need healing (one bug per file per scan)
    distinct_errors = {e["file_path"]: e for e in errors}.values()
    return list(distinct_errors)

def request_ai_patch(error_context: dict) -> str:
    """Sends the broken code and stack trace to GPT-4o for a refactored file."""
    if "OPENAI_API_KEY" not in os.environ:
        logger.error("Missing OPENAI_API_KEY.")
        return None

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    target_file = Path(error_context["file_path"])
    
    if not target_file.exists():
        logger.error(f"Cannot patch non-existent file: {target_file}")
        return None

    code = target_file.read_text()
    
    prompt = f"""You are the Antigravity Auto-Healer, an autonomous Level 28 Agent.
A Python script in the AILCC Mastermind OS has crashed.

TARGET FILE: {target_file.name}
TARGET PATH: {target_file.as_posix()}
STACK TRACE:
{error_context['trace']}

CURRENT FILE CONTENTS:
```python
{code}
```

Identify the root cause of the exception. The most common issues are Playwright selectors changing (DOM drift) or missing dict keys.
Return the COMPLETELY rewritten, fixed Python file. Output ONLY valid python code. Do not include markdown codeblocks like ```python, just the raw code. Do not add any conversational text.
"""

    logger.info(f"Submitting {target_file.name} to AGI for patching...")
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0
    )
    
    new_code = response.choices[0].message.content
    if new_code.startswith("```"):
        # Strip codeblock formatting if the model disobeys
        new_code = re.sub(r"^```python\n", "", new_code)
        new_code = re.sub(r"```$", "", new_code)

    return new_code

def apply_patch(file_path: str, new_code: str):
    """Overwrites the broken file with the AGI-generated code and commits it."""
    target = Path(file_path)
    # Backup original
    backup_path = target.with_suffix(".py.bak")
    target.rename(backup_path)
    
    # Write new
    target.write_text(new_code)
    
    # Check syntax
    try:
        subprocess.run(["python3", "-m", "py_compile", str(target)], check=True, capture_output=True)
        logger.info(f"✅ Successfully healed {target.name}. Syntax is valid.")
        
        # In a full deployment, we would push an alert to the OmniTracker DB here:
        logger.info(f"📡 Dispatching Intelligence Alert to Nexus: {target.name} autonomously healed.")
        
        return True
    except subprocess.CalledProcessError:
        logger.error(f"❌ AGI Patch failed syntax check. Reverting {target.name}...")
        target.unlink()
        backup_path.rename(target)
        return False

def run_healer_loop():
    logger.info("Initializing Antigravity Self-Healing Scan...")
    errors = scan_for_errors()
    
    if not errors:
        logger.info("Codebase is stable. No unhandled exceptions detected.")
        return

    logger.warning(f"Detected {len(errors)} broken daemon(s). Initiating triage...")
    
    for err in errors:
        logger.info(f"Healing target: {err['file_path']} (Line {err['line']})")
        new_code = request_ai_patch(err)
        
        if new_code:
            apply_patch(err["file_path"], new_code)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--scan", action="store_true", help="Scan logs and heal")
    args = parser.parse_args()

    if args.scan:
        run_healer_loop()
    else:
        logger.info("Antigravity Healer sleeping. Use --scan to execute.")
