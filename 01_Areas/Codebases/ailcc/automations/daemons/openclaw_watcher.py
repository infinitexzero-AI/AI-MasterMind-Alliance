#!/usr/bin/env python3
"""
openclaw_watcher.py — Vanguard Comet Data Ingestion Daemon
================================================================================
Monitors the Intelligence Vault (Comet Exports) for newly saved research nodes.
When a new document (Markdown, JSON, PDF) is detected, it automatically ferries
it into the Hippocampus and triggers a full ChromaDB/LlamaIndex vectorization.

Usage:
    python3 openclaw_watcher.py
"""

import os
import time
import shutil
import logging
import subprocess
from pathlib import Path

# Provide graceful degradation during checking
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError:
    print("Watchdog not installed. Please run: pip install watchdog")
    exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [VaultWatcher] %(message)s")
logger = logging.getLogger(__name__)

AILCC_ROOT = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc")
WATCH_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Hippocampus/Raw")
HIPPOCAMPUS_DIR = AILCC_ROOT / "hippocampus_storage"
RAG_SCRIPT = AILCC_ROOT / "automations" / "intelligence" / "hippocampus_rag.py"

class OpenClawHandler(FileSystemEventHandler):
    def process_file(self, file_path):
        path = Path(file_path)
        if path.suffix.lower() in [".md", ".json", ".txt", ".pdf"]:
            if not path.exists():
                return
            
            # Destination path inside the AILCC Hippocampus
            dest_path = HIPPOCAMPUS_DIR / path.name
            
            # Prevent reacting to temp files or moving a file already moved
            if dest_path.exists():
                return

            logger.info(f"⚡ OpenClaw Research Detected: {path.name}")
            
            # Brief buffer to ensure the file is completely written by the browser/OS
            time.sleep(1.5)
            
            try:
                # Ferry the document to the Hippocampus Core
                shutil.move(str(path), str(dest_path))
                logger.info(f"📂 Transferred to Hippocampus: {dest_path.name}")
                
                # Trigger the LlamaIndex Re-build so the Swarm memory updates instantly
                logger.info("🧠 Syncing Hippocampus Vector Engine...")
                
                # The .venv is located at /Users/infinite27/AILCC_PRIME/.venv
                python_bin = Path("/Users/infinite27/AILCC_PRIME/.venv/bin/python")
                
                if not python_bin.exists():
                    logger.warning(f"Python binary {python_bin} not found. Falling back to system python3.")
                    python_bin = "python3"

                result = subprocess.run(
                    [str(python_bin), str(RAG_SCRIPT), "--build"],
                    capture_output=True,
                    text=True,
                    env=os.environ.copy() # Pass the current environment (including OPENAI_API_KEY)
                )
                
                if result.returncode == 0:
                    logger.info("✅ Global Vanguard Memory Synchronized successfully.")
                else:
                    logger.error(f"❌ RAG Synchronization Error (Code {result.returncode}):")
                    logger.error(f"STDOUT: {result.stdout}")
                    logger.error(f"STDERR: {result.stderr}")
                    
            except Exception as e:
                logger.error(f"Failed to process OpenClaw payload: {e}")

    def on_created(self, event):
        if not event.is_directory:
            self.process_file(event.src_path)

def start_daemon():
    # Ensure directories exist
    os.makedirs(WATCH_DIR, exist_ok=True)
    os.makedirs(HIPPOCAMPUS_DIR, exist_ok=True)
    
    logger.info(f"👁️ Vault Watcher Active. Monitoring {WATCH_DIR} for Comet research...")
    
    event_handler = OpenClawHandler()
    observer = Observer()
    observer.schedule(event_handler, str(WATCH_DIR), recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("Vault Watcher Daemon terminated.")
    
    observer.join()

if __name__ == "__main__":
    start_daemon()
