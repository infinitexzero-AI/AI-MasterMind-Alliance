#!/usr/bin/env python3
import requests
import logging
import os
import json

# Configuration
HIPPOCAMPUS_URL = "http://localhost:8090"
ENV_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/.env.local"
API_KEY = None

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SCHOLAR-INT] %(message)s")

# Load API Key
try:
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r') as f:
            for line in f:
                if line.startswith("SEMANTIC_SCHOLAR_API_KEY="):
                    API_KEY = line.split("=", 1)[1].strip().strip('"')
except Exception as e:
    logging.error(f"Failed to read API Key: {e}")

def fetch_and_index(query: str, limit: int = 5):
    if not API_KEY:
        logging.error("Semantic Scholar API Key is missing. Skipping ingestion.")
        return

    logging.info(f"🔍 Searching for academic evidence: '{query}'")
    s2_url = "https://api.semanticscholar.org/graph/v1/paper/search"
    headers = {"x-api-key": API_KEY}
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,abstract,authors,year,url"
    }

    try:
        response = requests.get(s2_url, headers=headers, params=params)
        response.raise_for_status()
        papers = response.json().get("data", [])
        
        for paper in papers:
            title = paper.get('title')
            abstract = paper.get('abstract')
            if not abstract: continue
            
            paper_id = f"paper_{paper.get('year')}_{hash(title) % 10000}"
            content = f"TITLE: {title}\nABSTRACT: {abstract}\nYEAR: {paper.get('year')}\nURL: {paper.get('url')}"
            
            # Index to RAG with Academic context
            logging.info(f"📍 Ingesting: {title[:50]}...")
            requests.post(f"{HIPPOCAMPUS_URL}/memory/upsert", json={
                "id": paper_id,
                "content": content,
                "metadata": {
                    "source": "semantic_scholar",
                    "context_type": "Academic",
                    "year": paper.get('year'),
                    "topic": query
                }
            })
            
        logging.info(f"✅ Successfully processed {len(papers)} papers for topic: {query}")

    except Exception as e:
        logging.error(f"Ingestion failed: {str(e)}")

if __name__ == "__main__":
    topics = [
        "disability accommodations university administrative barriers",
        "student loan debt psychological impact academic performance",
        "post-secondary withdrawal policies and financial holds"
    ]
    for topic in topics:
        fetch_and_index(topic, limit=3)
