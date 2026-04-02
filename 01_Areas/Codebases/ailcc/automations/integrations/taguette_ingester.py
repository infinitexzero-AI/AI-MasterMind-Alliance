import os
import csv
import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime
import redis.asyncio as redis

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [TaguetteIngest] - %(message)s')
logger = logging.getLogger("TaguetteIngest")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
HIPPOCAMPUS = AILCC_ROOT / "hippocampus_storage"
DROPS_DIR = HIPPOCAMPUS / "taguette_drops"
NOTES_DIR = HIPPOCAMPUS / "scholar_notes"
ARCHIVE_DIR = DROPS_DIR / "archive"

DROPS_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
NOTES_DIR.mkdir(parents=True, exist_ok=True)

class TaguetteIngester:
    """
    Epoch 31 Core Node: Actively watches the `taguette_drops` matrix.
    When a qualitative CSV is detected, it splits the themes into Mastermind Markdown Arrays,
    allowing the `scholar_neo4j_bridge` to natively process qualitative sociology markers
    exactly like empirical Zotero notes.
    """
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379", decode_responses=True)

    async def broadcast(self, message: str):
        payload = {
            "signal_id": f"taguette-{datetime.now().timestamp()}",
            "type": "QUALITATIVE_SYNTHESIS",
            "message": f"📊 {message}",
            "timestamp": datetime.now().isoformat()
        }
        await self.redis.publish("NEURAL_SYNAPSE", json.dumps(payload))

    async def ingest_csv(self, file_path: Path):
        logger.info(f"🔍 Executing Taguette structural array on: {file_path.name}")
        
        # Taguette usually exports: Document, Tag, Content
        tag_matrix = {}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Find the actual headers dynamically just in case Taguette updates
            headers = [h.lower() for h in reader.fieldnames] if reader.fieldnames else []
            doc_key = next((h for h in headers if 'document' in h), 'document')
            tag_key = next((h for h in headers if 'tag' in h), 'tag')
            content_key = next((h for h in headers if 'content' in h or 'highlight' in h), None)

            if not content_key:
                logger.error("⚠️ Invalid CSV schema: Missing 'Content' array.")
                return

            for row in reader:
                # Some CSVs may not lower their keys, so we remap dynamically
                row_mapped = {k.lower(): v for k, v in row.items()}
                t_val = row_mapped.get(tag_key, "Untagged").strip()
                d_val = row_mapped.get(doc_key, "Unknown Doc")
                c_val = row_mapped.get(content_key, "").strip()
                
                if t_val not in tag_matrix:
                    tag_matrix[t_val] = []
                tag_matrix[t_val].append({"document": d_val, "highlight": c_val})

        # Generate the Physical Nodes
        for tag, highlights in tag_matrix.items():
            safe_tag = "".join([c if c.isalnum() else "_" for c in tag]).lower()
            md_path = NOTES_DIR / f"TAGUETTE_{safe_tag}.md"
            
            # If the node exists, we append to it. Otherwise, initialize.
            existing_content = md_path.read_text(encoding='utf-8') if md_path.exists() else ""
            
            if not existing_content:
                header = f"---\\ntitle: Qualitative Tag - {tag}\\ndata_classification: LOCAL_ONLY\\ndaemon: taguette_ingester\\ntags: [\"taguette\", \"{safe_tag}\"]\\n---\\n\\n# Thematic Node: {tag}\\n\\n"
            else:
                header = ""
                
            with open(md_path, 'a', encoding='utf-8') as f:
                f.write(header)
                if not header:
                    f.write(f"\\n---\\n#### Ingested Update: {datetime.now().strftime('%Y-%m-%d')}\\n\\n")
                    
                for h in highlights:
                    f.write(f"**Source Document:** {h['document']}\\n> {h['highlight']}\\n\\n")

        # Archive the source file
        archive_path = ARCHIVE_DIR / f"processed_{datetime.now().strftime('%Y%m%d%H%M')}_{file_path.name}"
        file_path.rename(archive_path)
        
        success_msg = f"Mathematically ingested {len(tag_matrix)} Qualitative Themes into Scholar Graph."
        logger.info(success_msg)
        await self.broadcast(success_msg)

    async def run(self):
        await self.redis.ping()
        logger.info("⚡ Taguette Directory Watcher fully deployed. Polling /taguette_drops...")
        
        while True:
            try:
                for csv_file in DROPS_DIR.glob("*.csv"):
                    await self.ingest_csv(csv_file)
            except Exception as e:
                logger.error(f"Ingestion Sequence Failed: {e}")
            await asyncio.sleep(5)  # Lightweight 5-second polling tick

if __name__ == "__main__":
    daemon = TaguetteIngester()
    asyncio.run(daemon.run())
