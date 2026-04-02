import sqlite3
import os
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [TreasuryManager] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
TREASURY_DB_PATH = HIPPOCAMPUS_DIR / "archon_treasury.db"

# Architect Thresholds
MAX_WEEKLY_USD = 10.00

# Pricing (Cost per 1M tokens approx as of mid-2024/2025 structure)
PRICING_MODEL = {
    "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
    "gpt-4o": {"input": 5.00, "output": 15.00},
    "grok-4.20-experimental-beta-0304-reasoning": {"input": 5.00, "output": 15.00},
    "sonar-pro": {"input": 3.00, "output": 15.00},
    "gemini-1.5-pro": {"input": 3.50, "output": 10.50}
}

class TreasuryManager:
    """
    Sovereign Token Ledger and API Budget Guard.
    Mathematically intercepts requests inside llm_clients if the weekly USD burn exceeds $10.00.
    """
    
    @staticmethod
    def _get_connection():
        os.makedirs(HIPPOCAMPUS_DIR, exist_ok=True)
        conn = sqlite3.connect(TREASURY_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def initialize():
        conn = TreasuryManager._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS token_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                provider TEXT NOT NULL,
                model_used TEXT NOT NULL,
                prompt_tokens INTEGER,
                completion_tokens INTEGER,
                cost_usd REAL
            )
        ''')
        conn.commit()
        conn.close()

    @staticmethod
    def log_usage(provider: str, model: str, prompt_tokens: int, completion_tokens: int):
        """Records absolute API usage precisely inside the Ledger."""
        if not os.path.exists(TREASURY_DB_PATH):
            TreasuryManager.initialize()
            
        cost_usd = 0.0
        if model in PRICING_MODEL:
            costs = PRICING_MODEL[model]
            cost_usd = ((prompt_tokens / 1_000_000) * costs["input"]) + ((completion_tokens / 1_000_000) * costs["output"])
            
        conn = TreasuryManager._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO token_ledger (provider, model_used, prompt_tokens, completion_tokens, cost_usd)
            VALUES (?, ?, ?, ?, ?)
        ''', (provider, model, prompt_tokens, completion_tokens, cost_usd))
        conn.commit()
        conn.close()
        
        logger.info(f"💰 Logged {provider} ({model}) | {prompt_tokens} In / {completion_tokens} Out | Cost: ${cost_usd:.5f}")

    @staticmethod
    def check_budget() -> bool:
        """
        Calculates the rolling 7-day total usage.
        Returns True if SAFE (Under $10.00), False if CUTOFF.
        """
        if not os.path.exists(TREASURY_DB_PATH):
            TreasuryManager.initialize()
            return True
            
        conn = TreasuryManager._get_connection()
        cursor = conn.cursor()
        
        # Pull sum from the last 7 days
        cursor.execute('''
            SELECT SUM(cost_usd) as total_spent 
            FROM token_ledger 
            WHERE timestamp >= date('now', '-7 days')
        ''')
        row = cursor.fetchone()
        conn.close()
        
        total_spent = row["total_spent"] if row["total_spent"] is not None else 0.0
        logger.info(f"📊 Sovereign Treasury Weekly Burn: ${total_spent:.3f} / ${MAX_WEEKLY_USD:.2f}")
        
        return total_spent < MAX_WEEKLY_USD

if __name__ == "__main__":
    TreasuryManager.initialize()
    logger.info("Archon Treasury SQLite Grid Established.")
    print("Burn status safe:", TreasuryManager.check_budget())
