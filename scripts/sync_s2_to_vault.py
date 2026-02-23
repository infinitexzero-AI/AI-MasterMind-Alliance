import sys
import os
import logging
import chromadb
from semantic_scholar import search_papers

logging.basicConfig(level=logging.INFO, format="%(asctime)s [S2-SYNC] %(message)s")

CHROMA_HOST = "localhost"
CHROMA_PORT = 8000
COLLECTION_NAME = "vault_knowledge_base"

def sync_papers_to_chroma(query: str, limit: int = 5):
    """Fetches papers from Semantic Scholar and embeds them into ChromaDB."""
    
    # 1. Fetch papers
    papers = search_papers(query, limit=limit)
    if not papers:
        logging.warning("No papers found or API error.")
        return
        
    # 2. Connect to ChromaDB
    try:
        client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
        collection = client.get_or_create_collection(name=COLLECTION_NAME)
        logging.info(f"Connected to ChromaDB collection: {COLLECTION_NAME}")
    except Exception as e:
        logging.error(f"Failed to connect to ChromaDB: {e}")
        return

    documents = []
    metadatas = []
    ids = []

    for paper in papers:
        paper_id = paper.get('paperId', 'unknown_id')
        title = paper.get('title', 'Unknown Title')
        abstract = paper.get('abstract', '')
        authors = paper.get('authors', [])
        year = paper.get('year', 'Unknown Year')
        url = paper.get('url', '')
        citations = paper.get('citationCount', 0)
        
        # Don't embed papers without abstracts since they provide very little semantic value
        if not abstract:
            logging.info(f"Skipping paper '{title}' purely due to missing abstract.")
            continue
            
        author_names = ", ".join([a.get('name', '') for a in authors])
        
        # Create a rich text document for embedding
        doc_content = f"Title: {title}\nAuthors: {author_names}\nYear: {year}\n\nAbstract:\n{abstract}"
        
        documents.append(doc_content)
        metadatas.append({
            "source": f"semantic_scholar_{paper_id}",
            "type": "academic_paper",
            "url": url,
            "title": title,
            "year": year,
            "citations": citations
        })
        ids.append(f"s2_{paper_id}")

    if documents:
        try:
            collection.upsert(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            logging.info(f"✅ Successfully inserted {len(documents)} academic papers into the Vault Knowledge Base.")
        except Exception as e:
            logging.error(f"Failed to upsert documents into ChromaDB: {e}")
            
if __name__ == "__main__":
    if len(sys.argv) > 1:
        search_query = " ".join(sys.argv[1:])
        sync_papers_to_chroma(search_query, limit=10)
    else:
        # Default test query
        sync_papers_to_chroma("Agentic Workflows Large Language Models", limit=5)
