#!/usr/bin/env python3
"""
neural_memory_pruning.py — Phase XIII: Autonomous Governance
============================================================
Automated background task to merge semantically similar vectors
and delete low-relevance "noise" from the Hippocampus Vault.

It iterates through ChromaDB collections, identifies highly
similar document clusters (distance < 0.05), merges them
using the local Ollama LLM, deletes the redundant nodes,
and embeds the freshly crystallized summary.

Usage:
    python3 neural_memory_pruning.py --run
    python3 neural_memory_pruning.py --dry-run
"""

import sys
import os
import argparse
import logging
from pathlib import Path

# Fix python path to allow importing from ailcc core
sys.path.append(str(Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc").resolve()))

try:
    import chromadb
except ImportError:
    print("chromadb not installed. Cannot run memory pruning.")
    sys.exit(1)

from core.llm_clients import OllamaClient

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
CHROMA_PATH = HIPPOCAMPUS_DIR / "chroma"

import json

# Paths
HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
CHROMA_PATH = HIPPOCAMPUS_DIR / "chroma"
PRUNING_CANDIDATES_FILE = HIPPOCAMPUS_DIR / "pruning_candidates.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [NeuralPruner] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

def merge_documents_with_llm(docs: list[str]) -> str:
    """Takes multiple similar documents and creates a single dense synthesis."""
    client = OllamaClient()
    
    prompt = "I have several notes that represent highly similar semantic data. Please merge and synthesize them into a single, cohesive, dense Markdown document without losing any unique factual information.\n\n"
    for i, doc in enumerate(docs):
        prompt += f"--- DOCUMENT {i+1} ---\n{doc}\n\n"
        
    system_prompt = "You are the AILCC Neural Memory Pruner. Your job is to read redundant text fragments and output a singular, perfect crystallization of the knowledge. Output ONLY the markdown text for the new document. No intro/outro."
    
    logger.info("Calling local Ollama LLM to synthesize merged memory...")
    try:
        result = client.generate(prompt=prompt, system_prompt=system_prompt)
        return result
    except Exception as e:
        logger.error(f"LLM Synthesis failed: {e}")
        return "Synthesis failed. Manual review required."

def prune_collection(collection_name: str, client: chromadb.PersistentClient, mode: str = "dry-run"):
    try:
        collection = client.get_collection(collection_name)
    except Exception as e:
        logger.warning(f"Could not load collection '{collection_name}': {e}")
        return []

    logger.info(f"Scanning '{collection_name}' for semantic redundancy (Mode: {mode})...")
    all_data = collection.get(include=["documents", "metadatas"])
    
    ids = all_data["ids"]
    docs = all_data["documents"]
    metadatas = all_data["metadatas"]
    
    if not ids:
        logger.info("Collection is empty.")
        return []
        
    logger.info(f"Total documents to analyze: {len(ids)}")
    
    processed_ids = set()
    clusters = []
    total_pruned = 0
    
    for i, doc_id in enumerate(ids):
        if doc_id in processed_ids:
            continue
            
        doc_text = docs[i]
        
        # Query the collection for anything extremely similar to THIS document
        results = collection.query(
            query_texts=[doc_text],
            n_results=5,
            include=["documents", "distances", "metadatas"]
        )
        
        if not results["ids"] or not results["ids"][0]:
            continue
            
        res_ids = results["ids"][0]
        res_distances = results["distances"][0]
        res_docs = results["documents"][0]
        
        similar_indices = []
        for j, (rid, dist) in enumerate(zip(res_ids, res_distances)):
            if rid != doc_id and rid not in processed_ids and dist < 0.04:
                similar_indices.append(j)
                
        if len(similar_indices) > 0:
            cluster_meta = []
            cluster_docs_to_merge = [doc_text]
            cluster_ids = [doc_id]
            
            cluster_meta.append({
                "id": doc_id,
                "title": metadatas[i].get('title', 'Unknown'),
                "distance": 0.0
            })
            
            for j in similar_indices:
                s_id = res_ids[j]
                s_dist = res_distances[j]
                s_doc = res_docs[j]
                s_meta = results["metadatas"][0][j]
                
                cluster_meta.append({
                    "id": s_id,
                    "title": s_meta.get('title', 'Unknown'),
                    "distance": float(s_dist)
                })
                cluster_docs_to_merge.append(s_doc)
                cluster_ids.append(s_id)
                processed_ids.add(s_id)
                
            processed_ids.add(doc_id)
            
            cluster_obj = {
                "collection": collection_name,
                "timestamp": datetime.now().isoformat(),
                "nodes": cluster_meta
            }

            if mode == "run":
                # 1. Synthesize a new document
                merged_text = merge_documents_with_llm(cluster_docs_to_merge)
                # 2. Delete old documents
                logger.info(f"Deleting {len(cluster_ids)} redundant nodes from vector space...")
                collection.delete(ids=cluster_ids)
                # 3. Insert new synthesized document
                new_id = f"merged_{doc_id}_{len(cluster_ids)}_nodes"
                collection.add(
                    ids=[new_id],
                    documents=[merged_text],
                    metadatas=[{"title": f"Synthesis of {len(cluster_ids)} related notes", "source": "neural_pruner"}]
                )
                total_pruned += (len(cluster_ids) - 1)
            else:
                clusters.append(cluster_obj)
                
    if mode == "run":
        logger.info(f"\n✅ Net nodes reduced: {total_pruned}")
    return clusters

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="store_true", help="Execute pruning and LLM synthesis (Auto-Delete)")
    parser.add_argument("--review", action="store_true", help="Generate pruning_candidates.json for review (Recommended)")
    parser.add_argument("--dry-run", action="store_true", help="Scan only, output to console")
    args = parser.parse_args()
    
    mode = "dry-run"
    if args.run: mode = "run"
    if args.review: mode = "review"
    
    logger.info(f"🚀 Initializing Neural Memory Pruner (Mode: {mode})")
        
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collections_to_scan = ["vault_knowledge_base"]
    
    all_candidates = []
    for c_name in collections_to_scan:
        candidates = prune_collection(c_name, client, mode=mode)
        all_candidates.extend(candidates)
        
    if mode == "review":
        with open(PRUNING_CANDIDATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_candidates, f, indent=4)
        logger.info(f"💾 {len(all_candidates)} clusters written to {PRUNING_CANDIDATES_FILE}")
    elif mode == "dry-run":
        logger.info(f"Found {len(all_candidates)} redundant clusters.")

if __name__ == "__main__":
    from datetime import datetime
    main()

