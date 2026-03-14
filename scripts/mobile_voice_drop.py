#!/usr/bin/env python3
import os
import sys
import json
import logging
from datetime import datetime

# Configuration
VAULT_INBOX = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/Mobile_Inbox"
logging.basicConfig(level=logging.INFO, format="%(asctime)s [VOICE-DROP] %(message)s")

def process_voice_note(text, context=None):
    if not text:
        logging.warning("Received empty voice note. Skipping.")
        return False

    os.makedirs(VAULT_INBOX, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"voice_note_{timestamp}.md"
    filepath = os.path.join(VAULT_INBOX, filename)

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"# 🎙️ Mobile Voice Note: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"## Content\n{text}\n\n")
            if context:
                f.write(f"## Context\n```json\n{json.dumps(context, indent=2)}\n```\n")
        
        logging.info(f"✅ Voice note archived to Vault: {filename}")
        
        # Proactive: Index to RAG if it looks like a directive
        if any(keyword in text.lower() for keyword in ["directive", "task", "strategy", "priority", "important"]):
            index_to_rag(text, timestamp, context)
            
        return True
    except Exception as e:
        logging.error(f"❌ Failed to archive voice note: {e}")
        return False

def index_to_rag(text, timestamp, context):
    try:
        import requests
        HIPPOCAMPUS_URL = "http://localhost:8090"
        requests.post(f"{HIPPOCAMPUS_URL}/memory/upsert", json={
            "id": f"voice_{timestamp}",
            "content": text,
            "metadata": {
                "source": "mobile_voice",
                "context_type": "Tactical",
                "timestamp": timestamp,
                "original_context": context
            }
        })
        logging.info("📍 Voice directive indexed to RAG.")
    except Exception as e:
        logging.error(f"Failed to index voice note: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: mobile_voice_drop.py '<text>' ['<context_json>']")
        sys.exit(1)
        
    text_input = sys.argv[1]
    context_input = json.loads(sys.argv[2]) if len(sys.argv) > 2 else None
    process_voice_note(text_input, context_input)
