import os
import json

DUPLICATES_FILE = "/Users/infinite27/AILCC_PRIME/06_System/State/icloud_duplicates.json"

def purge_duplicates():
    if not os.path.exists(DUPLICATES_FILE):
        print("No duplicates file found.")
        return

    with open(DUPLICATES_FILE, 'r') as f:
        dupes = json.load(f)

    deleted_count = 0
    reclaimed_bytes = 0

    for set in dupes:
        # Keep the first path, delete the rest
        original = set['paths'][0]
        redundant = set['paths'][1:]
        
        for path in redundant:
            try:
                if os.path.exists(path):
                    size = os.path.getsize(path)
                    os.remove(path)
                    print(f"Deleted duplicate: {path}")
                    deleted_count += 1
                    reclaimed_bytes += size
                else:
                    print(f"File already gone: {path}")
            except Exception as e:
                print(f"Failed to delete {path}: {e}")

    print(f"\nPurge Summary:")
    print(f"Duplicates deleted: {deleted_count}")
    print(f"Space reclaimed: {reclaimed_bytes / (1024*1024):.2f} MB")

if __name__ == "__main__":
    purge_duplicates()
