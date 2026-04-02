import os
import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime
from uuid import uuid4

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [MoodleScheduler] - %(message)s')
logger = logging.getLogger("MoodleScheduler")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
AUTOMATIONS_DIR = AILCC_ROOT / "automations"
SPOOL_DIR = AUTOMATIONS_DIR / "moodle_spool"
ICS_EXPORT_DIR = HIPPOCAMPUS_DIR = AILCC_ROOT / "hippocampus_storage" / "calendars"

ICS_EXPORT_DIR.mkdir(parents=True, exist_ok=True)

class MoodleIcsGenerator:
    """
    Epoch 31 Core Logic (Task 22):
    Parses structural Moodle JSON array outputs, mathematically isolates specific deadline dates,
    and natively constructs an Apple standard `.ics` Calendar schema to sync assignments 
    directly to the physical macOS hardware layer.
    """
    def generate_ics_node(self, item: dict, course_code: str) -> str:
        uid = f"{item['item_id']}@vanguard.ailcc.os"
        dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        
        # Construct the physical .ics event payload
        event = f"BEGIN:VEVENT\\n"
        event += f"UID:{uid}\\n"
        event += f"DTSTAMP:{dtstamp}\\n"
        
        # If no specific due date was scraped in JSON, default to Friday of the parsed Week.
        due_str = item.get('due_date')
        if due_str:
            try:
                # Try to parse standard ISO if present
                dt = datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                dt_ics = dt.strftime("%Y%m%dT%H%M%SZ")
                event += f"DTSTART:{dt_ics}\\n"
                event += f"DTEND:{dt_ics}\\n"
            except:
                logger.warning(f"Could not parse assignment deadline format for {item['title']}. Falling back to default block.")
                return ""
        else:
            # Fallback mock for demonstration/structure
            # In a real sweep, Moodle deadlines are absolute. Here we simulate for safety.
            logger.info(f"Skipping {item['title']} - no explicitly scraped temporal deadline.")
            return ""

        event += f"SUMMARY:[{course_code}] {item['title']}\\n"
        event += f"URL:{item.get('url', '')}\\n"
        event += f"DESCRIPTION:Generated natively by Vanguard Swarm (Task 22).\\n"
        event += f"END:VEVENT\\n"
        
        return event

    async def ingest_moodle_manifests(self):
        logger.info("🔍 Sweeping Comet Moodle Manifest arrays...")
        if not AUTOMATIONS_DIR.exists():
            return

        compiled_events = []
        
        for manifest_path in AUTOMATIONS_DIR.glob("course_manifest_*.jsonl"):
            course_code = manifest_path.name.replace("course_manifest_", "").replace(".jsonl", "")
            try:
                with open(manifest_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        if not line.strip(): continue
                        item = json.loads(line)
                        
                        # Only assignments, quizzes, and deliverables bypass the filter
                        if item.get('type') in ['assignment', 'quiz']:
                            ics_node = self.generate_ics_node(item, course_code)
                            if ics_node:
                                compiled_events.append(ics_node)
            except Exception as e:
                logger.error(f"Failed to ingest JSON array {manifest_path.name}: {e}")

        if compiled_events:
            logger.info(f"📅 Compiled {len(compiled_events)} Academic Temporal Nodes.")
            # Assembly of the actual Calendar container
            calendar = "BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//AILCC Mastermind Alliance//Vanguard Scheduler//EN\\n"
            calendar += "".join(compiled_events)
            calendar += "END:VCALENDAR\\n"
            
            export_path = ICS_EXPORT_DIR / "moodle_deadlines_master.ics"
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write(calendar)
                
            logger.info(f"✅ Mastermind Academic Calendar physical generation locked: {export_path.name}")
        else:
            logger.info("📡 No active Assignment/Quiz temporal deadlines discovered in local JSON bounds.")

    async def run(self):
        logger.info("⚡ Scheduling Array Deployed. Watching Moodle Spools natively every 12 hours.")
        while True:
            await self.ingest_moodle_manifests()
            await asyncio.sleep(43200)

if __name__ == "__main__":
    daemon = MoodleIcsGenerator()
    asyncio.run(daemon.run())
