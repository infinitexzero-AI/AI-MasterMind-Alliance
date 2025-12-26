import sqlite3
import json
import os
from datetime import datetime

# Path to the Vault Nexus
VAULT_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/vault_nexus.db"

def retrieve_evidence(query_type="EMAIL_EXTRACT"):
    """Connect to the Vault Nexus (Hippocampus) and retrieve evidence."""
    if not os.path.exists(VAULT_PATH):
        print(f"❌ Vault not found at {VAULT_PATH}")
        return []

    conn = sqlite3.connect(VAULT_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT title, type, source_agent, content, created_at FROM artifacts WHERE type = ?", (query_type,))
        rows = cursor.fetchall()
        
        evidence = []
        for row in rows:
            evidence.append({
                "title": row[0],
                "type": row[1],
                "agent": row[2],
                "content": row[3],
                "date": row[4]
            })
        
        return evidence
    except sqlite3.OperationalError as e:
        print(f"❌ Error querying vault: {e}")
        return []
    finally:
        conn.close()

if __name__ == "__main__":
    print(f"📡 Accessing Hippocampus: {datetime.now()}")
    evidence = retrieve_evidence()
    
    if not evidence:
        print("⚠️ No evidence found in the vault. Awaiting Comet retrieval...")
    else:
        print(f"✅ Found {len(evidence)} evidence artifacts.")
        for item in evidence:
            print(f"- [{item['agent'].upper()}] {item['title']} ({item['date']})")
