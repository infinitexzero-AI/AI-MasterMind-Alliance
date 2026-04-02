#!/usr/bin/env python3
"""
Google Drive Sync - Sync Life Library _Active folders to Google Drive
Enables free mobile access via Google Drive app (15GB free tier)
"""

import shutil
from pathlib import Path
from datetime import datetime

class GoogleDriveSync:
    def __init__(self):
        self.library_root = Path.home() / "LifeLibrary"
        self.gdrive_root = self.find_google_drive_path()
        self.gdrive_library = self.gdrive_root / "LifeLibrary_Active" if self.gdrive_root else None
        
    def find_google_drive_path(self) -> Path:
        """Find Google Drive installation path"""
        # Try common Google Drive locations
        possible_paths = [
            Path.home() / "GoogleDrive",
            Path.home() / "Google Drive",
            Path.home() / "Library" / "CloudStorage" / "GoogleDrive-your.email@gmail.com",
        ]
        
        # Check CloudStorage for any Google Drive folder
        cloud_storage = Path.home() / "Library" / "CloudStorage"
        if cloud_storage.exists():
            for path in cloud_storage.iterdir():
                if "GoogleDrive" in path.name:
                    return path
        
        # Check standard locations
        for path in possible_paths:
            if path.exists():
                return path
        
        return None
    
    def setup_sync_structure(self):
        """Create LifeLibrary_Active folder in Google Drive"""
        if not self.gdrive_root:
            print("❌ Google Drive not found. Please install Google Drive Desktop first.")
            print("   Download: https://www.google.com/drive/download/")
            return False
        
        print(f"✅ Found Google Drive at: {self.gdrive_root}")
        
        if not self.gdrive_library.exists():
            self.gdrive_library.mkdir(parents=True)
            print(f"✅ Created: {self.gdrive_library}")
        
        return True
    
    def sync_active_folders(self, dry_run=False):
        """Sync all _Active folders to Google Drive"""
        
        if not self.setup_sync_structure():
            return
        
        active_mappings = {
            'Professional': self.library_root / 'Professional_Wing' / '_Active',
            'Academic': self.library_root / 'Academic_Wing' / '_Active',
            'AI_Tech': self.library_root / 'AI_&_Technical_Wing' / '_Active',
            'Personal': self.library_root / 'Personal_Wing' / '_Active',
            'Creative': self.library_root / 'Creative_Wing' / '_Active',
        }
        
        print(f"\n{'DRY RUN - ' if dry_run else ''}Syncing _Active folders to Google Drive...")
        print("="*60)
        
        synced = 0
        errors = []
        
        for name, source in active_mappings.items():
            if not source.exists():
                print(f"  ⚠️  {name}: Source not found, skipping")
                continue
            
            dest = self.gdrive_library / name
            
            try:
                if dry_run:
                    file_count = len(list(source.rglob('*')))
                    print(f"  📁 {name}: Would sync {file_count} items")
                else:
                    # Copy with overwrite
                    if dest.exists():
                        shutil.rmtree(dest)
                    shutil.copytree(source, dest)
                    
                    file_count = len(list(dest.rglob('*')))
                    print(f"  ✅ {name}: Synced {file_count} items")
                
                synced += 1
                
            except Exception as e:
                error_msg = f"{name}: {str(e)}"
                errors.append(error_msg)
                print(f"  ❌ {error_msg}")
        
        print("="*60)
        print(f"\n{'Would sync' if dry_run else 'Synced'} {synced} domains")
        
        if errors:
            print(f"Errors: {len(errors)}")
            for err in errors:
                print(f"  - {err}")
        
        if not dry_run:
            # Create README
            readme = self.gdrive_library / "README.txt"
            readme.write_text(f"""Life Library - Active Work

Last synced: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This folder contains your current active work from Joel's Life Library.
These folders sync to your Mac at: {self.library_root}

Domains:
- Professional: Active business/career work
- Academic: Current semester courses
- AI_Tech: Current code projects
- Personal: Recent personal documents
- Creative: Work-in-progress creative projects

To update: Run sync script on your Mac
""")
            print(f"\n✅ Created README.txt in Google Drive")
        
        return synced > 0


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Sync Life Library to Google Drive')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be synced without doing it')
    
    args = parser.parse_args()
    
    syncer = GoogleDriveSync()
    
    if not syncer.gdrive_root:
        print("\n❌ Google Drive not installed or not found")
        print("\nTo install:")
        print("1. Download: https://www.google.com/drive/download/")
        print("2. Install and sign in with your Google account")
        print("3. Run this script again")
        return
    
    print(f"\n📂 Google Drive Location: {syncer.gdrive_root}")
    print(f"📚 Life Library Location: {syncer.library_root}")
    
    syncer.sync_active_folders(dry_run=args.dry_run)
    
    if not args.dry_run:
        print(f"\n🎉 Sync complete!")
        print(f"\n📱 On iPhone:")
        print(f"   1. Open Google Drive app")
        print(f"   2. Navigate to: My Drive → LifeLibrary_Active")
        print(f"   3. Access all your active work!")


if __name__ == '__main__':
    main()
