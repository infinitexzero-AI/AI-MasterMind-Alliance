import json
import chromadb
from pathlib import Path

# Paths
LEGACY_MEMORY_FILE = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/src/lib/mode6/mode6_semantic.json"

print(f"🔱 Initiating AILCC Memory Engine Migration Pipeline...")

# Initialize ChromaDB Client (HTTP to Docker container)
try:
    client = chromadb.HttpClient(host='localhost', port=8000)
    print("✅ Successfully connected to ChromaDB container at localhost:8000")
except Exception as e:
    print(f"❌ Failed to connect to ChromaDB: {e}")
    exit(1)

# Get or create the core Mastermind collection
collection_name = "ailcc_core_memory"
print(f"📁 Accessing Collection: '{collection_name}'...")
collection = client.get_or_create_collection(name=collection_name)

# Parse legacy JSON
if not Path(LEGACY_MEMORY_FILE).exists():
    print(f"❌ Legacy memory file not found: {LEGACY_MEMORY_FILE}")
    exit(1)

print(f"📖 Reading legacy contexts from: {LEGACY_MEMORY_FILE}")
with open(LEGACY_MEMORY_FILE, 'r') as f:
    legacy_data = json.load(f)

if not isinstance(legacy_data, list):
    print("❌ Expected a top-level JSON array.")
    exit(1)

print(f"🔍 Found {len(legacy_data)} semantic records. Beginning embedding and ingestion...")

# Prepare data for ChromaDB
documents = []
ids = []
metadatas = []

for i, record in enumerate(legacy_data):
    # Depending on structure, it might be a list of strings or dicts
    text = record if isinstance(record, str) else json.dumps(record)
    doc_id = f"legacy_record_{i}"
    
    documents.append(text)
    ids.append(doc_id)
    metadatas.append({"source": "mode6_semantic.json", "migrated_from": "legacy"})

# Ingest into ChromaDB
try:
    collection.upsert(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    print(f"✅ Successfully migrated {len(documents)} records into the '{collection_name}' vector space.")
    
    # Verify count
    count = collection.count()
    print(f"📊 Current Sector '{collection_name}' Document Count: {count}")
except Exception as e:
    print(f"❌ Ingestion failed: {e}")
    
print("🔱 Memory Engine Migration Complete.")
