#!/usr/bin/env python3
"""
master_supervisor.py — The Unified Nerve Center (Epoch XIV)
=============================================================================
Aggregates independent Python daemons into a single native `asyncio` event loop.
Replaces the old system of running 20+ disparate polling scripts, saving massive 
amounts of CPU cycles and battery on the host Macbook.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Fix python path for relative module imports
AILCC_PRIME = Path(__file__).resolve().parent.parent
if str(AILCC_PRIME) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME))

from automations.integrations.media_context_daemon import MediaMonitor
from automations.integrations.omnitracker_daemon import OmnitrackerDaemon
from core.memory_decay_daemon import MemoryDecayProtocol

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [MasterSupervisor] - %(levelname)s - %(message)s')

async def main():
    logging.info("Initializing Master Supervisor (Epoch XIV Nerve Center)...")
    
    daemons = [
        MediaMonitor(),
        OmnitrackerDaemon(),
        MemoryDecayProtocol()
    ]
    
    # The .run() method inherited from ReactiveDaemon binds everything to Redis natively
    tasks = [asyncio.create_task(d.run()) for d in daemons]
    
    logging.info(f"Successfully aggregated {len(daemons)} reactive daemons into a single core loop.")
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Master Supervisor sequence terminated by Commander.")
