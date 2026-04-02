import asyncio
import json
import logging
import datetime
from pathlib import Path
from core.daemon_factory import ReactiveDaemon

logger = logging.getLogger("AtomicStrategy")

class AtomicStrategyDaemon(ReactiveDaemon):
    """
    Phase 91: The 'Atomic Strategy' Push Pipeline.
    Daily synthesizer of 1% compounding strategies and philosophical mandates.
    """
    def __init__(self):
        super().__init__(name="AtomicStrategy", role="Philosophical Vanguard")
        self.last_execution = None
        self.base_dir = Path("/Users/infinite27/AILCC_PRIME/01_Areas/1_percent_diary")
        
    async def get_channels(self):
        return []

    async def run(self):
        await self.setup()
        await self.broadcast_status("AtomicStrategy", "ONLINE", "Philosophical Engine active. Monitoring 24-hour cycle.")
        
        while True:
            now = datetime.datetime.now()
            
            # Execute precisely at 05:00 AM (or strictly once per day if missed)
            # For testing logic, we allow execution if it hasn't run today
            today_str = now.strftime("%Y-%m-%d")
            
            if self.last_execution != today_str and now.hour >= 5:
                try:
                    await self.broadcast_status("AtomicStrategy", "IN_PROGRESS", "Synthesizing Daily 1% Briefing...")
                    payload = await self._generate_morning_brief()
                    
                    if payload:
                        r = await self._get_redis()
                        
                        # 1. Push to mobile companion app buffer
                        await r.publish("channel:ios_notifications", json.dumps({
                            "type": "ATOMIC_BRIEF",
                            "title": payload.get("title", ""),
                            "body": payload.get("one_percent_mandate", ""),
                            "timestamp": now.isoformat()
                        }))
                        
                        # 2. Push to Dashboard Visual Cortex
                        await r.publish("channel:dashboard_alerts", json.dumps({
                            "type": "URGENT_DIRECTIVE",
                            "title": payload.get("title", ""),
                            "message": f"{payload.get('tactical_synthesis', '')}\n\n{payload.get('philosophical_anchor', '')}",
                            "timestamp": now.isoformat()
                        }))
                        
                        self.last_execution = today_str
                        await self.broadcast_status("AtomicStrategy", "COMPLETED", "Morning strategy transmitted.")
                
                except Exception as e:
                    logger.error(f"Failed to execute Atomic Strategy: {e}")
            
            # Sleep 1 hour to prevent constant looping, since it only fires once daily
            await asyncio.sleep(3600)
            
    async def _generate_morning_brief(self):
        """Simulates LLM Gateway synthesis pulling from JSON stores"""
        try:
            matrix_path = self.base_dir / "skills_matrix.json"
            cycle_path = self.base_dir / "master_cycle_01.json"
            
            skills = {}
            if matrix_path.exists():
                with open(matrix_path, 'r') as f:
                    skills = json.load(f)
                    
            # In production, this data hits LLMGateway along with atomic_strategy_prompt.json
            # For immediate Phase 91 local execution, we simulate the LLM's absolute return block:
            active_skills = [n['human_dimension']['skill_name'] for n in skills.get('nodes', [])]
            focus_str = ", ".join(active_skills) if active_skills else "General Architecture"
            
            return {
                "title": "DEFINITENESS OF PURPOSE",
                "tactical_synthesis": f"Your compounding vector currently targets {focus_str}. The arithmetic of 1% is absolute. Do not regress.",
                "philosophical_anchor": "Seth Godin writes: 'This is strategy. You lay the track, then you drive the train.' Stop reacting to external friction. You are the architect. Napoleon Hill demands definiteness of purpose. You cannot simultaneously harbor doubt and execute mastery.",
                "one_percent_mandate": f"Execute the specific 1% action mapped to {focus_str} today. Refuse all secondary distractions."
            }
        except Exception as e:
            logger.error(f"Briefing generation error: {e}")
            return None

if __name__ == "__main__":
    daemon = AtomicStrategyDaemon()
    asyncio.run(daemon.run())
