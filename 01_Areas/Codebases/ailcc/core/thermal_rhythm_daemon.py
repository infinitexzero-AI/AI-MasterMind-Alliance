import asyncio
import json
import logging
import os
from pathlib import Path
from core.daemon_factory import ReactiveDaemon

logger = logging.getLogger("ThermalRhythm")

class ThermalRhythmDaemon(ReactiveDaemon):
    """
    Phase 87: Biometric Integration
    Listens for Apple HealthKit or Oura JSON exports and assesses the Commander's physical fatigue.
    """
    def __init__(self):
        super().__init__(name="Thermal_Rhythm", role="Biometric Fatigue Watchdog")
        self.health_export_path = Path("mock_health_export.json")
        self.last_exhaustion_score = 0

    async def get_channels(self):
         return ["channel:health_telemetry"]

    async def calculate_exhaustion_index(self, sleep_hours: float, hrv: float, resting_hr: float) -> int:
        """
        Algorithm calculates a 0-100 score where 100 means Critical Fatigue.
        """
        base_score = 0
        
        if sleep_hours < 5:
            base_score += 60
        elif sleep_hours < 7:
            base_score += 30
            
        if hrv < 30:
            base_score += 30
        elif hrv < 50:
            base_score += 15
            
        if resting_hr > 75:
            base_score += 10
            
        return min(base_score, 100)

    async def run(self):
        """Continuously checks for updated health exports."""
        await self.setup()
        await self.broadcast_status("Thermal_Rhythm", "ACTIVE", "Monitoring physiological telemetry streams...")
        
        while True:
            try:
                if self.health_export_path.exists():
                    with open(self.health_export_path, 'r') as f:
                        data = json.load(f)
                        
                    sleep = data.get("sleep_duration_hours", 8)
                    hrv = data.get("heart_rate_variability_ms", 60)
                    rhr = data.get("resting_heart_rate", 55)
                    
                    score = await self.calculate_exhaustion_index(sleep, hrv, rhr)
                    
                    if score != self.last_exhaustion_score:
                        self.last_exhaustion_score = score
                        
                        await self.broadcast_status(
                            "Thermal_Rhythm", 
                            "ACTIVE", 
                            f"Recalculated Fatigue Limit: {score}/100. Pushing updates."
                        )
                        
                        # Command the Orchestrator via Redis to engage Throttling if necessary
                        payload = {
                            "exhaustion_index": score,
                            "sleep_duration": sleep,
                            "hrv": hrv
                        }
                        
                        r = self.redis
                        if not r:
                             await self.connect()
                             r = self.redis
                        
                        await r.set("ailcc:fatigue:score", score)
                        await r.publish("channel:biometric_sync", json.dumps(payload))
                
                await asyncio.sleep(60) # Poll every 60 seconds
                
            except Exception as e:
                logger.error(f"HealthKit Ingest Failed: {e}")
                await asyncio.sleep(60)

if __name__ == "__main__":
    daemon = ThermalRhythmDaemon()
    asyncio.run(daemon.run())
