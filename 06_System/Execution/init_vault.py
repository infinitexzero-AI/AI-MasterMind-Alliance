import sqlite3
import os

VAULT_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/vault_nexus.db"
SCHEMA_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/vault_nexus_schema.sql"

def init_vault():
    print(f"🚀 Initializing Vault Nexus at {VAULT_PATH}...")
    
    if os.path.exists(VAULT_PATH):
        print(f"⚠️ Vault already exists. Re-applying schema if needed.")
    
    try:
        with open(SCHEMA_PATH, 'r') as f:
            schema = f.read()
        
        conn = sqlite3.connect(VAULT_PATH)
        cursor = conn.cursor()
        
        cursor.executescript(schema)
        conn.commit()
        
        # Add a seed artifact for verification
        cursor.execute("INSERT OR IGNORE INTO agent_status (agent_name, status, current_task) VALUES (?, ?, ?)", 
                       ("Antigravity", "ONLINE", "Infrastructure Stabilization"))
        
        conn.commit()
        conn.close()
        print("✅ Vault Nexus initialized successfully.")
    except Exception as e:
        print(f"❌ Error initializing vault: {e}")

if __name__ == "__main__":
    init_vault()
