import os
import shutil
import datetime
import zipfile
from pathlib import Path

import hashlib

def get_file_hash(filepath):
    """Calculate SHA256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

# Configuration
SOURCE_DIR = Path("/Volumes/XDriveAlpha/iCloud_Offload_2026_01_14")
VAULT_ROOT = Path("/Volumes/XDriveAlpha/Organized_Memory_Bank")
TARGET_BASE = VAULT_ROOT  # Alias for backward compatibility
DUPLICATES_DIR = Path("/Volumes/XDriveAlpha/Vault/Duplicates")
DOCS_DIR = Path("/Volumes/XDriveAlpha/Vault/Documents") # PDFs, text, etc.

EXTENSIONS = {
    # We will handle Images specifically below for sub-categorization
    'Videos': ['.mov', '.mp4', '.avi', '.m4v', '.mkv', '.webm'],
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.md', '.pages', '.xls', '.xlsx', '.csv'],
    'Audio': ['.mp3', '.m4a', '.wav', '.flac'],
    'Archives': ['.zip', '.tar', '.gz', '.7z']
}

def get_date(file_path):
    # TODO: Add EXIF reading for accurate photo dates if needed
    try:
        stat = os.stat(file_path)
        timestamp = getattr(stat, 'st_birthtime', stat.st_mtime)
        return datetime.datetime.fromtimestamp(timestamp)
    except:
        return datetime.datetime.now()

def organize():
    print(f"🚀 Starting Deep Cleanup on {SOURCE_DIR}...")
    
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ Source not found: {SOURCE_DIR}")
        return

    count = 0
    
    # Second Pass: Organize Everything
    for root, _, files in os.walk(SOURCE_DIR):
        for file in files:
            file_path = Path(root) / file
            if file.startswith('.'): continue
            
            # Skip if we are already in the target directory
            if TARGET_BASE in str(file_path):
                continue
            
            suffix = file_path.suffix.lower()
            category = 'Others'
            
            # Granular Category Logic
            if suffix in ['.png']:
                category = 'Screenshots'
            elif suffix in ['.heic']:
                category = 'Camera_Roll'
            elif suffix in ['.jpg', '.jpeg', '.webp']:
                # Could be downloads or saved images
                category = 'Saved_Images'
            else:
                for cat, exts in EXTENSIONS.items():
                    if suffix in exts:
                        category = cat
                        break
            
            if category == 'Others':
                print(f"⚠️ Skipping/Uncategorized: {file} ({suffix})")
                continue

            print(f"ℹ️ Processing: {file} -> {category}")

            date_obj = get_date(file_path)
            # Requested Format: YYYY/MM (e.g., 2026/01)
            year_month = date_obj.strftime("%Y/%m")
            
            target_dir = Path(TARGET_BASE) / category / year_month
            target_dir.mkdir(parents=True, exist_ok=True)
            
            target_path = target_dir / file
            


# ... (inside organize function loop) ...
            
            # 1. Hashing Check (The "Perfect" Deduplication)
            # Check if file exists at target name
            target_file_to_check = target_path
            
            if target_path.exists():
                print(f"🔍 Collision at {target_path.name}. Checking Identity...")
                src_hash = get_file_hash(file_path)
                tgt_hash = get_file_hash(target_path)
                
                if src_hash == tgt_hash:
                    print(f"♻️ DUPLICATE DETECTED: {file.name} is identical. Safe to delete source.")
                    # Optionally delete source or just skip
                    # os.remove(file_path) # Risky without explicit user consent for 'move'
                    # But since we are 'moving', we can effectively 'skip' the move and delete source?
                    # For safety, we will move to a 'Duplicates' folder instead.
                    duplicate_dir = Path(TARGET_BASE) / "Duplicates" / category / year_month
                    duplicate_dir.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(file_path), str(duplicate_dir / file))
                    print(f"🗑️ Started aside as Duplicate.")
                    continue
                else:
                    print(f"📝 Collision but Content Differs. Renaming...")
                    timestamp = int(datetime.datetime.now().timestamp())
                    target_path = target_dir / f"{file_path.stem}_{timestamp}{file_path.suffix}"

            try:
                shutil.move(str(file_path), str(target_path))
                count += 1
                if count % 100 == 0: print(f"✅ Sorted {count} files...")
            except Exception as e:
                print(f"❌ Error moving {file}: {e}")

    print(f"\n🎉 Cleanup Complete! {count} files organized in {TARGET_BASE}")

if __name__ == "__main__":
    organize()
