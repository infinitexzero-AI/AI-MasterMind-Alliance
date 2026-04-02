import os
import json
import sqlite3
import logging
import asyncio
from pathlib import Path
from datetime import datetime
from openai import AsyncOpenAI
import redis.asyncio as redis
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [GratitudeIngester] - %(message)s')
logger = logging.getLogger("GratitudeIngester")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
HIPPOCAMPUS = AILCC_ROOT / "hippocampus_storage" / "bio_data"
HIPPOCAMPUS.mkdir(parents=True, exist_ok=True)

class GratitudeIngester:
    """
    Epoch 35 (Task 2):
    A Python daemon that sweeps the Commander's Apple Notes application ecosystem (via explicit dump or API).
    It physically extracts strings matching 'Gratitude' or 'Reflection', feeding them to an LLM array.
    The OS then mathematically scores the WEF 2025 'Resilience' and 'Motivation/Self-Awareness' traits 
    based on the linguistic mapping of the qualitative data.
    """
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379", decode_responses=True)
        self.client = AsyncOpenAI()
        self.notes_db_path = Path(os.path.expanduser("~/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite"))

    async def extract_apple_notes(self):
        # Normally Apple Notes requires Full Disk Access or AppleScript to rip.
        # Here we mock the raw output connection for architectural safety.
        logger.info("📡 Simulating iCloud Notes Database interception...")
        
        # Hypothetical physical AppleScript integration:
        # `osascript -e 'tell application \"Notes\" to get body of note \"Gratitude 2026\"'`
        
        # Mocking the physical extraction of today's Gratitude Note
        mock_note = "Today I am grateful for the execution of the Vanguard Swarm. I successfully managed to architect Epoch 34 without burning out. The cold exposure at 6 AM was brutally difficult but focusing my mind helped me overcome the biological resistance. I feel aligned and clear."
        return mock_note

    async def calculate_wef_resilience(self, journal_text: str):
        logger.info("🧠 Formulating WEF 2025 'Resilience (67%)' metric via LLM semantic analysis...")
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are the AILCC Biological Evaluator. Analyze the provided journal entry for emotional stability and dopamine regulation (Jacques et al., 2019). Output ONLY a valid JSON object: { 'resilience': <int 1-100>, 'motivation': <int 1-100>, 'analytical_thinking': <int 1-100>, 'vta_sensitization': <int 1-100 mapping to hedonistic craving/compulsion>, 'pfc_executive_control': <int 1-100 mapping to homeostatic discipline> }. Higher VTA indicates reward-overdrive. Higher PFC indicates discipline."},
                    {"role": "user", "content": f"Journal Log:\\n{journal_text}"}
                ],
                temperature=0.1
            )
            
            payload = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
            wef_metrics = json.loads(payload)
            
            # Persist to disk
            out_file = HIPPOCAMPUS / f"wef_metrics_{datetime.now().strftime('%Y%m%d')}.json"
            with open(out_file, 'w') as f:
                json.dump({
                    "date": datetime.now().isoformat(),
                    "raw_qualitative": journal_text,
                    "metrics": wef_metrics
                }, f, indent=4)
                
            logger.info(f"✅ Emotional Regulation logic parsed. Resilience calculated at {wef_metrics.get('resilience')}/100.")
            
            # Fire War-Room Notification
            await self.redis.publish("NEURAL_SYNAPSE", json.dumps({
                "type": "BIO_TELEMETRY",
                "message": f"🧬 Exec Control (PFC): {wef_metrics.get('pfc_executive_control')}/100. VTA Sensitization: {wef_metrics.get('vta_sensitization')}/100.",
                "timestamp": datetime.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Failed to formulate WEF metrics array: {e}")

    async def run(self):
        logger.info("⚡ Gratitude & Resilience Telemetry Matrix initialized.")
        try:
            note_content = await self.extract_apple_notes()
            if note_content:
                await self.calculate_wef_resilience(note_content)
        except Exception as e:
            logger.error(f"Critical execution error: {e}")

if __name__ == "__main__":
    load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
    daemon = GratitudeIngester()
    asyncio.run(daemon.run())
