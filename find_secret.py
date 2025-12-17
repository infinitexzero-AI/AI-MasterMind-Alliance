import os
import json

def find_secrets():
    search_roots = [
        '.',
        os.path.expanduser('~/Downloads'), 
        os.path.expanduser('~/01_Areas'),
        os.path.expanduser('~/Documents'),
        os.path.expanduser('~/Desktop'),
        os.path.expanduser('~/Library/Mobile Documents/com~apple~CloudDocs'),
        '/Volumes/LaCie',
        '/Volumes/HardDrive'
    ]
    keywords = ["client_secret", "installed", "web"]
    
    print(f"Searching for JSON files containing {keywords}...")
    
    for root_dir in search_roots:
        if not os.path.exists(root_dir): 
            print(f"⚠️ Skipping missing root: {root_dir}")
            continue
            
        print(f"Scanning {root_dir}...")
        
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Exclude common ignores regarding performance and permission
            dirnames[:] = [d for d in dirnames if d not in ['.venv', 'node_modules', '.git', 'Library', 'Applications', '.Trash', 'System', 'bin', 'usr', 'sbin']]
            
            for filename in filenames:
                if filename.endswith('.json'):
                    full_path = os.path.join(dirpath, filename)
                    try:
                        # Optimization: Check filename first
                        if "secret" in filename or "credential" in filename or "oauth" in filename:
                             print(f"Match by name: {full_path}")
                        
                        # Check content
                        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read(1024) # Read first 1kb to catch keys
                            if '"client_secret"' in content and '"client_id"' in content:
                                print(f"✅ FOUND MATCH: {full_path}")
                    except Exception:
                        pass

if __name__ == "__main__":
    find_secrets()
