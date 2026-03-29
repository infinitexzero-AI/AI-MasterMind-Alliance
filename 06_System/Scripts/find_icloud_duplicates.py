import os
import hashlib
import json

ICLOUD_PREFIX = "/Users/infinite27/Library/Mobile Documents/com~apple~CloudDocs"

def get_file_hash(path):
    # Only hash the first 1MB for speed and to avoid full downloads
    try:
        hasher = hashlib.md5()
        with open(path, 'rb') as f:
            buf = f.read(1024 * 1024)
            hasher.update(buf)
        return hasher.hexdigest()
    except:
        return None

def find_duplicates():
    files_by_size = {}
    duplicates = []
    
    for root, dirs, files in os.walk(ICLOUD_PREFIX):
        for name in files:
            path = os.path.join(root, name)
            try:
                size = os.path.getsize(path)
                if size == 0: continue
                
                if size not in files_by_size:
                    files_by_size[size] = []
                files_by_size[size].append(path)
            except:
                continue

    for size, paths in files_by_size.items():
        if len(paths) > 1:
            hashes = {}
            for path in paths:
                h = get_file_hash(path)
                if h:
                    if h not in hashes:
                        hashes[h] = []
                    hashes[h].append(path)
            
            for h, h_paths in hashes.items():
                if len(h_paths) > 1:
                    duplicates.append({
                        "hash": h,
                        "size_bytes": size,
                        "paths": h_paths
                    })
    
    return duplicates

if __name__ == "__main__":
    dupes = find_duplicates()
    with open("/Users/infinite27/AILCC_PRIME/06_System/State/icloud_duplicates.json", 'w') as f:
        json.dump(dupes, f, indent=2)
    print(f"Found {len(dupes)} duplicate sets.")
