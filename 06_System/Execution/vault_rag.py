import os
import json
import re
from datetime import datetime

VAULT_PATH = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault"
RAG_INDEX = "/Users/infinite27/AILCC_PRIME/06_System/State/vault_index.json"

def clean_text(text):
    return re.sub(r'[^\w\s]', '', text.lower())

def build_index():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🧠 Building Semantic Vault Index...")
    index = {
        "metadata": {
            "last_updated": datetime.now().isoformat(),
            "file_count": 0
        },
        "entries": []
    }
    
    for root, dirs, files in os.walk(VAULT_PATH):
        for file in files:
            if file.endswith(('.md', '.json', '.txt')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Basic summary extraction (first 200 chars)
                    summary = content[:200].replace('\n', ' ') + "..."
                    
                    index["entries"].append({
                        "filename": file,
                        "path": path,
                        "content_preview": summary,
                        "keywords": list(set(clean_text(content).split()))[:50] # Top words
                    })
                    index["metadata"]["file_count"] += 1
                except Exception as e:
                    print(f"Error indexing {file}: {e}")

    with open(RAG_INDEX, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"✅ Indexing Complete. {index['metadata']['file_count']} files mapped to RAG.")

def query_vault(query):
    if not os.path.exists(RAG_INDEX):
        build_index()
    
    with open(RAG_INDEX, 'r') as f:
        index = json.load(f)
    
    query_words = clean_text(query).split()
    results = []
    
    for entry in index["entries"]:
        score = sum(1 for word in query_words if word in entry["keywords"])
        if score > 0:
            results.append({"filename": entry["filename"], "score": score, "preview": entry["content_preview"]})
    
    # Sort by score
    results = sorted(results, key=lambda x: x['score'], reverse=True)[:5]
    return results

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        q = " ".join(sys.argv[1:])
        res = query_vault(q)
        print(json.dumps(res, indent=2))
    else:
        build_index()
