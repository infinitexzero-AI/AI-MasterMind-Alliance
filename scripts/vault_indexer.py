import os
import json
import redis
import datetime
from pathlib import Path

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
VAULT_PATH = '/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault'
REDIS_KEY = 'vault:index'

def extract_metadata(file_path):
    stats = os.stat(file_path)
    metadata = {
        "name": os.path.basename(file_path),
        "path": file_path,
        "size": stats.st_size,
        "last_modified": datetime.datetime.fromtimestamp(stats.st_mtime).isoformat(),
        "type": Path(file_path).suffix.lower().replace('.', '')
    }
    
    # Text-based extraction for summaries
    if metadata['type'] in ['md', 'txt', 'py', 'json']:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read(2000) # Read first 2KB
                
                if metadata['type'] == 'md':
                    lines = content.split('\n')
                    # Extract title from # header
                    for line in lines:
                        if line.startswith('# '):
                            metadata['title'] = line[2:].strip()
                            break
                    # Extract summary (first non-empty, non-header line)
                    for line in lines:
                        line = line.strip()
                        if line and not line.startswith('#') and not line.startswith('!['):
                            metadata['summary'] = line[:200]
                            break
                elif metadata['type'] == 'json':
                    try:
                        data = json.loads(content)
                        if isinstance(data, dict):
                            metadata['title'] = data.get('title', data.get('name', metadata['name']))
                            metadata['summary'] = data.get('description', data.get('summary', 'JSON Data Object'))
                    except:
                        pass
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    if 'title' not in metadata:
        metadata['title'] = metadata['name']
    if 'summary' not in metadata:
        metadata['summary'] = f"No summary available for {metadata['type']} file."

    return metadata

def run_indexer():
    print(f"Starting indexer on {VAULT_PATH}...")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        
        index_data = []
        for root, dirs, files in os.walk(VAULT_PATH):
            if 'node_modules' in root or '.git' in root:
                continue
                
            for file in files:
                if file.startswith('.'):
                    continue
                
                full_path = os.path.join(root, file)
                print(f"Indexing: {file}")
                meta = extract_metadata(full_path)
                index_data.append(meta)

        # Store in Redis
        r.set(REDIS_KEY, json.dumps(index_data))
        print(f"Successfully indexed {len(index_data)} files into Redis key '{REDIS_KEY}'")

    except Exception as e:
        print(f"Fatal error during indexing: {e}")

if __name__ == "__main__":
    run_indexer()
