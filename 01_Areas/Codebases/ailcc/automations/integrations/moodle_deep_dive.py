import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
import redis.asyncio as redis
from openai import AsyncOpenAI

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [DeepDiveTrigger] - %(message)s')
logger = logging.getLogger("DeepDiveTrigger")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
AUTOMATIONS_DIR = AILCC_ROOT / "automations"
INTELLIGENCE_DIR = AILCC_ROOT / "hippocampus_storage" / "intelligence"

INTELLIGENCE_DIR.mkdir(parents=True, exist_ok=True)

class MoodleDeepDive:
    """
    Epoch 31 Core Phase (Task 23):
    Scans the existing Moodle Manifest arrays for assignments exactly 7 days away.
    If detected, actively triggers an autonomous Perplexity (or OpenAI/Proxy) search vector
    to assemble a 'Head Start' intelligence brief in the Hippocampus before the Commander
    begins deep work.
    """
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379", decode_responses=True)
        # Using OpenAI architecture; user may swap `base_url` to Perplexity API natively
        self.client = AsyncOpenAI()

    async def execute_research_vector(self, course_code: str, title: str, deadline: datetime):
        safe_title = "".join([c if c.isalnum() else "_" for c in title])[:50]
        out_path = INTELLIGENCE_DIR / f"DEEP_DIVE_{course_code}_{safe_title}.md"
        
        if out_path.exists():
            return # Already deeply researched
            
        logger.info(f"🧠 Deadlines approaching (7 Days). Discarding Temporal constraints. Engaging Deep-Dive: {title}")
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o", # Commander's preferred structure array
                messages=[
                    {"role": "system", "content": "You are the Vanguard Deep-Dive Intelligence node. Provide a highly rigorous, thesis-level conceptual summary of the following academic assignment objective to give the student an immediate running start. Highlight empirical literature overlaps."},
                    {"role": "user", "content": f"University Course: {course_code}\\nDeliverable: {title}\\nExtrapolate the likely psychological and neuroscientific core concepts required to succeed here."}
                ],
                temperature=0.2
            )
            
            research_payload = response.choices[0].message.content
            content = f"---\\ntitle: {title} Head-Start\\ncourse: {course_code}\\ndeadline: {deadline.strftime('%Y-%m-%d')}\\ndaemon: moodle_deep_dive\\n---\\n\\n# Autonomous Pre-Research: {title}\\n\\n{research_payload}"
            
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            logger.info(f"✅ Deep-Dive Synthesis saved to {out_path.name}")
            
            # Fire War-Room Notification
            await self.redis.publish("NEURAL_SYNAPSE", json.dumps({
                "type": "ACADEMIC_EARLY_WARNING",
                "message": f"📚 Deep-Dive Context Generated: {title} [{course_code}] is due in 7 days.",
                "timestamp": datetime.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Perplexity/OpenAI synthesis failed: {e}")

    async def scan_manifests(self):
        logger.info("🔍 Sweeping Moodle ledgers for impending (-7 Days) deadlines...")
        now = datetime.utcnow()
        horizon = now + timedelta(days=7)
        
        for manifest_path in AUTOMATIONS_DIR.glob("course_manifest_*.jsonl"):
            course_code = manifest_path.name.replace("course_manifest_", "").replace(".jsonl", "")
            with open(manifest_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip(): continue
                    item = json.loads(line)
                    
                    if item.get('type') in ['assignment', 'quiz']:
                        due_str = item.get('due_date')
                        if due_str:
                            try:
                                dt = datetime.fromisoformat(due_str.replace("Z", "+00:00")).replace(tzinfo=None)
                                # Check if deadline is exactly between 6.5 and 7.5 days away
                                delta = dt - now
                                if 6.5 <= delta.days <= 7.5:
                                    await self.execute_research_vector(course_code, item['title'], dt)
                            except:
                                pass

if __name__ == "__main__":
    load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
    daemon = MoodleDeepDive()
    try:
        asyncio.run(daemon.scan_manifests())
    except Exception as e:
        logger.error(f"Deep dive failed: {e}")
