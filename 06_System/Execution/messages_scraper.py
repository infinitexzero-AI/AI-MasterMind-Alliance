import os
import sqlite3
import json
import time
import hashlib
from datetime import datetime, timedelta
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance

# Configuration
MESSAGES_DB_PATH = os.path.expanduser("~/Library/Messages/chat.db")
QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "omni_memory_messages"

def get_recent_messages(days=1):
    if not os.path.exists(MESSAGES_DB_PATH):
        print(f"Error: chat.db not found at {MESSAGES_DB_PATH}. Full Disk Access required.")
        return []

    # Connect to SQLite in read-only mode to prevent locking
    conn = sqlite3.connect(f"file:{MESSAGES_DB_PATH}?mode=ro", uri=True)
    cursor = conn.cursor()

    # Apple's CoreData timestamp is seconds since Jan 1, 2001
    coredata_epoch_offset = 978307200
    cutoff_time = int(time.time() - (days * 86400)) - coredata_epoch_offset

    query = f"""
        SELECT text, is_from_me, date, handle.id
        FROM message
        LEFT JOIN handle ON message.handle_id = handle.ROWID
        WHERE date >= {cutoff_time}000000000 AND text IS NOT NULL
        ORDER BY date ASC
    """
    
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        messages = []
        for row in rows:
            text, is_from_me, date_ns, handle_id = row
            # Convert date (depending on macOS version, date might be in seconds or nanoseconds)
            # Modern macOS typically uses nanoseconds for CoreData
            try:
                actual_date = datetime.fromtimestamp((date_ns / 1000000000) + coredata_epoch_offset)
            except:
                actual_date = datetime.fromtimestamp(date_ns + coredata_epoch_offset)
                
            messages.append({
                "text": text,
                "is_from_me": bool(is_from_me),
                "timestamp": actual_date.isoformat(),
                "contact": handle_id if handle_id else "Unknown"
            })
        return messages
    except sqlite3.OperationalError as e:
        print(f"SQLite Read Error (FDA missing?): {e}")
        return []
    finally:
        conn.close()

def _str_to_uuid(s: str) -> str:
    # Deterministic UUID generation
    m = hashlib.md5()
    m.update(s.encode('utf-8'))
    h = m.hexdigest()
    return f"{h[0:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"

def push_to_qdrant(messages):
    if not messages:
        return
        
    client = QdrantClient(url=QDRANT_URL)
    
    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE)
        )
        print(f"Created Qdrant Collection: {COLLECTION_NAME}")

    points = []
    for msg in messages:
        # Determine unique ID
        point_id = _str_to_uuid(f"{msg['timestamp']}_{msg['text']}")
        
        points.append(
            PointStruct(
                id=point_id,
                vector=[0.0] * 768, # Placeholder for Nomic-embed generated vector
                payload=msg
            )
        )
        
    try:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"✅ Synced {len(points)} messages to Omni-Memory (Qdrant).")
    except Exception as e:
        print(f"❌ Failed to sync to Qdrant: {e}")

if __name__ == "__main__":
    print("Omni-Memory Messages Scraper Initiating...")
    msgs = get_recent_messages(days=1)
    if msgs:
        print(f"Found {len(msgs)} recent messages. Syncing to Hippocampus...")
        push_to_qdrant(msgs)
    else:
        print("No new messages found or FDA blocked.")
