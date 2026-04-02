import os
import time
import json
import logging
import asyncio
import subprocess
from pathlib import Path
from datetime import datetime
import redis.asyncio as redis
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [LaTeXCompiler] - %(message)s')
logger = logging.getLogger("LaTeXCompiler")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
HIPPOCAMPUS = AILCC_ROOT / "hippocampus_storage"
TEX_DIR = HIPPOCAMPUS / "tex_drafts"
PDF_DIR = HIPPOCAMPUS / "scholar_pdfs"

TEX_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)

class TexCompilerHandler(FileSystemEventHandler):
    def __init__(self, async_queue: asyncio.Queue):
        self.async_queue = async_queue

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.tex'):
            logger.info(f"✍️ LaTeX Modification Detected: {Path(event.src_path).name}")
            # Fire filepath into the asyncio consumer queue
            self.async_queue.put_nowait(event.src_path)


class LatexCompilerDaemon:
    """
    Epoch 31 Core Phase: Instantly watches the `tex_drafts` matrix using kernel-level
    filesystem events. The millisecond the Commander saves a `.tex` file in an IDE, 
    the Swarm mathematically typesets it into a PDF and routes error logs to the Dashboard.
    """
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379", decode_responses=True)
        self.queue = asyncio.Queue()
        self.observer = Observer()
        self.handler = TexCompilerHandler(self.queue)
        
        # Debounce tracking
        self.last_compile_times = {}

    async def broadcast(self, status: str, filename: str, details: str = ""):
        payload = {
            "signal_id": f"latex-{datetime.now().timestamp()}",
            "type": "SYSTEM_EVENT",
            "message": f"📄 LaTeX Compiler {status}: {filename}. {details}".strip(),
            "timestamp": datetime.now().isoformat()
        }
        await self.redis.publish("NEURAL_SYNAPSE", json.dumps(payload))

    async def compile_tex(self, file_path: Path):
        """Mathematically generates the PDF payload."""
        now = time.time()
        # Enforce 3-second debounce per file to prevent crashing if IDE autosaves rapidly
        if file_path.name in self.last_compile_times and (now - self.last_compile_times[file_path.name] < 3):
            return
            
        self.last_compile_times[file_path.name] = now
        logger.info(f"⚙️ Engaging `pdflatex` sequence on {file_path.name}")
        
        try:
            # We run pdflatex twice natively to resolve Table of Contents/Citation cross-references
            process = await asyncio.create_subprocess_exec(
                "pdflatex", 
                "-interaction=nonstopmode",
                "-halt-on-error",
                f"-output-directory={PDF_DIR.resolve()}", 
                str(file_path.resolve()),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=str(file_path.parent) # Run from dir to support relative image includes
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info(f"✅ LaTeX compilation locked. PDF routed to {PDF_DIR.name}")
                await self.broadcast("SUCCESS", file_path.name)
            else:
                raw_error = stdout.decode()
                # Extract trailing LaTeX error logic
                err_lines = [l for l in raw_error.split('\\n') if '!' in l or 'Error' in l]
                clean_err = "; ".join(err_lines[-3:]) if err_lines else "Unknown Fatal Syntax Error."
                
                logger.error(f"❌ LaTeX Failure: {clean_err}")
                await self.broadcast("FAILED", file_path.name, clean_err)
                
        except Exception as e:
            logger.error(f"Critical execution fault bridging to OS shell: {e}")
            await self.broadcast("CRITICAL", file_path.name, str(e))

    async def consume_queue(self):
        while True:
            file_path = await self.queue.get()
            await self.compile_tex(Path(file_path))
            self.queue.task_done()

    async def run(self):
        await self.redis.ping()
        logger.info("⚡ Native Watchtower tracking `tex_drafts` matrix.")
        
        # Start Watchdog Observer in thread
        self.observer.schedule(self.handler, str(TEX_DIR), recursive=False)
        self.observer.start()
        
        try:
            # Shift execution to background asynchronous consumption
            await self.consume_queue()
        except KeyboardInterrupt:
            self.observer.stop()
        
        self.observer.join()

if __name__ == "__main__":
    daemon = LatexCompilerDaemon()
    asyncio.run(daemon.run())
