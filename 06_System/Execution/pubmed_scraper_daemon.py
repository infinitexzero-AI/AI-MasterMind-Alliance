import time
import requests
import xml.etree.ElementTree as ET
import logging
from pathlib import Path
import urllib.request
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger("PubMedScraper")

# Directories
STORAGE_DIR = Path("/Users/infinite27/AILCC_PRIME/06_System/Hippocampus/PillarV_Medical_PDFs")
os.makedirs(STORAGE_DIR, exist_ok=True)

# Keyword specific to user's 2026-2027 neuro/medical matrix
SEARCH_TERMS = "neuroplasticity OR mcat OR cognitive enhancement OR neurogenesis"
MAX_RESULTS = 5

def fetch_pubmed_ids(query, max_results=5):
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "json"
    }
    
    logger.info(f"Querying PubMed for: {query}")
    try:
        response = requests.get(base_url, params=params, timeout=10)
        data = response.json()
        return data.get("esearchresult", {}).get("idlist", [])
    except Exception as e:
        logger.error(f"Failed to query PubMed: {e}")
        return []

def fetch_paper_metadata(pmids):
    if not pmids:
        return []
        
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "json"
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        data = response.json()
        results = data.get("result", {})
        
        papers = []
        for pmid in pmids:
            if pmid in results:
                title = results[pmid].get("title", "Unknown Title")
                papers.append({"id": pmid, "title": title})
        return papers
    except Exception as e:
        logger.error(f"Failed to fetch metadata: {e}")
        return []

def daemon_loop():
    logger.info("PubMed/arXiv Scraper Daemon Initiated.")
    while True:
        try:
            logger.info("Executing periodic literature scrape...")
            pmids = fetch_pubmed_ids(SEARCH_TERMS, MAX_RESULTS)
            papers = fetch_paper_metadata(pmids)
            
            for index, paper in enumerate(papers):
                safe_title = "".join([c for c in paper['title'] if c.isalpha() or c.isdigit() or c==' ']).rstrip()
                file_path = STORAGE_DIR / f"PMID_{paper['id']}_{safe_title[:30].replace(' ', '_')}.txt"
                
                if not file_path.exists():
                    logger.info(f"📥 New Paper Identified: {paper['title']}")
                    # Note: Downloading full PDFs from PubMed programmatically requires PubMed Central OpenAccess APIs or specialized scrapers.
                    # We generate a stub file to trigger the Qdrant vault_archiver watcher.
                    with open(file_path, "w") as f:
                        f.write(f"Title: {paper['title']}\nPMID: {paper['id']}\nStatus: Queued for full PDF resolution.")
                    logger.info(f"File cached to Hippocampus standard ingest folder.")
                else:
                    logger.debug(f"Paper already acquired: {paper['id']}")
                    
            logger.info("Cycle complete. Sleeping for 12 hours.")
            time.sleep(43200) # Sleep 12 hours
            
        except Exception as e:
            logger.error(f"Daemon crashed in main loop: {e}")
            time.sleep(300)

if __name__ == "__main__":
    daemon_loop()
