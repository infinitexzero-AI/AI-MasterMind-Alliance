#!/usr/bin/env python3
"""
proactive_refactor_agent.py — Phase XIV: Autonomous Engineering
===============================================================
An autonomous daemon that scans the AILCC codebase for tech debt
(TODOs, FIXMEs, HACKs, oversized files) and emits them as structured
UnifiedTasks into the Hippocampus.

Output:
    /hippocampus_storage/nexus_state/tech_debt_queue.json

Usage:
    python3 proactive_refactor_agent.py
"""

import os
import re
import json
import uuid
import logging
from datetime import datetime
from pathlib import Path

# Paths
CODEBASE_ROOT = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc")
HIPPOCAMPUS_DIR = CODEBASE_ROOT / "hippocampus_storage"
NEXUS_STATE_DIR = HIPPOCAMPUS_DIR / "nexus_state"
OUTPUT_FILE = NEXUS_STATE_DIR / "tech_debt_queue.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [RefactorAgent] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# Configuration
IGNORE_DIRS = {".git", "node_modules", ".next", "dist", "build", "__pycache__", ".venv"}
IGNORE_EXTS = {".png", ".jpg", ".webp", ".sqlite", ".db", ".ico", ".woff", ".woff2", ".json", ".lock", ".log"}
MAX_LINES_THRESHOLD = 500

# Regex patterns for tech debt markers
DEBT_PATTERN = re.compile(r"(TODO|FIXME|HACK):\s*(.*)", re.IGNORECASE)

def create_task(title: str, description: str, priority: str, confidence: float, source_file: str, line_number: int = None) -> dict:
    """Generate a UnifiedTask formatted object."""
    ref_location = f"{source_file}:{line_number}" if line_number else source_file
    return {
        "id": f"tech_{uuid.uuid4().hex[:8]}",
        "title": title[:100] + ("..." if len(title) > 100 else ""),
        "description": f"{description}\n\n**Location:** `{ref_location}`",
        "track": "TECH",
        "priority": priority,
        "status": "pending",
        "progress": 0,
        "category": "MAINTENANCE",
        "created_at": datetime.now().isoformat(),
        "assigned_to": ["Refactor Swarm"],
        "confidence_score": confidence,
        "metadata": {
            "source": "proactive_refactor_agent",
            "file": str(source_file),
            "line": line_number
        }
    }

def scan_codebase():
    """Walk the directory tree and analyze files."""
    logger.info(f"🔍 Initiating codebase scrub at: {CODEBASE_ROOT}")
    
    tasks = []
    files_scanned = 0
    oversized_count = 0
    marker_count = 0
    
    for root, dirs, files in os.walk(CODEBASE_ROOT):
        # Mutate dirs in place to prevent walking ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.vite')]
        
        for file in files:
            file_path = Path(root) / file
            
            # Skip ignored extensions
            if file_path.suffix.lower() in IGNORE_EXTS or file.startswith('.'):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    files_scanned += 1
                    
                    # 1. Check for oversized files (Complexity Smell)
                    line_count = len(lines)
                    if line_count > MAX_LINES_THRESHOLD:
                        oversized_count += 1
                        rel_path = file_path.relative_to(CODEBASE_ROOT)
                        tasks.append(
                            create_task(
                                title=f"Module Splitting Required: {file_path.name}",
                                description=f"The file exceeds the {MAX_LINES_THRESHOLD} line threshold ({line_count} lines). It likely violates the Single Responsibility Principle and should be modularized.",
                                priority="medium",
                                confidence=0.85,
                                source_file=str(rel_path)
                            )
                        )
                    
                    # 2. Check for Debt Markers (TODO, FIXME, HACK)
                    for i, line in enumerate(lines):
                        match = DEBT_PATTERN.search(line)
                        if match:
                            marker_count += 1
                            marker_type = match.group(1).upper()
                            marker_desc = match.group(2).strip()
                            rel_path = file_path.relative_to(CODEBASE_ROOT)
                            
                            priority = "high" if marker_type == "FIXME" else "medium"
                            
                            tasks.append(
                                create_task(
                                    title=f"Resolve {marker_type} in {file_path.name}",
                                    description=f"Found explicit tech debt marker:\n> {marker_desc}",
                                    priority=priority,
                                    confidence=0.95,
                                    source_file=str(rel_path),
                                    line_number=i + 1
                                )
                            )
            except UnicodeDecodeError:
                # Likely a binary file that slipped through the extension filter
                continue
            except Exception as e:
                logger.warning(f"Failed to scan {file_path.name}: {e}")
                
    logger.info(f"✅ Scrub complete. Scanned {files_scanned} files.")
    logger.info(f"📊 Discovered: {oversized_count} oversized files, {marker_count} debt markers.")
    
    return tasks

def main():
    os.makedirs(NEXUS_STATE_DIR, exist_ok=True)
    
    tasks = scan_codebase()
    
    # Write to Hippocampus (Unified Tasks Queue format)
    payload = {
        "last_scan_time": datetime.now().isoformat(),
        "total_debt_items": len(tasks),
        "tasks": tasks
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=4)
        
    logger.info(f"💾 Emitted {len(tasks)} UnifiedTasks to {OUTPUT_FILE.name}")

if __name__ == "__main__":
    main()
