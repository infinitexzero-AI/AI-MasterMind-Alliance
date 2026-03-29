import os
import glob
from typing import List, Dict
from qdrant_client import QdrantClient
from qdrant_client.http import models
from fastembed import TextEmbedding
from tqdm import tqdm
import PyPDF2

# Configuration
VAULT_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault"
STORAGE_PATH = "/Users/infinite27/AILCC_PRIME/06_System/Hippocampus/qdrant_storage"
COLLECTION_NAME = "hippocampus_v1"

def extract_text_from_pdf(filepath: str) -> str:
    try:
        with open(filepath, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"Error reading PDF {filepath}: {e}")
        return ""

def load_documents(path: str) -> List[Dict]:
    documents = []
    
    # Check for Markdown files
    md_files = glob.glob(os.path.join(path, "**/*.md"), recursive=True)
    for file_path in md_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                documents.append({
                    "path": file_path,
                    "filename": os.path.basename(file_path),
                    "type": "markdown",
                    "content": content
                })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    # Check for PDF files
    pdf_files = glob.glob(os.path.join(path, "**/*.pdf"), recursive=True)
    for file_path in pdf_files:
        content = extract_text_from_pdf(file_path)
        if content:
             documents.append({
                    "path": file_path,
                    "filename": os.path.basename(file_path),
                    "type": "pdf",
                    "content": content
                })
                
    return documents

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    # Simple chunking for now - can be improved with recursive splitters
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        current_length += len(word) + 1
        current_chunk.append(word)
        if current_length >= chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_length = 0
            
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks

def main():
    print(f"🧠 Hippocampus Ingestion Protocol Initiated...")
    print(f"📂 Scanning Vault: {VAULT_PATH}")
    
    # 1. Initialize Qdrant (Local Persistence)
    client = QdrantClient(path=STORAGE_PATH)
    
    # 2. Create Collection if not exists
    if not client.collection_exists(COLLECTION_NAME):
        print(f"🆕 Creating collection: {COLLECTION_NAME}")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )
    else:
        print(f"♻️ Collection {COLLECTION_NAME} exists. Appending...")

    # 3. Load Documents
    docs = load_documents(VAULT_PATH)
    print(f"📄 Found {len(docs)} documents.")
    
    if not docs:
        print("⚠️ No documents found. Exiting.")
        return

    # 4. Initialize Embedding Model
    print("🤖 Loading Embedding Model (FAST-bge-small-en)...")
    embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

    # 5. Process & Index
    print("🚀 Starting Indexing Process...")
    total_vectors = 0
    
    for doc in tqdm(docs, desc="Processing Files"):
        chunks = chunk_text(doc['content'])
        
        # Generate Embeddings
        embeddings = list(embedding_model.embed(chunks))
        
        points = []
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
            points.append(models.PointStruct(
                id=total_vectors + i, # Simple ID generation
                vector=vector.tolist(),
                payload={
                    "filename": doc['filename'],
                    "path": doc['path'],
                    "type": doc['type'],
                    "chunk_index": i,
                    "text": chunk
                }
            ))
            
        # Batch Upload
        if points:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            total_vectors += len(points)

    print(f"✅ Ingestion Complete. {total_vectors} vectors stored in Hippocampus.")
    print(f"💾 Storage Location: {STORAGE_PATH}")

if __name__ == "__main__":
    main()
