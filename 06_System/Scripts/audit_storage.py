import os
import time

def audit_storage(root_path, threshold_mb=50):
    candidates = []
    print(f"Auditing {root_path} for files > {threshold_mb}MB...")
    
    for dirpath, dirnames, filenames in os.walk(root_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            try:
                size = os.path.getsize(fp) / (1024 * 1024)
                if size > threshold_mb:
                    atime = time.ctime(os.path.getatime(fp))
                    candidates.append({
                        "path": fp,
                        "size_mb": size,
                        "last_access": atime
                    })
            except (OSError, PermissionError):
                continue
                
    candidates.sort(key=lambda x: x['size_mb'], reverse=True)
    return candidates

if __name__ == "__main__":
    # Standard directories to audit based on STORAGE_ALLOCATION_MANIFEST.md
    paths_to_audit = [
        os.path.expanduser("~/AILCC_PRIME"),
        os.path.expanduser("~/Downloads"),
        os.path.expanduser("~/Desktop"),
        os.path.expanduser("~/Documents/AI-Mastermind-Alliance-2025")
    ]
    
    with open("audit_results.txt", "w") as f:
        for p in paths_to_audit:
            if os.path.exists(p):
                results = audit_storage(p)
                f.write(f"\n--- Results for {p} ---\n")
                for item in results:
                    f.write(f"{item['size_mb']:.2f} MB | {item['last_access']} | {item['path']}\n")
    
    print("Audit complete. Results saved to audit_results.txt")
