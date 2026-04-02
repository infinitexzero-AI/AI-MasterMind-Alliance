import os
import time
import tarfile
import logging
import asyncio
import argparse
from datetime import datetime, timedelta
from pathlib import Path
import json

from core.daemon_factory import ReactiveDaemon

AILCC_PRIME = Path("/Users/infinite27/AILCC_PRIME")
LOGS_DIR = AILCC_PRIME / "06_System/Logs"
ARCHIVE_DIR = LOGS_DIR / "archives"
HIPPOCAMPUS_DIR = AILCC_PRIME / "01_Areas/Codebases/ailcc/hippocampus_storage"

LOG_MAX_AGE_DAYS = 7
LOG_MAX_SIZE_MB = 100
HIPPOCAMPUS_MAX_AGE_DAYS = 90

class MemoryDecayProtocol(ReactiveDaemon):
    def __init__(self):
        super().__init__("MemoryDecayDaemon")
        os.makedirs(ARCHIVE_DIR, exist_ok=True)
        
    async def setup(self):
        # Allow the Commander or the Dashboard to instantly force a garbage collection via Redis
        self.subscribe("FORCE_GARBAGE_COLLECTION", self.handle_force_gc)
        
        # Deploy standard background cyclic decay
        self.tasks.append(asyncio.create_task(self.perpetual_loop()))

    async def handle_force_gc(self, payload):
        self.logger.warning("Received FORCE_GARBAGE_COLLECTION override. Executing immediate sweep.")
        await self.run_log_pruning_cycle()
        await self.run_hippocampus_decay_cycle()
        
    def _is_stale(self, file_path: Path, max_age_days: int) -> bool:
        mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
        return (datetime.now() - mtime) > timedelta(days=max_age_days)
        
    def _is_bloated(self, file_path: Path, max_size_mb: int) -> bool:
        size_mb = file_path.stat().st_size / (1024 * 1024)
        return size_mb > max_size_mb

    def archive_and_purge(self, file_path: Path):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        archive_name = f"{file_path.stem}_{timestamp}.tar.gz"
        archive_path = ARCHIVE_DIR / archive_name
        
        try:
            with tarfile.open(archive_path, "w:gz") as tar:
                tar.add(file_path, arcname=file_path.name)
            
            if archive_path.exists() and archive_path.stat().st_size > 0:
                os.remove(file_path)
                self.logger.info(f"Successfully deep-archived and purged block: {file_path.name} -> {archive_path.name}")
            else:
                self.logger.error(f"Compression verification failed for {file_path.name}. Aborting deletion.")
        except Exception as e:
            self.logger.error(f"Failed to prune {file_path.name}: {e}")

    async def run_log_pruning_cycle(self):
        self.logger.info("Initiating Log Pruning Cycle...")
        if not LOGS_DIR.exists():
            return
            
        pruned_count = 0
        for file_path in LOGS_DIR.iterdir():
            if file_path.is_file() and file_path.suffix in ['.log', '.jsonl', '.txt']:
                if file_path.name == "the_judge_verdict.jsonl":
                    continue 
                    
                if self._is_stale(file_path, LOG_MAX_AGE_DAYS) or self._is_bloated(file_path, LOG_MAX_SIZE_MB):
                    self.logger.warning(f"Targeting stale/bloated memory block: {file_path.name}")
                    await asyncio.to_thread(self.archive_and_purge, file_path)
                    pruned_count += 1
                    
        self.logger.info(f"Log Pruning Cycle Complete. Reclaimed {pruned_count} memory blocks.")

    async def run_hippocampus_decay_cycle(self):
        self.logger.info("Initiating Hippocampus Decay Cycle...")
        if not HIPPOCAMPUS_DIR.exists():
             return
             
        pruned_count = 0
        for root, _, files in os.walk(HIPPOCAMPUS_DIR):
            for file in files:
                if file.endswith('.json'):
                    file_path = Path(root) / file
                    if self._is_stale(file_path, HIPPOCAMPUS_MAX_AGE_DAYS):
                        self.logger.warning(f"Hippocampus Memory {file_path.name} exceeded cognitive half-life ({HIPPOCAMPUS_MAX_AGE_DAYS} days). Archiving.")
                        await asyncio.to_thread(self.archive_and_purge, file_path)
                        pruned_count += 1
                        
        self.logger.info(f"Hippocampus Decay Cycle Complete. Synaptic pruning finalized on {pruned_count} nodes.")

    async def perpetual_loop(self, interval_hours: float = 24.0):
        while True:
            await self.run_log_pruning_cycle()
            await self.run_hippocampus_decay_cycle()
            self.logger.info(f"Memory Matrix is clean. Standardizing sleep for {interval_hours} hours...")
            await asyncio.sleep(interval_hours * 3600)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run a single pruning pass instead of daemon mode.")
    args = parser.parse_args()
    
    daemon = MemoryDecayProtocol()
    
    if args.once:
        async def run_once():
            await daemon.connect()
            await daemon.run_log_pruning_cycle()
            await daemon.run_hippocampus_decay_cycle()
        asyncio.run(run_once())
    else:
        asyncio.run(daemon.run())
