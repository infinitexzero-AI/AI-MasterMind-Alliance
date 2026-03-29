import os

path = "/Volumes/XDriveAlpha/iCloud_Offload_2026_01_14"
print(f"Scanning {path}...")
try:
    with os.scandir(path) as it:
        for entry in it:
            print(f"Found: {entry.name}")
            break
    print("Scan initialized successfully.")
except Exception as e:
    print(f"Error: {e}")
