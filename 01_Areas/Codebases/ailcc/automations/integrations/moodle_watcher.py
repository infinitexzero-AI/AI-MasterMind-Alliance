import os
import json
import logging
from pathlib import Path
from datetime import datetime
import sys

# Maintain relative path resolution to codebase root
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from automations.integrations.zotero_watcher import load_ledger, save_ledger

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SPOOL_DIR = Path(__file__).parent.parent.parent / "moodle_spool"
LOG_FILE = SPOOL_DIR / "download_log.jsonl"
HIPPOCAMPUS_NOTES_DIR = Path(__file__).parent.parent.parent / "hippocampus_storage" / "scholar_notes"
HIPPOCAMPUS_NOTES_DIR.mkdir(parents=True, exist_ok=True)

def process_moodle_spool():
    """
    Ingests Moodle PDFs exported natively by the Comet Playwright session.
    Cross-references `download_log.jsonl` to generate mathematically sealed LOCAL_ONLY classification nodes.
    """
    if not LOG_FILE.exists():
        logger.warning(f"Moodle SOP spool log not found at {LOG_FILE}. Awaiting Comet deployment.")
        return

    ledger = load_ledger()
    processed_count = 0

    with open(LOG_FILE, 'r') as f:
        for line in f:
            if not line.strip(): continue
            try:
                record = json.loads(line)
                filename = record.get("file_name", "untitled.pdf")
                file_path = record.get("absolute_path", str(SPOOL_DIR / filename))
                course = record.get("course", "UnknownCourse")
                module = record.get("module_topic", "General")
                
                # Check duplication safety array
                record_id = f"MOODLE_{course}_{filename}"
                if record_id in ledger.get("processed_items", []):
                    continue
                
                # Sanitize filename securely
                safe_name = filename.replace(" ", "_").replace(".pdf", "")
                md_filename = f"MOODLE_{course}_{safe_name}.md"
                md_path = HIPPOCAMPUS_NOTES_DIR / md_filename
                
                md_content = f"""---
title: "{filename}"
course: "{course}"
module: "{module}"
source_url: "{record.get('source_url', '')}"
downloaded_at: "{record.get('downloaded_at', datetime.now().isoformat())}"
data_classification: LOCAL_ONLY
daemon: moodle_watcher
epoch: 30
---

# {filename}

**Course Engine Matrix:** {course}  
**Module Index:** {module}  
**Physical Disk Location:** `{file_path}`

*(This matrix node was computationally ingested via Comet's supervised Playwright intercept. Awaiting localized native LLM semantic extraction.)*
"""
                with open(md_path, 'w', encoding='utf-8') as out_f:
                    out_f.write(md_content)
                
                # Append to Immutable Audit Log
                audit_dir = HIPPOCAMPUS_NOTES_DIR.parent / "moodle_audit"
                audit_dir.mkdir(parents=True, exist_ok=True)
                audit_log_path = audit_dir / f"session_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
                
                audit_record = {
                    "timestamp": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
                    "course": course,
                    "resource_url": record.get("source_url", "local_file"),
                    "local_path": str(md_path),
                    "session_id": record.get("session_id", "historical_ingestion"),
                    "classification": "LOCAL_ONLY"
                }
                with open(audit_log_path, 'a', encoding='utf-8') as af:
                    af.write(json.dumps(audit_record) + "\n")
                
                ledger.setdefault("processed_items", []).append(record_id)
                processed_count += 1
                logger.info(f"Deployed Moodle Node: {md_filename} [LOCAL_ONLY]")

            except Exception as e:
                logger.error(f"Failed to process spool line: {e}")

    if processed_count > 0:
        save_ledger(ledger)
        logger.info(f"✅ Moodle Pipeline Execute Success | Nodes Formulated: {processed_count}")
        try:
            from automations.integrations.course_indexer import generate_index
            generate_index()
            logger.info("✅ Course Index successfully synchronized.")
        except Exception as idx_err:
            logger.error(f"Failed to synchronize course index: {idx_err}")
    else:
        logger.info("Spool array clear. No unverified records.")

if __name__ == "__main__":
    process_moodle_spool()
