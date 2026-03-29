import os
import requests
import json
from pathlib import Path

# Configuration
API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8090')
WORKSPACE_ROOT = '/Users/infinite27/AILCC_PRIME'
DIRS_TO_INDEX = ['01_Areas', '00_Projects', 'agents', 'backend', 'scripts']
EXTENSIONS = ['.md', '.txt', '.py', '.ts', '.tsx', '.js', '.json']

def should_index(file_path):
    if any(part in str(file_path) for part in ['.git', 'node_modules', '__pycache__', '.next', '.gemini']):
        return False
    return Path(file_path).suffix.lower() in EXTENSIONS

def run_indexing():
    print(f"🚀 Starting Neural Memory Sync for {WORKSPACE_ROOT}...")
    indexed_count = 0
    
    for folder in DIRS_TO_INDEX:
        folder_path = Path(WORKSPACE_ROOT) / folder
        if not folder_path.exists():
            continue
            
        print(f"📂 Scanning: {folder}")
        for file_path in folder_path.rglob('*'):
            if file_path.is_file() and should_index(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read().strip()
                        if not content:
                            continue
                            
                        # Prepare data for upsert
                        payload = {
                            "id": str(file_path.relative_to(WORKSPACE_ROOT)),
                            "content": content,
                            "metadata": {
                                "source": folder,
                                "path": str(file_path),
                                "filename": file_path.name,
                                "extension": file_path.suffix
                            }
                        }
                        
                        response = requests.post(f"{API_URL}/memory/upsert", json=payload)
                        if response.status_code == 200:
                            indexed_count += 1
                            if indexed_count % 10 == 0:
                                print(f"✅ Indexed {indexed_count} files...")
                        else:
                            print(f"❌ Failed to index {file_path.name}: {response.text}")
                            
                except Exception as e:
                    print(f"⚠️ Error reading {file_path}: {e}")

    print(f"🏁 Sync Complete. {indexed_count} documents are now live in the Neural Loop.")

if __name__ == "__main__":
    run_indexing()
