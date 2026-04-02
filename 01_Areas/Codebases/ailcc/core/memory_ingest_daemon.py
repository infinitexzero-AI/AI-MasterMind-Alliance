#!/usr/bin/env python3
"""
memory_ingest_daemon.py — ChromaDB RAG Ingester
=============================================================================
Sweeps `/hippocampus_storage` for static JSON schemas and markdown files, 
embedding them into a local ChromaDB instance running on port 8001.
Allows the Vanguard Swarm to natively cross-reference Vault context.

Requires:
  pip install chromadb sentence-transformers
"""

import os
import json
import logging
import time
import threading
from pathlib import Path
from flask import Flask, request, jsonify

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [MemoryIngest] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
daemon_instance = None

try:
    import chromadb
    from chromadb.utils import embedding_functions
except ImportError:
    logger.error("ChromaDB not installed. Run `pip install chromadb sentence-transformers`.")
    # In a prod environment, this should gracefully exit or wait
    pass

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8001))

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")

class MemoryIngestDaemon:
    def __init__(self):
        logger.info(f"Connecting to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}...")
        try:
            self.client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
            self.ef = embedding_functions.DefaultEmbeddingFunction()
            self.collection = self.client.get_or_create_collection(name="ailcc_memory", embedding_function=self.ef)
            self.skill_vault = self.client.get_or_create_collection(name="skill_vault", embedding_function=self.ef)
            logger.info("Connected. Collections `ailcc_memory` and `skill_vault` verified.")
        except Exception as e:
            logger.error(f"Failed to connect to ChromaDB: {e}. Is the server running?")
            self.client = None

    def ingest_forged_skill(self, objective: str, code: str, language: str):
        """Immediately caches a newly forged script into long-term vector memory and the GraphRAG Overlay."""
        if not self.client:
            logger.error("ChromaDB disconnected. Cannot save skill.")
            return False
            
        try:
            skill_id = f"skill_{int(time.time())}"
            self.skill_vault.upsert(
                documents=[objective], # The natural language prompt/objective becomes the searched vector
                metadatas=[{"code": code, "language": language, "type": "forged_skill"}],
                ids=[skill_id]
            )
            logger.info(f"Dynamically embedded new skill into skill_vault: {skill_id}")
            
            # Phase 67: GraphRAG Edge Extraction
            try:
                from core.graph_rag_daemon import GraphRAGDaemon
                import urllib.request
                import json
                
                graph = GraphRAGDaemon()
                sys_prompt = "You extract architectural logic graphs. Output ONLY raw JSON array of objects: [{'source':'NodeA', 'target':'NodeB', 'relation':'ACTION_VERB'}]. No markdown wrappers."
                
                url = "http://localhost:11434/api/chat"
                payload = {
                    "model": "gemma:2b", # Using local lightweight model for edge extraction to save latency
                    "messages": [
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": f"Extract exactly 2 relationships describing how this script works relative to external components or goals.\nObjective: {objective}\nCode:\n{code[:1000]}"}
                    ],
                    "stream": False
                }
                
                req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req, timeout=15) as response:
                    res_text = json.loads(response.read().decode('utf-8'))['message']['content']
                    
                # Clean up any potential markdown formatting
                if "```json" in res_text:
                    res_text = res_text.split("```json")[1].split("```")[0].strip()
                elif "```" in res_text:
                    res_text = res_text.split("```")[1].split("```")[0].strip()
                    
                edges = json.loads(res_text)
                for edge in edges:
                    graph.add_relationship(
                        edge.get("source", f"skill_{objective[:10]}"), 
                        edge.get("target", "system"), 
                        edge.get("relation", "AFFECTS")
                    )
                logger.info(f"GraphRAG Overlay: Successfully injected {len(edges)} logical edges for new skill.")
            except Exception as graph_e:
                logger.warning(f"Failed to infer/ingest GraphRAG edges (Non-fatal): {graph_e}")
                
            return True
        except Exception as e:
            logger.error(f"Failed to embed skill: {e}")
            return False


    def ingest_hippocampus(self):
        if not self.client:
            return

        logger.info(f"Sweeping Hippocampus for Vector Injection: {HIPPOCAMPUS_DIR}")
        
        docs_to_inject = []
        metadatas = []
        ids = []

        # Recursively find JSON and markdown
        for root, _, files in os.walk(HIPPOCAMPUS_DIR):
            for file in files:
                if file.endswith(('.json', '.md')):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, 'r') as f:
                            content = f.read()
                            
                        # Basic ID generation based on relative path + modify time to track updates
                        doc_id = f"{file}_{int(os.path.getmtime(filepath))}"
                        
                        docs_to_inject.append(content[:5000]) # Cap sheer string length per node for now
                        metadatas.append({"source": str(filepath), "type": "hippocampus_json" if file.endswith('.json') else "markdown"})
                        ids.append(doc_id)
                    except Exception as e:
                        logger.error(f"Failed to parse {file}: {e}")

        if docs_to_inject:
            try:
                # We skip checking if ID exists in this simple logic (Chroma will just skip if we configure properly, or we upsert)
                self.collection.upsert(
                    documents=docs_to_inject,
                    metadatas=metadatas,
                    ids=ids
                )
                logger.info(f"Upserted {len(docs_to_inject)} contextual documents into `ailcc_memory` vector space.")
            except Exception as e:
                logger.error(f"Failed to upsert vectors into Chroma: {e}")

    def run_sweeper(self):
        logger.info("Semantic Vector Sweeper engaged.")
        while True:
            self.ingest_hippocampus()
            # Run every 60 minutes
            time.sleep(3600)

@app.route('/mesh/sync', methods=['GET'])
def get_mesh_sync():
    """Returns all forged skills to peer Mastermind nodes."""
    if not daemon_instance or not daemon_instance.client:
        return jsonify({"error": "ChromaDB unavailable"}), 503
        
    try:
        # Simplistic pull for demonstration. In prod, we filter by timestamp.
        results = daemon_instance.skill_vault.get(
            include=['metadatas', 'documents']
        )
        return jsonify({
            "status": "success",
            "skills": [
                {
                    "id": cid,
                    "code": results['metadatas'][i].get('code'),
                    "language": results['metadatas'][i].get('language'),
                    "document": results['documents'][i]
                }
                for i, cid in enumerate(results['ids']) if 'code' in results['metadatas'][i]
            ]
        }), 200
    except Exception as e:
        logger.error(f"Mesh Sync Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/mesh/ping', methods=['GET'])
def get_ping():
    return jsonify({"status": "AILCC Mesh Node Active"}), 200

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--sweep", action="store_true", help="Perform a single vector sweep.")
    args = parser.parse_args()
    daemon_instance = MemoryIngestDaemon()
    if args.sweep:
        daemon_instance.ingest_hippocampus()
    else:
        # Run sweeper in background thread
        sweeper_thread = threading.Thread(target=daemon_instance.run_sweeper, daemon=True)
        sweeper_thread.start()
        
        # Run Mesh API on main thread
        logger.info("Starting AILCC Mesh Sync Server on port 8002...")
        app.run(host='0.0.0.0', port=8002, use_reloader=False)
