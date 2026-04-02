import sqlite3
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("SQLite_Refiner")

AILCC_ROOT = Path(__file__).parent.parent.parent
DB_PATH = AILCC_ROOT / "core" / "memory" / "vault_vector_store.db"

def optimize_vault():
    if not DB_PATH.exists():
        logger.error(f"Cannot optimize. DB not found at: {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        logger.info("Executing Mathematical PRAGMA Hardening...")
        
        # 1. Enable WAL mode for high-concurrency Non-Blocking Reads
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # 2. Relax sync requirements for write speed, safe with WAL
        cursor.execute("PRAGMA synchronous=NORMAL;")
        
        # 3. Force SQLite to use 64MB of RAM for cache instead of disk paging
        cursor.execute("PRAGMA cache_size=-64000;")
        
        # 4. Store temp tables in pure RAM
        cursor.execute("PRAGMA temp_store=MEMORY;")
        
        # 5. Optimize free pages natively back to the OS
        cursor.execute("PRAGMA secure_delete=FAST;")
        cursor.execute("VACUUM;")
        
        # 6. Re-analyze statistics for the query planner
        cursor.execute("ANALYZE;")

        logger.info("✅ Vault Array optimally tuned for Zero-Latency Vector Scaling.")
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to optimize SQLite array: {e}")

if __name__ == "__main__":
    optimize_vault()
