import os
import json
import re
from pathlib import Path

CONFIG_PATH = "/Users/infinite27/AILCC_PRIME/06_System/State/digital_twin_config.json"

def load_config():
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def harvest_rag_dna(dataset):
    print("🧠 Harvesting intelligence from RAG pipeline...")
    try:
        import requests
        CHROMA_URL = "http://localhost:8123/api/v1/collections"
        res = requests.get(CHROMA_URL)
        if res.status_code != 200: return
        
        collection_id = next((c['id'] for c in res.json() if c['name'] == 'ailcc_intelligence_vault'), None)
        if not collection_id: return
        
        # Get all high-signal items (Strategic, Academic)
        get_url = f"{CHROMA_URL}/{collection_id}/get"
        payload = {"where": {"context_type": {"$in": ["Strategic", "Academic"]}}}
        res = requests.post(get_url, json=payload)
        if res.status_code != 200: return
        
        results = res.json()
        if results.get('documents'):
            for i in range(len(results['documents'])):
                content = results['documents'][i]
                metadata = results['metadatas'][i]
                topic = metadata.get('topic', 'Strategic Directive')
                
                dataset.append({
                    "instruction": f"Synthesize the strategic or academic significance of {topic}.",
                    "input": "",
                    "output": content.strip(),
                    "metadata": metadata
                })
            print(f"   ✓ Harvested {len(results['documents'])} items from RAG.")
    except Exception as e:
        print(f"⚠️ RAG harvesting failed: {e}")

def extract_high_signal_text():
    config = load_config()
    vault_path = config['vault_path']
    exclusions = config['exclusions']
    min_words = config['min_word_count']
    output_path = config['output_file']
    
    dataset = []
    print(f"🧬 Harvesting digital DNA from {vault_path}...")

    # 1. File-based harvesting
    for root, dirs, files in os.walk(vault_path):
        if any(ex in root for ex in exclusions):
            continue
            
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    word_count = len(content.split())
                    if word_count >= min_words:
                        topic = file.replace('.md', '').replace('_', ' ')
                        dataset.append({
                            "instruction": f"Explain the philosophy or technical details of {topic}.",
                            "input": "",
                            "output": re.sub(r'#+\s', '', content).strip()
                        })
                except Exception as e:
                    print(f"⚠️ Error reading {file}: {e}")

    # 2. RAG-based harvesting
    harvest_rag_dna(dataset)

    # Write to JSONL
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        for entry in dataset:
            f.write(json.dumps(entry) + '\n')
            
    print(f"✅ Extraction complete. {len(dataset)} high-signal pairs forged into {output_path}")

if __name__ == "__main__":
    extract_high_signal_text()
