import os
import json
import time

VAULT_ROOT = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault"
INDEX_OUTPUT = "/Users/infinite27/AILCC_PRIME/06_System/State/vault_index.json"

def scan_vault(root_dir):
    index = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "root": root_dir,
        "files": [],
        "stats": {
            "total_files": 0,
            "total_size_bytes": 0
        }
    }

    print(f"🔍 Scanning vault: {root_dir}")

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude hidden directories and git
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != 'node_modules']
        
        for f in filenames:
            if f.startswith('.'):
                continue
                
            full_path = os.path.join(dirpath, f)
            try:
                stat = os.stat(full_path)
                rel_path = os.path.relpath(full_path, root_dir)
                
                entry = {
                    "path": rel_path,
                    "size": stat.st_size,
                    "modified": stat.st_mtime,
                    "type": os.path.splitext(f)[1].lower()
                }
                index["files"].append(entry)
                index["stats"]["total_files"] += 1
                index["stats"]["total_size_bytes"] += stat.st_size
                
            except Exception as e:
                print(f"⚠️ Error accessing {f}: {e}")

    return index

if __name__ == "__main__":
    vault_index = scan_vault(VAULT_ROOT)
    
    with open(INDEX_OUTPUT, "w") as f:
        json.dump(vault_index, f, indent=2)
        
    print(f"✅ Index generated: {INDEX_OUTPUT}")
    print(f"📊 Stats: {vault_index['stats']['total_files']} files, {vault_index['stats']['total_size_bytes'] / (1024*1024):.2f} MB")
