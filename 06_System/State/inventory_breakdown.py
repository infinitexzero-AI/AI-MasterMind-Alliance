from pathlib import Path
from collections import defaultdict
import os

ROOT = Path("/Volumes/XDriveAlpha/Organized_Memory_Bank")

stats = defaultdict(lambda: defaultdict(int))
total = 0

print(f"Scanning {ROOT}...")

for root, dirs, files in os.walk(ROOT):
    for file in files:
        if file.startswith('.'): continue
        path_parts = Path(root).parts
        
        # Expect: .../Organized_Memory_Bank/Category/YYYY/MM
        try:
            # Find index of ROOT in parts to get relative path
            idx = path_parts.index("Organized_Memory_Bank")
            if len(path_parts) > idx + 2:
                category = path_parts[idx + 1]
                year = path_parts[idx + 2]
                stats[category][year] += 1
        except ValueError:
            pass
        total += 1

print("\n📊 SECURED VAULT INVENTORY (Granular)")
print("====================================")
print(f"Total Files: {total}")

for cat in sorted(stats.keys()):
    print(f"\n📂 {cat}:")
    for year in sorted(stats[cat].keys()):
        print(f"  └── {year}: {stats[cat][year]} items")
