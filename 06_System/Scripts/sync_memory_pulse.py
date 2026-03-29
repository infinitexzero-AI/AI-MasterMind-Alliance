import os
import sqlite3
import glob
import json
from datetime import datetime
import re

# Configuration
ROOT_DIR = "/Users/infinite27/AILCC_PRIME"
VAULT_DIR = os.path.join(ROOT_DIR, "04_Intelligence_Vault")
DB_PATH = os.path.join(ROOT_DIR, "06_System/State/knowledge-base.db")

def get_db_connection():
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def extract_metadata(content):
    """Extracts title (first H1) and tags (#tag or Tags: ...) from content."""
    title = "Untitled"
    tags = []
    
    # Title extraction
    title_match = re.search(r'^#\s+(.*)', content, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()
        
    # Tag extraction (naive)
    # 1. Look for #tag
    tags.extend(re.findall(r'#(\w+)', content))
    # 2. Look for Tags: tag1, tag2
    tags_line = re.search(r'Tags:\s*(.*)', content, re.IGNORECASE)
    if tags_line:
        tags.extend([t.strip() for t in tags_line.group(1).split(',')])
        
    return title, json.dumps(list(set(tags)))

def sync_intelligence():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Ensure table exists with metadata columns
    c.execute("""
        CREATE TABLE IF NOT EXISTS intelligence_vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT UNIQUE,
            filename TEXT,
            title TEXT,
            tags TEXT,
            content TEXT,
            last_indexed TEXT
        )
    """)
    
    # Scan for markdown files, excluding node_modules and archives
    search_pattern = os.path.join(ROOT_DIR, "**/*.md")
    md_files = [f for f in glob.glob(search_pattern, recursive=True) 
                if "node_modules" not in f and "03_Archives" not in f]
    
    print(f"Syncing {len(md_files)} project files with metadata...")
    
    for md_file in md_files:
        try:
            with open(md_file, 'r', errors='ignore') as f:
                content = f.read()
                filename = os.path.basename(md_file)
                title, tags_json = extract_metadata(content)
                last_indexed = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                c.execute("""
                    INSERT INTO intelligence_vault (file_path, filename, title, tags, content, last_indexed)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(file_path) DO UPDATE SET
                        title=excluded.title,
                        tags=excluded.tags,
                        content=excluded.content,
                        last_indexed=excluded.last_indexed
                """, (md_file, filename, title, tags_json, content, last_indexed))
        except Exception as e:
            print(f"Error indexing {md_file}: {e}")

    conn.commit()
    conn.close()
    print("Memory Pulse complete. Intelligence Vault refined.")



if __name__ == "__main__":
    sync_intelligence()
