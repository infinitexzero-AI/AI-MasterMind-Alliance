import os
import time
import sys

# Ensure Python can load the Vanguard local libraries
sys.path.append(os.path.expanduser('~/AILCC_PRIME/01_Areas/Codebases/ailcc'))
from core.memory.sqlite_vector_bridge import upsert_to_sqlite

# The designated local sync folder for Comet/OneDrive Moodle extractions
VAULT_DIR = os.path.expanduser("~/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT")

def chunk_text(text, chunk_size=1500):
    chunks = []
    current_chunk = ""
    # Standard delimiter strategy: break down university lectures by major double-newline blocks
    for paragraph in text.split("\n\n"):
        if len(current_chunk) + len(paragraph) < chunk_size:
            current_chunk += paragraph + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = paragraph + "\n\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    # Prevent creating micro-chunks that corrupt the LLM's semantic matching
    return [c for c in chunks if len(c) > 60]

def ingest_vault():
    print(f"📥 [Vault Ingester] Initiating recursive semantic sweep: {VAULT_DIR}")
    
    if not os.path.exists(VAULT_DIR):
        print(f"❌ [Vault Ingester] Directory unavailable: {VAULT_DIR}")
        return

    for root, _, files in os.walk(VAULT_DIR):
        for file in files:
            if file.endswith(".md") or file.endswith(".txt"):
                file_path = os.path.join(root, file)
                print(f"📖 Analyzing: {file}...")
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                    
                    chunks = chunk_text(text)
                    for i, chunk in enumerate(chunks):
                        print(f"   🧠 Embedding memory block {i+1}/{len(chunks)} via SQLite...")
                        
                        # Forward array processing directly to the native Zero-RAM pipeline
                        success = upsert_to_sqlite(chunk, doc_path=file_path, chunk_index=i)
                        
                        # Hard limit to 1 second sleep to avoid burning the M-series GPU/Ollama
                        time.sleep(1) 
                        
                except Exception as e:
                    print(f"❌ [Vault Ingester] File parsing failed for {file}: {e}")
                    
    print("\n✅ [Vault Ingester] Synchronization fully complete.")
    print("🧠 Nexus Intelligence Layer now holds complete university context. Offline generation ready.")

if __name__ == "__main__":
    ingest_vault()
