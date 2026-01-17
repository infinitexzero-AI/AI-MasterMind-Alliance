import os
import shutil
import datetime
from pathlib import Path
import re

# Config
ICLOUD_DRIVE = Path("/Users/infinite27/Library/Mobile Documents/com~apple~CloudDocs")
PHOTOS_LIB = Path("/Users/infinite27/Dec. 28th 2025 .photoslibrary")
TARGET_VAULT = Path("/Volumes/XDriveAlpha/Organized_Memory_Bank")
TARGET_DOCS = Path("/Volumes/XDriveAlpha/Vault/Documents/iCloud_Drive_Archive")

def sanitize_filename(name):
    """Scorched Earth sanitization for ExFAT."""
    # 1. Replace anything that is NOT (a-z, A-Z, 0-9, ., -, _) with '_'
    name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
    # 2. Collapse multiple underscores
    name = re.sub(r'_+', '_', name)
    # 3. Strip leading/trailing underscores or dots
    name = name.strip('._')
    if not name: name = "unnamed_file"
    return name

def evacuate_drive():
    print(f"🚀 Evacuating iCloud Drive: {ICLOUD_DRIVE}")
    if not ICLOUD_DRIVE.exists():
        print("❌ iCloud Drive path not found.")
        return

    count = 0
    TARGET_DOCS.mkdir(parents=True, exist_ok=True)

    for root, dirs, files in os.walk(ICLOUD_DRIVE):
        for file in files:
            if file.startswith('.'): continue
            
            src = Path(root) / file
            # Relative path preservation
            try:
                rel_path = src.relative_to(ICLOUD_DRIVE)
            except ValueError:
                rel_path = Path(file)

            # Sanitize each part of the relative path
            safe_parts = [sanitize_filename(p) for p in rel_path.parts]
            dest = TARGET_DOCS / Path(*safe_parts)
            
            dest.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                if dest.exists():
                     pass 
                else:
                    try:
                        shutil.copy2(src, dest)
                    except OSError as e:
                        if e.errno == 22: # Invalid Argument (Metadata issue on ExFAT)
                            print(f"⚠️ Metadata copy failed for {file}, using data-only copy...")
                            shutil.copyfile(src, dest)
                        else:
                            raise e
                            
                    count += 1
                    if count % 50 == 0: print(f"✅ Evacuated {count} files...")
            except Exception as e:
                # If still failing, try keeping base name only as last resort
                try:
                    flat_name = sanitize_filename(f"{rel_path.parent}_{file}".replace('/', '_'))
                    dest_flat = TARGET_DOCS / "Fallback_Rescue" / flat_name
                    dest_flat.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src, dest_flat)
                    print(f"⚠️ Rescued tricky file to Fallback: {flat_name}")
                except Exception as e2:
                    print(f"❌ Failed to copy {file}: {e}")
                
    print(f"🎉 Drive Evacuation Complete. {count} files secured.")

def get_file_hash(filepath):
    import hashlib
    """Calculate SHA256 hash of a file."""
    hasher = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        return hasher.hexdigest()
    except:
        return None

def evacuate_photos():
    print(f"🚀 Probing Photos Library: {PHOTOS_LIB}")
    
    originals_dirs = [
        PHOTOS_LIB / "originals",
        PHOTOS_LIB / "Masters"
    ]
    
    found_any = False
    count = 0
    
    for search_root in originals_dirs:
        if not search_root.exists(): continue
        found_any = True
        
        print(f"🔍 Scanning internal folder: {search_root.name}...")
        for root, dirs, files in os.walk(search_root):
            for file in files:
                if file.lower().endswith(('.heic', '.jpg', '.jpeg', '.png', '.mov', '.mp4')):
                    src = Path(root) / file
                    
                    try:
                        stat = os.stat(src)
                        date = datetime.datetime.fromtimestamp(stat.st_mtime)
                        year = date.strftime("%Y")
                        month = date.strftime("%m")
                        
                        ext = src.suffix.lower()
                        if ext in ['.png']: cat = 'Screenshots'
                        elif ext in ['.mov', '.mp4']: cat = 'Videos'
                        else: cat = 'Camera_Roll'
                        
                        dest_dir = TARGET_VAULT / cat / year / month
                        dest_dir.mkdir(parents=True, exist_ok=True)
                        
                        safe_name = sanitize_filename(file)
                        dest_file = dest_dir / safe_name
                        
                        if not dest_file.exists():
                            try:
                                shutil.copy2(src, dest_file)
                            except OSError as e:
                                if e.errno == 22: 
                                    shutil.copyfile(src, dest_file)
                                else:
                                    raise e
                                    
                            count += 1
                            if count % 100 == 0: print(f"📸 Recovered {count} Photos/Videos...")
                    except Exception as e:
                        print(f"❌ Photo Error {file}: {e}")
                            
    if not found_any:
        print("⚠️ 'originals' folder not found. Doing deep scan of package...")
        
    print(f"🎉 Photos Evacuation Complete. {count} recovered.")

if __name__ == "__main__":
    evacuate_drive()
    evacuate_photos()
