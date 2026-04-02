#!/usr/bin/env python3
"""
hippocampus_rag.py — Phase VI: LlamaIndex Long-Term Context Memory
==================================================================
This script vectorizes the entire `hippocampus_storage` directory so the
Vanguard Swarm doesn't start from scratch on every query.

It utilizes LlamaIndex to ingest Scholar notes, Tycoon reports, and Taguette
graphs. When queried, it returns exact, grounded citations from your own data.

Usage:
    python3 hippocampus_rag.py --build    (Builds the Vector Index)
    python3 hippocampus_rag.py --query "What is the status of my NSLSC hold?"
"""

import os
import logging
import argparse
from pathlib import Path

# Provide graceful degradation during checking
try:
    from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage
    from llama_index.core.settings import Settings
    from llama_index.llms.ollama import Ollama
    from llama_index.embeddings.ollama import OllamaEmbedding
except ImportError:
    print("LlamaIndex or Ollama connectors not installed. Please run: pip install llama-index llama-index-llms-ollama llama-index-embeddings-ollama")
    exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [HippocampusRAG] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
INDEX_STORE_DIR = HIPPOCAMPUS_DIR / ".vector_index"

def build_index():
    logger.info("🧠 Initializing Hippocampus Vectorization...")
    if not HIPPOCAMPUS_DIR.exists():
        logger.error(f"Directory {HIPPOCAMPUS_DIR} not found.")
        return

    # Load all markdown and JSON files from Scholar / Tycoon reports
    documents = SimpleDirectoryReader(
        input_dir=str(HIPPOCAMPUS_DIR),
        required_exts=[".md", ".json"],
        recursive=True
    ).load_data()

    logger.info(f"📚 Loaded {len(documents)} documents. Building Vector Store...")
    
    # Needs LLM context (defaults to OpenAI embedding unless configured otherwise)
    index = VectorStoreIndex.from_documents(documents)
    
    # Persist the index to disk
    index.storage_context.persist(persist_dir=str(INDEX_STORE_DIR))
    logger.info(f"✅ Indexed saved permanently to {INDEX_STORE_DIR.name}")

def query_hippocampus(prompt: str):
    logger.info(f"🔍 Searching Vanguard Memory for: '{prompt}'")
    
    if not INDEX_STORE_DIR.exists():
        logger.error("No index found. Run --build first.")
        return

    # Load from disk
    storage_context = StorageContext.from_defaults(persist_dir=str(INDEX_STORE_DIR))
    index = load_index_from_storage(storage_context)
    
    query_engine = index.as_query_engine()
    response = query_engine.query(prompt)
    
    print("\\n=== VANGUARD MEMORY RETRIEVAL ===")
    print(response)
    print("===================================\\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LlamaIndex RAG for Hippocampus Data")
    parser.add_argument("--build", action="store_true", help="Crawl and vectorize the Hippocampus")
    parser.add_argument("--query", type=str, help="Ask a question against your local data")
    args = parser.parse_args()

    # Configure LlamaIndex to use local Ollama resources
    logger.info("🔧 Configuring Sovereign Intelligence (Ollama)...")
    Settings.llm = Ollama(model="tinyllama", request_timeout=60.0)
    Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")

    if args.build:
        build_index()
    elif args.query:
        query_hippocampus(args.query)
    else:
        logger.info("Please provide --build or --query 'text'.")
