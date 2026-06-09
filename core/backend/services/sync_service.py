import os
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

ROOT = "/Users/infinite27/AILCC_PRIME"
KB_DB = f"{ROOT}/06_System/State/knowledge-base.db"
ANTIGRAVITY_DB = os.path.expanduser("~/.config/antigravity/conversations.db")

class SyncService:
    def __init__(self, broadcast_fn=None):
        self.broadcast_fn = broadcast_fn

    def ingest_to_kb(self, items):
        """Normalized ingestion into the local SQLite knowledge base."""
        try:
            conn = sqlite3.connect(KB_DB)
            c = conn.cursor()
            # Ensure table exists (simplified for now)
            # id, source, type, content, tags, synced_at, version
            for item in items:
                c.execute('''INSERT OR REPLACE INTO knowledge VALUES (?, ?, ?, ?, ?, ?, ?)''', 
                          (item['id'], item['source'], item['type'], item['content'], item['tags'], item['synced_at'], item['version']))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"KB Ingestion Error: {e}")
            return False

    async def sync_comet(self):
        """Sync bookmarks/search from Perplexity Comet."""
        # Mocking data as in sync_daemon.py
        mock_items = [
            {
                "id": f"comet-bk-{int(datetime.now().timestamp())}",
                "source": "comet",
                "type": "bookmark",
                "content": "Mi'kmaq Fisheries - Netukulimk Research",
                "tags": "indg-mikmaq, fisheries",
                "synced_at": datetime.now().isoformat(),
                "version": 1
            }
        ]
        if self.ingest_to_kb(mock_items):
            if self.broadcast_fn:
                await self.broadcast_fn(json.dumps({"type": "sync", "service": "comet", "count": len(mock_items)}))

    async def sync_antigravity(self):
        """Sync conversation history from local Antigravity DB."""
        if not os.path.exists(ANTIGRAVITY_DB):
            return
        
        try:
            conn = sqlite3.connect(ANTIGRAVITY_DB)
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 5")
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
            
            if self.ingest_to_kb(items):
                if self.broadcast_fn:
                    await self.broadcast_fn(json.dumps({"type": "sync", "service": "antigravity", "count": len(items)}))
            conn.close()
        except Exception as e:
            print(f"Antigravity sync failed: {e}")

class AntigravityDBWatcher(FileSystemEventHandler):
    def __init__(self, sync_fn):
        self.sync_fn = sync_fn

    def on_modified(self, event):
        if event.src_path == ANTIGRAVITY_DB:
            # We need to trigger the async sync_fn from یہاں
            # This will be handled in the main loop/scheduler
            pass
