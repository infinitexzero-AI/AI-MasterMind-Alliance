#!/usr/bin/env python3
"""
Life Library Auto-Organizer - Watches _Inbox and auto-organizes files
"""

import os
import json
import shutil
import sqlite3
from pathlib import Path
from datetime import datetime
import time
import sys

# Add scripts directory to path for imports
sys.path.append(str(Path(__file__).parent.parent / "scripts"))
from file_classifier import LifeLibraryClassifier

class LifeLibraryOrganizer:
    def __init__(self, library_root: str, inventory_db: str):
        self.library_root = Path(library_root)
        self.inbox = self.library_root / "_Inbox"
        self.inventory_db = inventory_db
        self.classifier = LifeLibraryClassifier()
        
        # Load taxonomy
        tax_path = Path(__file__).parent.parent / "config" / "life_library_taxonomy.json"
        with open(tax_path, 'r') as f:
            self.taxonomy = json.load(f)
        self.domains = self.taxonomy['domains']
    
    def get_destination_path(self, domain: str, subdomain: str, filename: str) -> Path:
        """Get destination path for a file based on classification"""
        if domain not in self.domains:
            # Unclassified → stays in inbox
            return None
        
        domain_name = self.domains[domain]['name'].replace(' ', '_')
        domain_dir = self.library_root / domain_name
        
        if subdomain:
            dest = domain_dir / subdomain / filename
        else:
            dest = domain_dir / filename
        
        return dest
    
    def organize_file(self, file_path: Path, dry_run: bool = False) -> Dict:
        """Organize a single file from inbox"""
        # Classify
        classification = self.classifier.classify_file(
            str(file_path),
            file_path.name,
            file_path.suffix
        )
        
        domain = classification['domain']
        subdomain = classification['subdomain']
        confidence = classification['confidence']
        
        if domain is None or confidence < 0.5:
            return {
                'status': 'skipped',
                'reason': 'Low confidence or unclassified',
                'classification': classification
            }
        
        # Get destination
        dest = self.get_destination_path(domain, subdomain, file_path.name)
        
        if dest is None:
            return {
                'status': 'skipped',
                'reason': 'Could not determine destination',
                'classification': classification
            }
        
        # Check if destination exists
        if dest.exists():
            return {
                'status': 'skipped',
                'reason': f'File already exists at destination',
                'classification': classification
            }
        
        # Move file
        if not dry_run:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(file_path), str(dest))
        
        return {
            'status': 'moved',
            'source': str(file_path),
            'destination': str(dest),
            'classification': classification
        }
    
    def process_inbox(self, dry_run: bool = False) -> Dict:
        """Process all files in inbox"""
        if not self.inbox.exists():
            print(f"❌ Inbox not found: {self.inbox}")
            return {'error': 'Inbox not found'}
        
        print(f"📥 Processing inbox: {self.inbox}")
        
        files = [f for f in self.inbox.iterdir() if f.is_file() and not f.name.startswith('.')]
        
        if not files:
            print("  ℹ️  Inbox is empty")
            return {'files_processed': 0}
        
        print(f"  Found {len(files)} files to organize\n")
        
        results = {
            'moved': [],
            'skipped': [],
            'errors': []
        }
        
        for file_path in files:
            try:
                result = self.organize_file(file_path, dry_run=dry_run)
                
                if result['status'] == 'moved':
                    results['moved'].append(result)
                    domain_icon = self.domains[result['classification']['domain']]['icon']
                    print(f"  ✅ {domain_icon} {file_path.name} → {result['classification']['domain']}/{result['classification']['subdomain']}")
                elif result['status'] == 'skipped':
                    results['skipped'].append(result)
                    print(f"  ⏭️  {file_path.name} - {result['reason']}")
            except Exception as e:
                results['errors'].append({'file': str(file_path), 'error': str(e)})
                print(f"  ❌ Error processing {file_path.name}: {e}")
        
        print(f"\n📊 Summary:")
        print(f"  Moved: {len(results['moved'])}")
        print(f"  Skipped: {len(results['skipped'])}")
        print(f"  Errors: {len(results['errors'])}")
        
        return results


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Life Library Auto-Organizer')
    parser.add_argument('--library-root', type=str, default=str(Path.home() / "LifeLibrary"),
                       help='Path to Life Library root')
    parser.add_argument('--inventory-db', type=str, default='life_library_inventory_full.db',
                       help='Path to inventory database')
    parser.add_argument('--dry-run', action='store_true',
                       help='Preview organization without moving files')
    parser.add_argument('--watch', action='store_true',
                       help='Watch inbox continuously')
    
    args = parser.parse_args()
    
    organizer = LifeLibraryOrganizer(
        library_root=args.library_root,
        inventory_db=args.inventory_db
    )
    
    if args.watch:
        print("👀 Watching inbox for new files... (Ctrl+C to stop)")
        while True:
            organizer.process_inbox(dry_run=args.dry_run)
            time.sleep(30)  # Check every 30 seconds
    else:
        organizer.process_inbox(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
