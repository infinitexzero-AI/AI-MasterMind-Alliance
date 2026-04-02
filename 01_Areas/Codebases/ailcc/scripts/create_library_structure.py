#!/usr/bin/env python3
"""
Life Library Structure Creator - Creates the physical directory structure
"""

import json
from pathlib import Path
from typing import Dict, List
import shutil

class LibraryStructureCreator:
    def __init__(self, taxonomy_path: str = None):
        if taxonomy_path is None:
            taxonomy_path = Path(__file__).parent.parent / "config" / "life_library_taxonomy.json"
        
        with open(taxonomy_path, 'r') as f:
            self.taxonomy = json.load(f)
        
        self.domains = self.taxonomy['domains']
    
    def create_structure(self, base_path: str, dry_run: bool = False) -> Dict:
        """Create the Life Library directory structure"""
        base = Path(base_path)
        
        if dry_run:
            print("🏗️  DRY RUN - Directory Structure Preview")
            print("="*60)
        else:
            print("🏗️  Creating Life Library Structure")
            print("="*60)
        
        created_dirs = []
        
        # Create main library directory
        library_root = base / "LifeLibrary"
        if not dry_run and not library_root.exists():
            library_root.mkdir(parents=True)
        created_dirs.append(str(library_root))
        
        # Create _Inbox for new files
        inbox = library_root / "_Inbox"
        if not dry_run and not inbox.exists():
            inbox.mkdir()
        created_dirs.append(str(inbox))
        
        # Create domain directories
        for domain_key, domain_info in self.domains.items():
            domain_name = domain_info['name'].replace(' ', '_')
            domain_dir = library_root / domain_name
            
            if not dry_run and not domain_dir.exists():
                domain_dir.mkdir()
            created_dirs.append(str(domain_dir))
            
            # Create subdomain directories
            for subdomain in domain_info['subdomains']:
                subdomain_dir = domain_dir / subdomain
                if not dry_run and not subdomain_dir.exists():
                    subdomain_dir.mkdir()
                created_dirs.append(str(subdomain_dir))
            
            # Create _Active folder for current work
            active_dir = domain_dir / "_Active"
            if not dry_run and not active_dir.exists():
                active_dir.mkdir()
            created_dirs.append(str(active_dir))
        
        # Create metadata directory
        metadata_dir = library_root / ".metadata"
        if not dry_run and not metadata_dir.exists():
            metadata_dir.mkdir()
        created_dirs.append(str(metadata_dir))
        
        print(f"\n✅ Created {len(created_dirs)} directories")
        
        if dry_run:
            print("\n📁 Directory Structure:")
            self._print_tree(created_dirs)
        
        return {
            'base_path': str(library_root),
            'dirs_created': created_dirs,
            'dry_run': dry_run
        }
    
    def _print_tree(self, dirs: List[str], max_depth: int = 3):
        """Print directory tree"""
        # Group by parent
        tree = {}
        for d in dirs:
            parts = Path(d).parts
            if len(parts) <= max_depth + 2:  # +2 for base path
                print(f"  {'  ' * (len(parts) - 2)}📁 {parts[-1]}")
    
    def create_readme(self, library_path: str):
        """Create README in library root"""
        readme_path = Path(library_path) / "README.md"
        
        content = f"""# Joel's Life Library

**Created**: {self.taxonomy.get('created', 'N/A')}  
**Version**: {self.taxonomy.get('version', '1.0')}

## Overview

This is your personal Life Library - a comprehensive, organized knowledge architecture spanning all domains of your life.

## Domain Structure

"""
        
        for domain_key, domain_info in self.domains.items():
            icon = domain_info['icon']
            name = domain_info['name']
            desc = domain_info['description']
            
            content += f"### {icon} {name}\n\n{desc}\n\n"
            content += f"**Subdomains**: {', '.join(domain_info['subdomains'])}\n\n"
        
        content += """
## How to Use

1. **New Files**: Drop them in `_Inbox/` - they'll be auto-sorted
2. **Active Work**: Use `_Active/` folders in each domain for current projects
3. **Archive**: Older files are automatically organized by date
4. **Search**: Use the Life Library dashboard for full-text search

## Storage Tiers

- **Hot** (frequent access): Local + iCloud sync
- **Warm** (occasional): External drive  
- **Archive** (rare): Google Drive

---

*Managed by AILCC Framework*
"""
        
        readme_path.write_text(content)
        print(f"✅ Created README.md")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Create Life Library directory structure')
    parser.add_argument('--base-path', type=str, default=str(Path.home()),
                       help='Base path for Life Library')
    parser.add_argument('--dry-run', action='store_true',
                       help='Preview structure without creating')
    parser.add_argument('--with-readme', action='store_true',
                       help='Create README in library root')
    
    args = parser.parse_args()
    
    creator = LibraryStructureCreator()
    result = creator.create_structure(args.base_path, dry_run=args.dry_run)
    
    if not args.dry_run and args.with_readme:
        creator.create_readme(result['base_path'])
    
    print(f"\n📍 Library root: {result['base_path']}")


if __name__ == '__main__':
    main()
