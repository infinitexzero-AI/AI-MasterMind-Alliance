#!/usr/bin/env python3
"""
Step 12: High-Speed Retrieval Benchmark
Tests the performance of the RAG index and retrieval.
"""

import time
import json
import sys
sys.path.append("/Users/infinite27/AILCC_PRIME/06_System/Execution")
from vault_rag import query_vault, build_index

def benchmark():
    print("🚀 Starting RAG Retrieval Benchmark...")
    
    # 1. Full Index Rebuild
    start = time.time()
    build_index()
    index_time = time.time() - start
    print(f"📊 Full Rebuild: {index_time:.4f}s")
    
    # 2. Sequential Queries
    queries = ["biopyschology", "2023 evidence", "registrar", "abundance", "withdrawal"]
    query_times = []
    
    for q in queries:
        s = time.time()
        results = query_vault(q)
        e = time.time() - s
        query_times.append(e)
        print(f"🔍 Query '{q}': {len(results)} matches in {e:.4f}s")
    
    avg_query = sum(query_times) / len(query_times)
    print(f"\n📈 Performance Metrics:")
    print(f" - Average Query Time: {avg_query:.4f}s")
    print(f" - Target Threshold: <0.0500s")
    
    if avg_query < 0.05:
        print("✅ SPEED RATING: OPTIMAL")
    else:
        print("⚠️ SPEED RATING: SUB-OPTIMAL (Consider indexing optimization)")

if __name__ == "__main__":
    # Add Execution path to sys.path to find vault_rag
    import sys
    sys.path.append("/Users/infinite27/AILCC_PRIME/06_System/Execution")
    benchmark()
