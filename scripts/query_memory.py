import chromadb
import sys

print("🔱 Initializing AILCC Memory Telemetry...")

try:
    client = chromadb.HttpClient(host='localhost', port=8000)
except Exception as e:
    print(f"❌ Handshake with ChromaDB failed: {e}")
    sys.exit(1)

collection_name = "ailcc_core_memory"
try:
    collection = client.get_collection(name=collection_name)
    count = collection.count()
    print(f"✅ Accessed Sector '{collection_name}'. Total Semantic Vectors: {count}")
except Exception as e:
    print(f"❌ Failed to locate collection: {e}")
    sys.exit(1)

queries = [
    "Valentine integration",
    "AILCC dashboard Next.js transition",
    "OpenClaw cognitive framework",
    "Exa AI and Metaculus integration",
    "ChromaDB local vector engine"
]

print("\n🔍 Executing Historical Queries...")

for q in queries:
    print(f"\n--- 📡 Query: '{q}' ---")
    results = collection.query(
        query_texts=[q],
        n_results=2
    )
    
    if results and 'documents' in results and results['documents']:
        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i] if 'metadatas' in results and results['metadatas'] else "No metadata"
            print(f"Result {i+1} [Meta: {metadata}]:\n  {doc}\n")
    else:
        print("No matching vectors found.")

print("🔱 Telemetry Sweep Complete.")
