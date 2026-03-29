import os
import requests
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SEMANTIC-SCHOLAR] %(message)s")

# Load Semantic Scholar API Key
ENV_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/.env.local"
API_KEY = None

try:
    with open(ENV_PATH, 'r') as f:
        for line in f:
            if line.startswith("SEMANTIC_SCHOLAR_API_KEY="):
                API_KEY = line.split("=", 1)[1].strip().strip('"')
except Exception as e:
    logging.error(f"Failed to read Semantic Scholar API Key: {e}")

S2_BASE_URL = "https://api.semanticscholar.org/graph/v1"

def search_papers(query: str, limit: int = 5):
    """Search for academic papers using the Semantic Scholar API."""
    if not API_KEY:
        logging.error("Semantic Scholar API Key is missing. Aborting search.")
        return []

    url = f"{S2_BASE_URL}/paper/search"
    headers = {"x-api-key": API_KEY}
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,abstract,authors,year,url,referenceCount,citationCount,influentialCitationCount"
    }

    try:
        logging.info(f"Searching for papers matching: '{query}'")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        papers = data.get("data", [])
        logging.info(f"Found {len(papers)} papers.")
        return papers
        
    except requests.exceptions.RequestException as e:
        logging.error(f"Error querying Semantic Scholar API: {e}")
        if e.response is not None:
             logging.error(f"Response: {e.response.text}")
        return []

if __name__ == "__main__":
    # Test query
    results = search_papers("Large Language Models for Agentic Workflows", limit=3)
    for idx, paper in enumerate(results, 1):
        print(f"\n[{idx}] {paper.get('title')} ({paper.get('year')})")
        print(f"URL: {paper.get('url')}")
        print(f"Citations: {paper.get('citationCount')} | Influential: {paper.get('influentialCitationCount')}")
        abstract = paper.get('abstract')
        if abstract:
            print(f"Abstract: {abstract[:200]}...")
