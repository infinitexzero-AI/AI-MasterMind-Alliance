import os
import asyncio
import logging
import json
from datetime import datetime
from dotenv import load_dotenv
import redis.asyncio as redis
from pathlib import Path

# Add core path to sys path to import internal Zotero modules
import sys
AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(AILCC_PRIME_PATH))

from automations.integrations.zotero_http_client import ZoteroHTTPClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [ZoteroPoller] - %(levelname)s - %(message)s')
logger = logging.getLogger("ZoteroPoller")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class ZoteroPollerDaemon:
    """
    Epoch 30 Sensory Cortex: Zotero Poller
    Continuously executes the Zotero Cloud REST API extraction every 60 minutes,
    downloading and physically ingesting newly saved academic PDFs into the Hippocampus.
    """
    def __init__(self):
        self.redis = None
        self.client = ZoteroHTTPClient()
        self.poll_interval = 3600  # 60 minutes

    async def connect(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        await self.redis.ping()
        logger.info("⚡ Connected to AILCC Redis Pub/Sub.")

    async def broadcast_event(self, message: str):
        payload = {
            "id": f"zotero-sync-{datetime.now().timestamp()}",
            "type": "success",
            "msg": f"📚 {message}",
            "timestamp": datetime.now().strftime("%I:%M:%S %p")
        }
        await self.redis.publish("NEURAL_SYNAPSE", json.dumps({"intent": "TASK_PROGRESS_UPDATE", "type": "SYSTEM_EVENT", "payload": payload}))
        
    async def poll_cycle(self):
        logger.info("🕒 Initiating 60-Minute Zotero Cloud HTTP Extraction...")
        
        try:
            # We run the synchronous ingestion pipeline in an asyncio executor
            # trigger_synthesis = False because Grok 3 isn't optimized for bulk drops yet
            result_str = await asyncio.to_thread(self.client.run_and_ingest, False)
            
            logger.info(result_str)
            if "Deposited" in result_str or "✅ Pipeline complete" in result_str:
                await self.broadcast_event(f"Zotero Academic Array synced: {result_str}")
        except Exception as e:
            logger.error(f"Zotero Polling execution failed: {e}")

    async def run(self):
        await self.connect()
        while True:
            await self.poll_cycle()
            logger.info(f"Zotero Poller sleeping for {self.poll_interval // 60} minutes.")
            await asyncio.sleep(self.poll_interval)

if __name__ == "__main__":
    load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
    daemon = ZoteroPollerDaemon()
    try:
        asyncio.run(daemon.run())
    except KeyboardInterrupt:
        logger.info("Zotero Polling Daemon terminated by Archon.")
