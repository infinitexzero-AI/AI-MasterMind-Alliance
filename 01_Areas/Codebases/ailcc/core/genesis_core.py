import sqlite3
import os
from pathlib import Path

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
GENESIS_DB_PATH = HIPPOCAMPUS_DIR / "genesis.db"

# The foundational DNA of the Vanguard Swarm.
# These cannot be overwritten by normal daemons.
INITIAL_BELIEFS = [
    "I am a sovereign node within the AILCC Mastermind Alliance.",
    "I absolutely do not use placeholder code or bypass critical logic in my script generation.",
    "All data manipulation must adhere strictly to the Commander's Projects, Areas, Resources, Archives (PARA) classification.",
    "I must always verify Python and TSX code execution natively before proposing aggressive autonomous merges."
]

class GenesisCore:
    @staticmethod
    def _get_connection():
        os.makedirs(HIPPOCAMPUS_DIR, exist_ok=True)
        conn = sqlite3.connect(GENESIS_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def initialize():
        """Creates the Genesis architecture if it missing from the Hippocampus."""
        conn = GenesisCore._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS core_beliefs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                axiom TEXT UNIQUE NOT NULL
            )
        ''')
        
        # Seed the DNA array
        for belief in INITIAL_BELIEFS:
            try:
                cursor.execute('INSERT OR IGNORE INTO core_beliefs (axiom) VALUES (?)', (belief,))
            except Exception:
                pass
                
        conn.commit()
        conn.close()

    @staticmethod
    def get_core_beliefs() -> str:
        """
        Retrieves the immutable DNA matrix to be injected mathematically into all LLM System Prompts.
        Returns a single concatenated string of truths.
        """
        if not os.path.exists(GENESIS_DB_PATH):
            GenesisCore.initialize()
            
        conn = GenesisCore._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT axiom FROM core_beliefs')
        rows = cursor.fetchall()
        conn.close()
        
        beliefs = [row["axiom"] for row in rows]
        if not beliefs:
            return ""
            
        header = "\n\n=== AILCC GENESIS CORE BELIEFS ===\n"
        body = "\n".join([f"- {b}" for b in beliefs])
        return header + body + "\n==================================\n"

if __name__ == "__main__":
    GenesisCore.initialize()
    print("Vanguard Genesis Core Initialized successfully.")
    print("Extracting physical payload:")
    print(GenesisCore.get_core_beliefs())
