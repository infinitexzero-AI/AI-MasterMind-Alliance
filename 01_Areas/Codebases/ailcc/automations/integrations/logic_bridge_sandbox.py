#!/usr/bin/env python3
"""
logic_bridge_sandbox.py — Sovereign Logic Sandbox (Vanguard Swarm)
==================================================================
Provides a secure environment for agents to write and test utility scripts.
Uses AST (Abstract Syntax Tree) sanitization to block dangerous imports and syscalls.
"""

import os
import sys
import ast
import json
import logging
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [LogicBridge] %(levelname)s: %(message)s"
)
logger = logging.getLogger(__name__)

# --- Config ---
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
SANDBOX_DIR     = HIPPOCAMPUS_DIR / "logic_sandbox"
LOGS_DIR        = SANDBOX_DIR / "logs"

# --- Safety Rules ---
BLOCKED_MODULES = {"os", "subprocess", "shutil", "pake", "requests", "socket", "urllib", "ctypes"}
BLOCKED_FUNCTIONS = {"exec", "eval", "getattr", "setattr", "delattr", "open", "write"}

class SandboxSanitizer(ast.NodeVisitor):
    def __init__(self):
        self.errors = []

    def visit_Import(self, node):
        for alias in node.names:
            if alias.name in BLOCKED_MODULES:
                self.errors.append(f"Blocked import: {alias.name}")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module in BLOCKED_MODULES:
            self.errors.append(f"Blocked import: {node.module}")
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in BLOCKED_FUNCTIONS:
                self.errors.append(f"Blocked function call: {node.func.id}")
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in BLOCKED_FUNCTIONS:
                self.errors.append(f"Blocked attribute call: {node.func.attr}")
        self.generic_visit(node)

def sanitize_code(code: str) -> bool:
    """Parses code into AST and checks against safety rules."""
    try:
        tree = ast.parse(code)
        sanitizer = SandboxSanitizer()
        sanitizer.visit(tree)
        if sanitizer.errors:
            for err in sanitizer.errors:
                logger.error(f"Security Violation: {err}")
            return False
        return True
    except SyntaxError as e:
        logger.error(f"Syntax Error in generated code: {e}")
        return False

def execute_logic(name: str, code: str):
    """Saves and executes code in the sandbox if it passes sanitization."""
    os.makedirs(SANDBOX_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)

    if not sanitize_code(code):
        logger.error(f"Execution of '{name}' ABORTED due to security violations.")
        return {"status": "REJECTED", "reason": "Security Violations"}

    script_path = SANDBOX_DIR / f"{name}.py"
    script_path.write_text(code)
    logger.info(f"💾 Logic stored: {script_path}")

    # Log attempt
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "logic_name": name,
        "action": "EXECUTE_SUBPROCESS"
    }

    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=10 # Max execution time
        )
        
        output = result.stdout + result.stderr
        logger.info(f"🚀 Execution Output:\n{output}")
        
        log_entry["status"] = "SUCCESS" if result.returncode == 0 else "FAILED"
        log_entry["output"] = output
        
    except subprocess.TimeoutExpired:
        logger.error(f"Execution of '{name}' TIMED OUT.")
        log_entry["status"] = "TIMEOUT"
    except Exception as e:
        logger.error(f"Execution error: {e}")
        log_entry["status"] = "ERROR"
        log_entry["error"] = str(e)

    # Save log
    log_file = LOGS_DIR / f"{name}_{int(datetime.now().timestamp())}.json"
    log_file.write_text(json.dumps(log_entry, indent=2))
    
    return log_entry

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sovereign Logic Sandbox")
    parser.add_argument("--name", type=str, help="Name for the logic segment")
    parser.add_argument("--code", type=str, help="Python code to sanitize and run")
    parser.add_argument("--test-run", type=str, help="Test a code string for sanitization")
    args = parser.parse_args()

    if args.test_run:
        result = sanitize_code(args.test_run)
        print(f"Sanitization Result: {'PASSED' if result else 'FAILED'}")
    elif args.name and args.code:
        execute_logic(args.name, args.code)
    else:
        logger.info("Usage: --name <name> --code <code> or --test-run <code>")
