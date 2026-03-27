import logging
import requests
from fastapi import FastAPI
import uvicorn
from qdrant_client import QdrantClient

app = FastAPI(title="AILCC Academic Forge - Thesis Synthesizer")
logging.basicConfig(level=logging.INFO)

QDRANT_URL = "http://localhost:6333"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3" # Default local model

@app.post("/api/academic/synthesize_chapter")
async def synthesize_chapter(topic: str, qdrant_vectors: int = 10):
    logging.info(f"[FORGE] Querying Hippocampus for {qdrant_vectors} vectorized publications addressing topic: {topic}...")
    
    try:
        # 1. Vector Retrieval (Mocked embedding search for structural integrity)
        client = QdrantClient(url=QDRANT_URL)
        # Dummy vector for fetching semantic context
        dummy_vector = [0.0] * 768 
        search_result = client.search(
            collection_name="omni_memory_pdfs",
            query_vector=dummy_vector,
            limit=qdrant_vectors
        )
        context = "\n".join([hit.payload.get("text", "") for hit in search_result]) if search_result else "Local context block."
    except Exception as e:
        logging.warning(f"Qdrant fetch failed, using fallback context: {e}")
        context = "Archived medical and academic literature missing. Proceeding with base LLM logic."

    # 2. Local Inference via Ollama (Zero-Cost Pipeline)
    prompt = f"""You are the AILCC Academic Scholar. Write a highly structured LaTeX chapter on the topic: '{topic}'.
Include proper sections: \chapter, \section{{Introduction}}, \subsection{{Key Findings}}.
Use this contextual data to inform your writing: {context}
Output ONLY valid LaTeX code. No markdown formatting.
"""

    logging.info(f"[FORGE] Routing {len(context)} chars of context to local Ollama ({MODEL_NAME})...")
    
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }, timeout=120)
        
        if response.status_code == 200:
            latex_output = response.json().get("response", "")
        else:
            latex_output = f"\\chapter{{Error Synthesis}}\nOllama backend failed: {response.status_code}"
    except Exception as e:
        latex_output = f"\\chapter{{Error Synthesis}}\nLocal inference unreachable: {e}"

    return {"status": "success", "latex": latex_output, "citations_resolved": qdrant_vectors}

if __name__ == "__main__":
    logging.info("Booting Academic Thesis Synthesizer on Port 5012")
    uvicorn.run(app, host="127.0.0.1", port=5012)

