import sqlite3
import json
import os
import sys
from datetime import datetime

# Configuration
ZOTERO_PATH = os.path.expanduser("~/Zotero/zotero.sqlite")
VAULT_PATH = os.path.expanduser("~/AILCC_PRIME/04_Intelligence_Vault") # Resolves via symlink naturally in python

def sync_zotero():
    if not os.path.exists(ZOTERO_PATH):
        print(f"ERROR: Zotero database not found at {ZOTERO_PATH}")
        return

    # Real path resolution for the vault
    target_vault = os.path.realpath(VAULT_PATH)
    output_file = os.path.join(target_vault, "scholar_data.json")

    print(f"Connecting to Zotero: {ZOTERO_PATH}")
    
    try:
        # Connect to Zotero SQLite (Use URI for read-only to avoid locking)
        conn = sqlite3.connect(f"file:{ZOTERO_PATH}?mode=ro", uri=True)
        cursor = conn.cursor()

        # Query for items (simplified for first pass)
        query = """
        SELECT 
            i.itemID, 
            idv_title.value as title, 
            idv_creators.value as creator,
            i.dateAdded
        FROM items i
        LEFT JOIN itemData id_title ON i.itemID = id_title.itemID AND id_title.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'title')
        LEFT JOIN itemDataValues idv_title ON id_title.valueID = idv_title.valueID
        LEFT JOIN itemData id_creators ON i.itemID = id_creators.itemID AND id_creators.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'author')
        LEFT JOIN itemDataValues idv_creators ON id_creators.valueID = idv_creators.valueID
        WHERE i.clientItemTypeID != 14 -- Exclude attachments
        ORDER BY i.dateAdded DESC
        LIMIT 100
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()

        scholar_data = []
        for row in rows:
            scholar_data.append({
                "id": str(row[0]),
                "title": row[1] or "Untitled Resource",
                "creator": row[2] or "Unknown Author",
                "timestamp": row[3],
                "document": row[1] or "Unknown Document",
                "score": 0.95, # Meta-score placeholder
                "tags": ["Zotero"]
            })

        # Save to Vault
        with open(output_file, 'w') as f:
            json.dump(scholar_data, f, indent=4)

        print(f"SUCCESS: Synced {len(scholar_data)} papers to {output_file}")

    except Exception as e:
        print(f"CRITICAL ERROR during sync: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    sync_zotero()
