#!/usr/bin/env python3
"""
Step 6: vacuum_db.py
Performs maintenance on the AILCC knowledge base to ensure high-speed retrieval.
"""

import sqlite3
import os
import time

DB_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/knowledge-base.db"

def maintenance():
    print(f"[{time.strftime('%H:%M:%S')}] 🧹 Starting Database Maintenance...")
    
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        # Check size before
        size_before = os.path.getsize(DB_PATH) / 1024
        
        print(f"Current Cache Size: {size_before:.2f} KB")
        
        c = conn.cursor()
        
        print("⚡ Executing VACUUM...")
        c.execute("VACUUM")
        
        print("📊 Executing ANALYZE...")
        c.execute("ANALYZE")
        
        conn.commit()
        conn.close()
        
        size_after = os.path.getsize(DB_PATH) / 1024
        print(f"Optimized Cache Size: {size_after:.2f} KB")
        print(f"✅ Maintenance Complete. Space recovered: {max(0, size_before - size_after):.2f} KB")
        
    except Exception as e:
        print(f"❌ Maintenance Failed: {e}")

if __name__ == "__main__":
    maintenance()
