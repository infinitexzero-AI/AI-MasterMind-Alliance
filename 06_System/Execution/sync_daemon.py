#!/usr/bin/env python3
"""
Sync Daemon v2.0 - Comet ↔ Antigravity ↔ Knowledge Base
Integrates Perplexity Sync strategies and strict memory policy.
"""

import os
import json
import time
import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Paths
ROOT = "/Users/infinite27/AILCC_PRIME"
KB_DB = f"{ROOT}/06_System/State/knowledge-base.db"
SYNC_STATE_FILE = f"{ROOT}/06_System/State/sync_state.json"
STATUS_FILE = f"{ROOT}/06_System/State/status.json"
LOG_FILE = f"{ROOT}/06_System/Logs/sync_daemon.log"
ANTIGRAVITY_DB = os.path.expanduser("~/.config/antigravity/conversations.db")
# Using the sync code mentioned in the request
COMET_SYNC_CODE = "creek_bone_alley_slim" 

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")

class AntigravityDBWatcher(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path == ANTIGRAVITY_DB:
            log("Antigravity DB change detected. Triggering sync...")
            sync_antigravity()

def update_sync_state(component, status, event_msg=None):
    try:
        if os.path.exists(SYNC_STATE_FILE):
            with open(SYNC_STATE_FILE, "r") as f:
                data = json.load(f)
        else:
            data = {"events": [], "system_health": {}, "agents": {}}
        
        data["system_health"][component] = status
        data["timestamp"] = datetime.now().isoformat()
        
        if event_msg:
            data["events"].append({
                "timestamp": datetime.now().isoformat(),
                "component": component,
                "message": event_msg
            })
            data["events"] = data["events"][-10:]
            
        with open(SYNC_STATE_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log(f"Error updating sync state: {e}")

def update_master_status(status, task):
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "r") as f:
                data = json.load(f)
        else:
            data = {"agents": {}}
            
        data["agents"]["sync_daemon"] = {"status": status, "task": task}
        data["last_updated"] = datetime.now().isoformat()
        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log(f"Error updating master status: {e}")

def ingest_to_kb(items):
    """Normalized ingestion into the local SQLite knowledge base."""
    try:
        conn = sqlite3.connect(KB_DB)
        c = conn.cursor()
        for item in items:
            # id, source, type, content, tags, synced_at, version
            c.execute('''INSERT OR REPLACE INTO knowledge VALUES (?, ?, ?, ?, ?, ?, ?)''', 
                      (item['id'], item['source'], item['type'], item['content'], item['tags'], item['synced_at'], item['version']))
        conn.commit()
        conn.close()
    except Exception as e:
        log(f"KB Ingestion Error: {e}")

def sync_comet():
    """Sync bookmarks/search from Perplexity Comet."""
    log("Starting Comet sync...")
    try:
        # Placeholder for Comet API call
        # Mocking data based on Perplexity strategy
        mock_items = [
            {
                "id": "comet-bk-001",
                "source": "comet",
                "type": "bookmark",
                "content": "Mi'kmaq Fisheries - Netukulimk Research and Water Quality Analysis",
                "tags": "indg-mikmaq-fisheries-2024, mikmaq, vasquez-2021",
                "synced_at": datetime.now().isoformat(),
                "version": 1
            }
        ]
        ingest_to_kb(mock_items)
        update_sync_state("comet_sync", "synced", f"Ingested {len(mock_items)} bookmarks")
        log(f"✓ Comet sync: {len(mock_items)} items")
    except Exception as e:
        log(f"✗ Comet sync failed: {e}")

def sync_antigravity():
    """Sync conversation history from local Antigravity DB."""
    if not os.path.exists(ANTIGRAVITY_DB):
        log(f"⚠ Antigravity DB not found at {ANTIGRAVITY_DB}")
        return
    
    log("Starting Antigravity sync...")
    try:
        conn = sqlite3.connect(ANTIGRAVITY_DB)
        cursor = conn.cursor()
        
        # Simplified query based on expected schema
        # In a real scenario, we'd query for recently updated conversations
        cursor.execute("SELECT id, title, updated_at FROM conversations LIMIT 10")
        rows = cursor.fetchall()
        
        items = []
        for row in rows:
            items.append({
                "id": f"ag-{row[0]}",
                "source": "antigravity",
                "type": "conversation_meta",
                "content": row[1],
                "tags": "system, conversation",
                "synced_at": datetime.now().isoformat(),
                "version": 1
            })
        
        ingest_to_kb(items)
        conn.close()
        update_sync_state("antigravity_sync", "synced", f"Ingested {len(items)} conversations")
        log(f"✓ Antigravity sync: {len(items)} conversations")
    except Exception as e:
        log(f"✗ Antigravity sync failed: {e}")

if __name__ == "__main__":
    log("Sync Daemon (AILCC Pulse) starting...")
    
    # Watcher for real-time Antigravity DB changes
    event_handler = AntigravityDBWatcher()
    observer = Observer()
    if os.path.exists(os.path.dirname(ANTIGRAVITY_DB)):
        observer.schedule(event_handler, os.path.dirname(ANTIGRAVITY_DB), recursive=False)
        observer.start()
        log(f"Watching {os.path.dirname(ANTIGRAVITY_DB)} for changes.")
    else:
        log("⚠ Antigravity config dir not found. Real-time watch disabled.")

    try:
        while True:
            # Full sync every 15 minutes as per strategy
            sync_comet()
            sync_antigravity()
            update_master_status("ACTIVE", "Monitoring Digital Sync (15m Interval)")
            time.sleep(900) # 15 minutes
    except KeyboardInterrupt:
        if observer.is_alive():
            observer.stop()
    if observer.is_alive():
        observer.join()
