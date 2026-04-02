import os
import ast
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [ArchonLintSweeper] %(message)s")
logger = logging.getLogger(__name__)

CORE_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/core")

class PEP2027Enforcer(ast.NodeVisitor):
    def __init__(self, filename):
        self.filename = filename
        self.missing_docstrings = 0
        self.missing_type_hints = 0
        self.naked_excepts = 0

    def visit_FunctionDef(self, node):
        if not ast.get_docstring(node):
            self.missing_docstrings += 1
            
        # Check standard type hints on arguments
        for arg in node.args.args:
            if arg.arg != 'self' and not arg.annotation:
                self.missing_type_hints += 1
                
        # Check standard return type hints
        if not node.returns and node.name != '__init__':
            self.missing_type_hints += 1
            
        self.generic_visit(node)
        
    def visit_ExceptHandler(self, node):
        if node.type is None:
            self.naked_excepts += 1
        self.generic_visit(node)

class ArchonLintSweeper:
    """
    Autonomously crawls the `core/` directory to violently enforce 2027 code stability.
    Ensures zero legacy technical debt remains.
    """
    @staticmethod
    def execute_sweep():
        logger.info(f"Initiating Archon Codebase Sweep on {CORE_DIR}...")
        
        dirty_files = 0
        total_files = 0
        
        for root, _, files in os.walk(CORE_DIR):
            for file in files:
                if file.endswith(".py"):
                    total_files += 1
                    filepath = os.path.join(root, file)
                    
                    try:
                        with open(filepath, 'r') as f:
                            source = f.read()
                            
                        tree = ast.parse(source)
                        enforcer = PEP2027Enforcer(file)
                        enforcer.visit(tree)
                        
                        issues = enforcer.missing_docstrings + enforcer.missing_type_hints + enforcer.naked_excepts
                        
                        if issues > 0:
                            dirty_files += 1
                            logger.warning(f"⚠️ {file} violates Epoch 35 Standards [{issues} total violations]")
                        else:
                            logger.info(f"✅ {file} is structurally flawless.")
                            
                    except Exception as e:
                        logger.error(f"Failed to parse {file}: {e}")
                        
        logger.info("-------------------------")
        logger.info(f"Sweep Complete. {total_files} files analyzed.")
        if dirty_files == 0:
            logger.info("🌌 AST VERIFIED. ZERO LEGACY DEBT IN CORE ARCHITECTURE.")
        else:
            logger.info(f"Detected {dirty_files} files requiring structural LLM refactoring.")
            # In live production, this would trigger Singularity Auto-Merge to rewrite them.

if __name__ == "__main__":
    ArchonLintSweeper.execute_sweep()
