from apscheduler.schedulers.asyncio import AsyncIOScheduler
from backend.services.sync_service import SyncService
from backend.services.log_service import LogService
import json
import asyncio
from datetime import datetime

class SystemManager:
    def __init__(self, broadcast_fn):
        self.scheduler = AsyncIOScheduler()
        self.sync_service = SyncService(broadcast_fn)
        self.log_service = LogService(broadcast_fn)
        self.broadcast_fn = broadcast_fn

    def start(self):
        # Schedule sync every 15 minutes
        self.scheduler.add_job(self.sync_service.sync_comet, 'interval', minutes=15)
        self.scheduler.add_job(self.sync_service.sync_antigravity, 'interval', minutes=15)
        
        # Schedule log aggregation every 5 minutes
        self.scheduler.add_job(self.log_service.aggregate_logs, 'interval', minutes=5)
        
        # Immediate sync on startup
        self.scheduler.add_job(self.sync_service.sync_comet)
        self.scheduler.add_job(self.sync_service.sync_antigravity)
        self.scheduler.add_job(self.log_service.aggregate_logs)
        
        self.scheduler.start()

    async def broadcast_status(self):
        """Broadcast system status periodically."""
        while True:
            status = {
                "type": "heartbeat",
                "timestamp": datetime.now().isoformat(),
                "system_health": "green",
                "agents": [
                    {"id": "sync_daemon", "status": "active", "task": "Monitoring Sync"},
                    {"id": "log_aggregator", "status": "idle", "task": "None"}
                ]
            }
            await self.broadcast_fn(json.dumps(status))
            await asyncio.sleep(30) # Every 30 seconds

from datetime import datetime
