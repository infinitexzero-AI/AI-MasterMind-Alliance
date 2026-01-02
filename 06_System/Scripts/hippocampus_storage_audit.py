import os
import json
import time
from pathlib import Path

# Configuration
SEARCH_PATHS = [
    str(Path.home() / "AILCC_PRIME"),
    str(Path.home() / "Library/Mobile Documents/com~apple~CloudDocs"),
    str(Path.home() / "Documents")
]
SIZE_THRESHOLD_MB = 20  # Files larger than this are interesting
AGE_THRESHOLD_DAYS = 180  # Files older than this are archival candidates

def audit_storage():
    results = {
        "large_files": [],
        "archival_candidates": [],
        "summary": {
            "total_size_gb": 0,
            "large_files_count": 0,
            "archival_count": 0
        }
    }
    
    current_time = time.time()
    
    for base_path in SEARCH_PATHS:
        if not os.path.exists(base_path):
            continue
            
        for root, dirs, files in os.walk(base_path):
            for name in files:
                file_path = os.path.join(root, name)
                try:
                    stat = os.stat(file_path)
                    size_mb = stat.st_size / (1024 * 1024)
                    mtime = stat.st_mtime
                    age_days = (current_time - mtime) / (24 * 3600)
                    
                    file_info = {
                        "path": file_path,
                        "size_mb": round(size_mb, 2),
                        "age_days": round(age_days, 1),
                        "last_modified": time.ctime(mtime)
                    }
                    
                    if size_mb > SIZE_THRESHOLD_MB:
                        results["large_files"].append(file_info)
                        results["summary"]["large_files_count"] += 1
                        
                    if age_days > AGE_THRESHOLD_DAYS:
                        results["archival_candidates"].append(file_info)
                        results["summary"]["archival_count"] += 1
                        
                    results["summary"]["total_size_gb"] += size_mb / 1024
                    
                except (PermissionError, FileNotFoundError):
                    continue

    # Sort results
    results["large_files"].sort(key=lambda x: x["size_mb"], reverse=True)
    results["archival_candidates"].sort(key=lambda x: x["age_days"], reverse=True)
    
    results["summary"]["total_size_gb"] = round(results["summary"]["total_size_gb"], 2)
    
    output_path = Path.home() / "AILCC_PRIME/06_System/State/hippocampus_audit_results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=4)
        
    print(f"Audit complete. Results saved to {output_path}")
    print(f"Total size audited: {results['summary']['total_size_gb']} GB")
    print(f"Large files (> {SIZE_THRESHOLD_MB}MB) found: {results['summary']['large_files_count']}")
    print(f"Archival candidates (> {AGE_THRESHOLD_DAYS} days) found: {results['summary']['archival_count']}")

if __name__ == "__main__":
    audit_storage()
