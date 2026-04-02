#!/usr/bin/env python3
"""
Zotero to Obsidian Sync
Exports simplified literature notes from Zotero database to Obsidian Markdown
"""

import sqlite3
import os
import shutil
from datetime import datetime

# CONFIGURATION
# Default paths - User should update these
USER_HOME = os.path.expanduser("~")
ZOTERO_DB_PATH = os.path.join(USER_HOME, "Zotero/zotero.sqlite")
OBSIDIAN_VAULT_PATH = os.path.join(USER_HOME, "Documents/Obsidian Vault/Literature Notes")

def get_zotero_items():
    """Query Zotero DB for items with metadata"""
    if not os.path.exists(ZOTERO_DB_PATH):
        print(f"Error: Zotero DB not found at {ZOTERO_DB_PATH}")
        return []

    # Copy DB to avoid lock issues
    temp_db = "/tmp/zotero_temp.sqlite"
    shutil.copy2(ZOTERO_DB_PATH, temp_db)

    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    # Simple query to get top level items (excluding attachments/notes)
    # Item type 1 = note, 2 = attachment, usually academic papers are > 10 depending on schema
    query = """
    SELECT 
        items.key,
        it.typeName,
        MAX(CASE WHEN id.fieldID = (SELECT fieldID FROM fields WHERE fieldName='title') THEN iv.value END) as title,
        MAX(CASE WHEN id.fieldID = (SELECT fieldID FROM fields WHERE fieldName='date') THEN iv.value END) as date,
        MAX(CASE WHEN id.fieldID = (SELECT fieldID FROM fields WHERE fieldName='url') THEN iv.value END) as url
    FROM items 
    JOIN itemTypes it ON items.itemTypeID = it.itemTypeID
    JOIN itemData id ON items.itemID = id.itemID
    JOIN itemDataValues iv ON id.valueID = iv.valueID
    WHERE items.itemTypeID NOT IN (1, 14) -- Exclude notes and attachments
    GROUP BY items.itemID
    ORDER BY date DESC
    LIMIT 50
    """
    
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print(f"Database error: {e}")
        return []
    finally:
        conn.close()

def create_obsidian_note(item):
    key, type_name, title, date, url = item
    if not title:
        return
        
    safe_title = "".join([c for c in title if c.isalpha() or c.isdigit() or c==' ']).rstrip()
    filename = f"{safe_title}.md"
    path = os.path.join(OBSIDIAN_VAULT_PATH, filename)
    
    # Don't overwrite existing notes to preserve user edits
    if os.path.exists(path):
        return

    content = f"""---
zotero_key: {key}
type: {type_name}
date: {date}
url: {url}
status: unread
tags: [literature, zotero]
---

# {title}

## Metadata
- **Type**: {type_name}
- **Date**: {date}
- **Link**: {url}

## Abstract
(Auto-imported)

## Notes
- 

## References
"""
    
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created: {filename}")

def sync():
    if not os.path.exists(OBSIDIAN_VAULT_PATH):
        try:
            os.makedirs(OBSIDIAN_VAULT_PATH)
        except OSError:
            print("Could not create Obsidian directory. Check configuration.")
            return

    print("Syncing Zotero to Obsidian...")
    items = get_zotero_items()
    print(f"Found {len(items)} items.")
    
    for item in items:
        create_obsidian_note(item)
    
    print("Sync complete.")

if __name__ == "__main__":
    sync()
