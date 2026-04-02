#!/usr/bin/env python3
# zotero_watcher.py
# Vanguard Swarm — Integration Daemon
# Epoch: 29 | Author: Antigravity (Motor Cortex)
# Classification: LOCAL_ONLY enforced at write
# Dependencies: zotero_http_client.py (caller), hippocampus_storage/

import json
import os
import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
SCHOLAR_NOTES_DIR = HIPPOCAMPUS_DIR / "scholar_notes"
LEDGER_FILE = HIPPOCAMPUS_DIR / "swarm_learning_ledger.json"

def load_ledger() -> dict:
    """Reads existing hippocampus_storage/ deposit log to prevent duplicate ingest."""
    if LEDGER_FILE.exists():
        try:
            with open(LEDGER_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        except Exception:
            pass
    return {"total_notes": 0, "processed_items": [], "last_run": None}

def save_ledger(ledger: dict):
    HIPPOCAMPUS_DIR.mkdir(parents=True, exist_ok=True)
    with open(LEDGER_FILE, 'w', encoding='utf-8') as f:
        json.dump(ledger, f, indent=2)

def run_ingestion(items=None, once=True, classification='LOCAL_ONLY'):
    """
    Called by zotero_http_client.py to process pending Zotero items into Hippocampus storage.
    Stamps classification='LOCAL_ONLY' at write-time.
    """
    logger.info(f"🛡️ Guard: Zotero Ingestion Logic Bound. Data Classification forced to: {classification}")
    
    ledger = load_ledger()
    SCHOLAR_NOTES_DIR.mkdir(parents=True, exist_ok=True)
    
    if not items:
        logger.warning("⚠️ No items passed to Zotero Watcher. If using Cloud API, ensure ZOTERO_API_KEY and ZOTERO_LIBRARY_ID are exported in your environment.")
        return
        
    for item in items:
        # Zotero Cloud API returns nested 'data' object
        data = item.get('data', item)
        item_key = data.get('key')
        
        if item_key in ledger.get('processed_items', []):
            continue
            
        title = data.get('title', 'Unknown_Title')
        authors = ", ".join([creator.get('lastName', '') for creator in data.get('creators', []) if isinstance(creator, dict)])
        abstract = data.get('abstractNote', '')
        url = data.get('url', '')
        
        safe_title = "".join([c if c.isalnum() else "_" for c in title])[:50]
        md_filename = f"{item_key}_{safe_title}.md"
        md_path = SCHOLAR_NOTES_DIR / md_filename
        
        md_content = f"""---
title: "{title}"
authors: "{authors}"
zotero_key: "{item_key}"
data_classification: {classification}
daemon: zotero_watcher
epoch: 29
---

# {title}

**Authors:** {authors}
**URL:** {url}

## Abstract
{abstract}
"""
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
            
        logger.info(f"✅ Deposited: {md_filename} with [{classification}] stamp.")
        if 'processed_items' not in ledger:
            ledger['processed_items'] = []
        ledger['processed_items'].append(item_key)
        ledger['total_notes'] = ledger.get('total_notes', 0) + 1
        
    ledger['last_run'] = datetime.now().isoformat()
    save_ledger(ledger)
    return ledger
