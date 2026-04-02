import os
import zipfile
import subprocess
import datetime
import shutil

# Config
SOURCE_DIR = "/Users/infinite27/AILCC_PRIME/03_Intelligence_Vault"
OUTPUT_DIR = "/Users/infinite27/AILCC_PRIME/03_Intelligence_Vault/Mobile_Sync"
ZIP_NAME = "daily_dump.zip"
PASSWORD = "valentine_sync" 

def sync_vault():
    print(f"[Sync] ⏳ Starting Vault Sync at {datetime.datetime.now()}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    zip_path = os.path.join(OUTPUT_DIR, ZIP_NAME)
    
    # 1. Zip
    try:
        # Using subprocess for zip command to easily support password if 'zip' utility is available
        # But python zipfile is safer cross-platform. 
        # For text-based sync, standard zip is fine. 
        # User asked for 'encrypted zip'. Python's zipfile supports simple password.
        
        # Creating a temporary unencrypted zip first structure-wise, then encrypting? 
        # Actually, using 'zip -er' via subprocess is easiest on Mac for encryption.
        
        # Remove old
        if os.path.exists(zip_path):
            os.remove(zip_path)
            
        cmd = ["zip", "-r", "-P", PASSWORD, zip_path, "."]
        
        print(f"[Sync] Zipping {SOURCE_DIR}...")
        subprocess.run(cmd, cwd=SOURCE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True)
        
        size_mb = os.path.getsize(zip_path) / (1024 * 1024)
        print(f"[Sync] ✅ Success! Created {zip_path} ({size_mb:.2f} MB)")
        
        if size_mb > 50:
            print("[Sync] ⚠️ Warning: File size exceeds 50MB target.")

    except Exception as e:
        print(f"[Sync] ❌ Error: {e}")

if __name__ == "__main__":
    sync_vault()
