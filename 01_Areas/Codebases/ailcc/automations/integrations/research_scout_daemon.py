#!/usr/bin/env python3
"""
research_scout_daemon.py — Autonomous Academic Zotero/Vault Injection
=============================================================================
This daemon sweeps the `current_semester.json` academic matrix. Whenever it 
detects an incomplete assignment tagged as "READING" or containing "Reading" 
in its title, it uses the InferenceBridge to generate a comprehensive 
NLP summary, deposits it into the AILCC_VAULT, and updates the JSON schema.

Usage:
    python3 research_scout_daemon.py --run
"""

import os
import json
import logging
import argparse
import asyncio
import redis
from pathlib import Path
from datetime import datetime

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from core.inference_bridge import inference_bridge, InferenceStrategy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [Research-Scout] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
ACADEMIC_MATRIX_JSON = HIPPOCAMPUS_DIR / "academic_matrix" / "current_semester.json"
AILCC_VAULT_DIR = Path("/Users/infinite27/AILCC_VAULT/Academic_Summaries")

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

async def process_assignments():
    if not ACADEMIC_MATRIX_JSON.exists():
        logger.error("Academic Matrix not found. Cannot proceed.")
        return

    try:
        data = json.loads(ACADEMIC_MATRIX_JSON.read_text())
    except Exception as e:
        logger.error(f"Failed to parse academic matrix: {e}")
        return

    semester = data.get("semester", {})
    courses = semester.get("courses", [])

    os.makedirs(AILCC_VAULT_DIR, exist_ok=True)
    summaries_generated = 0

    for course in courses:
        for assignment in course.get("assignments", []):
            if assignment.get("status") in ["TODO", "IN_PROGRESS"]:
                title = assignment.get("title", "").lower()
                a_type = assignment.get("type", "")
                
                if a_type == "READING" or "reading" in title:
                    # Check if vault link already exists
                    vault_links = assignment.get("vault_links", [])
                    expected_filename = f"{course['id']}_{assignment['id']}_summary.md"
                    expected_path = AILCC_VAULT_DIR / expected_filename
                    relative_vault_path = f"AILCC_VAULT/Academic_Summaries/{expected_filename}"

                    if not expected_path.exists() and relative_vault_path not in vault_links:
                        logger.info(f"📚 Detected un-summarized reading: [{course['id']}] {assignment['title']}")
                        
                        prompt = f"""
                        You are the AILCC Research Scout. Produce a structured, academic summary 
                        for the following college assignment/reading topic. 

                        Course: {course['title']} ({course['id']})
                        Assignment: {assignment['title']}
                        Parameters: Provide an executive summary, key theoretical concepts, and 3 critical questions for further study.
                        """
                        
                        logger.info(f"🧠 Generating context via InferenceBridge (Strategy: PERFORMANCE)...")
                        summary_md = await inference_bridge.dispatch(prompt=prompt, strategy=InferenceStrategy.PERFORMANCE)
                        
                        expected_path.write_text(summary_md)
                        logger.info(f"✅ Vault Deposit Successful: {expected_path}")
                        
                        # Update matrix
                        if "vault_links" not in assignment:
                            assignment["vault_links"] = []
                        assignment["vault_links"].append(relative_vault_path)
                        summaries_generated += 1
                        
                        # Telemetry
                        try:
                            signal = {
                                "id": f"scout_{datetime.now().timestamp()}",
                                "timestamp": datetime.now().isoformat(),
                                "level": "info",
                                "source": "Research-Scout",
                                "type": "KNOWLEDGE_VAULT",
                                "message": f"Auto-Generated summary for {assignment['title']} deposited to Vault.",
                                "metadata": {"course": course['id'], "vault_path": relative_vault_path}
                            }
                            redis_client.publish('neural_synapse', json.dumps(signal))
                        except Exception as e:
                            logger.warning(f"Failed to broadcast NeuralSignal: {e}")

    if summaries_generated > 0:
        data["last_sync"] = datetime.now().isoformat()
        ACADEMIC_MATRIX_JSON.write_text(json.dumps(data, indent=2))
        logger.info(f"🎉 Updated {ACADEMIC_MATRIX_JSON.name} with {summaries_generated} new Vault Links.")
    else:
        logger.info("⚡ No new readings required summarization. Sub-routine complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Research Scout Daemon")
    parser.add_argument("--run", action="store_true", help="Sweep matrix and generate NLP summaries.")
    args = parser.parse_args()

    if args.run:
        asyncio.run(process_assignments())
    else:
        print("Run with --run flag to execute the daemon.")
