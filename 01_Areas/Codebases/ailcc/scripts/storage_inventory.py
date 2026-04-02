#!/usr/bin/env python3
"""
Storage Inventory Scanner - Comprehensive file catalog across all platforms
Creates unified database of all files in Joel's Life Library
"""

import sqlite3
import os
import hashlib
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import subprocess

class StorageInventory:
    def __init__(self, db_path: str = "life_library_inventory.db"):
        self.db_path = db_path
        self.conn = None
        self.taxonomy = self.load_taxonomy()
        
    def load_taxonomy(self) -> Dict:
        """Load taxonomy configuration"""
        tax_path = Path(__file__).parent.parent / "config" / "life_library_taxonomy.json"
        if tax_path.exists():
            with open(tax_path, 'r') as f:
                return json.load(f)
        return {}
    
    def init_database(self):
        """Initialize SQLite database schema"""
        self.conn = sqlite3.connect(self.db_path)
        cursor = self.conn.cursor()
        
        # Main files table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                library_id TEXT UNIQUE,
                file_path TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_extension TEXT,
                file_size_bytes INTEGER,
                file_hash TEXT,
                
                domain TEXT,
                subdomain TEXT,
                tags TEXT,
                
                created_date TEXT,
                modified_date TEXT,
                accessed_date TEXT,
                scan_date TEXT,
                
                storage_location TEXT,
                storage_tier TEXT,
                is_duplicate BOOLEAN DEFAULT 0,
                duplicate_of TEXT,
                
                metadata_json TEXT,
                
                UNIQUE(file_path, storage_location)
            )
        ''')
        
        # Storage locations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS storage_locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_name TEXT UNIQUE,
                location_path TEXT,
                location_type TEXT,
                total_capacity_bytes INTEGER,
                used_space_bytes INTEGER,
                available_space_bytes INTEGER,
                last_scanned TEXT
            )
        ''')
        
        # Domain statistics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS domain_stats (
                domain TEXT PRIMARY KEY,
                file_count INTEGER,
                total_size_bytes INTEGER,
                last_updated TEXT
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_domain ON files(domain)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_storage ON files(storage_location)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_hash ON files(file_hash)')
        
        self.conn.commit()
        
    def get_storage_locations(self) -> List[Dict]:
        """Define all storage locations to scan"""
        home = Path.home()
        
        locations = [
            {
                'name': 'local_macbook',
                'path': str(home),
                'type': 'local',
                'scan_dirs': ['Desktop', 'Documents', 'Downloads']
            },
            {
                'name': 'icloud_drive',
                'path': str(home / 'Library/Mobile Documents/com~apple~CloudDocs'),
                'type': 'cloud',
                'scan_dirs': ['.']
            }
        ]
        
        # Check for external drives
        volumes = Path('/Volumes')
        if volumes.exists():
            for vol in volumes.iterdir():
                if vol.name not in ['Macintosh HD', '.timemachine']:
                    locations.append({
                        'name': f'external_{vol.name.lower().replace(" ", "_")}',
                        'path': str(vol),
                        'type': 'external',
                        'scan_dirs': ['.']
                    })
        
        return locations
    
    def calculate_file_hash(self, file_path: Path, quick: bool = True) -> Optional[str]:
        """Calculate file hash (quick mode uses first 8KB + size)"""
        try:
            if quick:
                # Quick hash: first 8KB + file size
                hasher = hashlib.md5()
                hasher.update(str(file_path.stat().st_size).encode())
                
                with open(file_path, 'rb') as f:
                    hasher.update(f.read(8192))
                
                return hasher.hexdigest()
            else:
                # Full hash
                hasher = hashlib.sha256()
                with open(file_path, 'rb') as f:
                    while chunk := f.read(8192):
                        hasher.update(chunk)
                return hasher.hexdigest()
        except:
            return None
    
    def scan_location(self, location: Dict, max_files: int = None) -> List[Dict]:
        """Scan a storage location for files"""
        files_found = []
        loc_path = Path(location['path'])
        
        if not loc_path.exists():
            print(f"  ⚠️  Location not accessible: {location['name']}")
            return []
        
        print(f"  📂 Scanning {location['name']} at {loc_path}")
        
        scan_dirs = location.get('scan_dirs', ['.'])
        
        for scan_dir in scan_dirs:
            scan_path = loc_path / scan_dir if scan_dir != '.' else loc_path
            
            if not scan_path.exists():
                continue
            
            try:
                for root, dirs, filenames in os.walk(scan_path):
                    # Skip hidden and system directories
                    dirs[:] = [d for d in dirs if not d.startswith('.') and d not in 
                             {'node_modules', '__pycache__', 'venv', '.venv'}]
                    
                    for filename in filenames:
                        if filename.startswith('.'):
                            continue
                        
                        try:
                            file_path = Path(root) / filename
                            stat = file_path.stat()
                            
                            file_info = {
                                'library_id': hashlib.md5(str(file_path).encode()).hexdigest(),
                                'file_path': str(file_path),
                                'file_name': filename,
                                'file_extension': file_path.suffix.lower(),
                                'file_size_bytes': stat.st_size,
                                'file_hash': self.calculate_file_hash(file_path, quick=True),
                                'created_date': datetime.fromtimestamp(stat.st_birthtime).isoformat() if hasattr(stat, 'st_birthtime') else None,
                                'modified_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                'accessed_date': datetime.fromtimestamp(stat.st_atime).isoformat(),
                                'scan_date': datetime.now().isoformat(),
                                'storage_location': location['name'],
                                'storage_tier': None,  # To be classified
                                'domain': None,  # To be classified
                                'subdomain': None
                            }
                            
                            files_found.append(file_info)
                            
                            if max_files and len(files_found) >= max_files:
                                print(f"  ℹ️  Reached max_files limit ({max_files})")
                                return files_found
                            
                        except (PermissionError, OSError):
                            continue
            
            except (PermissionError, OSError):
                continue
        
        print(f"  ✅ Found {len(files_found)} files in {location['name']}")
        return files_found
    
    def save_files_to_db(self, files: List[Dict]):
        """Save file inventory to database"""
        cursor = self.conn.cursor()
        
        for file_info in files:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO files (
                        library_id, file_path, file_name, file_extension,
                        file_size_bytes, file_hash, created_date, modified_date,
                        accessed_date, scan_date, storage_location, storage_tier,
                        domain, subdomain
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    file_info['library_id'],
                    file_info['file_path'],
                    file_info['file_name'],
                    file_info['file_extension'],
                    file_info['file_size_bytes'],
                    file_info['file_hash'],
                    file_info['created_date'],
                    file_info['modified_date'],
                    file_info['accessed_date'],
                    file_info['scan_date'],
                    file_info['storage_location'],
                    file_info['storage_tier'],
                    file_info['domain'],
                    file_info['subdomain']
                ))
            except sqlite3.IntegrityError:
                # File already exists
                pass
        
        self.conn.commit()
    
    def find_duplicates(self):
        """Find duplicate files based on hash"""
        cursor = self.conn.cursor()
        
        # Find files with same hash
        cursor.execute('''
            SELECT file_hash, COUNT(*) as count, 
                   GROUP_CONCAT(file_path, '|||') as paths,
                   SUM(file_size_bytes) as total_size
            FROM files 
            WHERE file_hash IS NOT NULL
            GROUP BY file_hash 
            HAVING count > 1
            ORDER BY total_size DESC
        ''')
        
        duplicates = []
        for row in cursor.fetchall():
            file_hash, count, paths_str, total_size = row
            paths = paths_str.split('|||')
            
            duplicates.append({
                'hash': file_hash,
                'count': count,
                'paths': paths,
                'wasted_bytes': total_size - (total_size // count),
                'wasted_gb': (total_size - (total_size // count)) / 1024 / 1024 / 1024
            })
        
        return duplicates
    
    def run_full_scan(self, max_files_per_location: int = None):
        """Run complete inventory scan"""
        print("="*60)
        print("📚 LIFE LIBRARY - STORAGE INVENTORY SCAN")
        print("="*60)
        
        self.init_database()
        
        locations = self.get_storage_locations()
        print(f"\n🗺️  Found {len(locations)} storage locations to scan\n")
        
        total_files = 0
        
        for location in locations:
            files = self.scan_location(location, max_files=max_files_per_location)
            self.save_files_to_db(files)
            total_files += len(files)
        
        print(f"\n📊 Scan Complete!")
        print(f"  Total files cataloged: {total_files:,}")
        
        # Find duplicates
        print(f"\n🔍 Checking for duplicates...")
        duplicates = self.find_duplicates()
        
        if duplicates:
            print(f"  Found {len(duplicates)} sets of duplicate files")
            total_wasted = sum(d['wasted_gb'] for d in duplicates)
            print(f"  Potential space savings: {total_wasted:.2f} GB")
            
            print(f"\n  Top 5 duplicate sets:")
            for i, dup in enumerate(duplicates[:5], 1):
                print(f"    {i}. {dup['count']} copies, {dup['wasted_gb']:.2f} GB wasted")
                for path in dup['paths'][:2]:
                    print(f"       - ...{path[-60:]}")
        else:
            print("  ✅ No duplicates found")
        
        print(f"\n💾 Database saved to: {self.db_path}")
        print("="*60)
    
    def get_stats(self) -> Dict:
        """Get inventory statistics"""
        cursor = self.conn.cursor()
        
        # Total files and size
        cursor.execute('SELECT COUNT(*), SUM(file_size_bytes) FROM files')
        total_files, total_size = cursor.fetchone()
        
        # By storage location
        cursor.execute('''
            SELECT storage_location, COUNT(*), SUM(file_size_bytes)
            FROM files
            GROUP BY storage_location
        ''')
        by_location = {row[0]: {'count': row[1], 'size_gb': row[2]/1024/1024/1024} 
                       for row in cursor.fetchall()}
        
        # By file type
        cursor.execute('''
            SELECT file_extension, COUNT(*), SUM(file_size_bytes)
            FROM files
            GROUP BY file_extension
            ORDER BY COUNT(*) DESC
            LIMIT 10
        ''')
        by_extension = [{'ext': row[0], 'count': row[1], 'size_gb': row[2]/1024/1024/1024} 
                        for row in cursor.fetchall()]
        
        return {
            'total_files': total_files,
            'total_size_gb': total_size / 1024 / 1024 / 1024 if total_size else 0,
            'by_location': by_location,
            'by_extension': by_extension
        }


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Life Library Storage Inventory Scanner')
    parser.add_argument('--scan-all', action='store_true',
                       help='Scan all storage locations')
    parser.add_argument('--max-files', type=int,
                       help='Maximum files to scan per location (for testing)')
    parser.add_argument('--output', type=str, default='life_library_inventory.db',
                       help='Output database file')
    
    args = parser.parse_args()
    
    inventory = StorageInventory(db_path=args.output)
    
    if args.scan_all:
        inventory.run_full_scan(max_files_per_location=args.max_files)
    else:
        print("Use --scan-all to begin inventory scan")
        print(f"Database will be saved to: {args.output}")


if __name__ == '__main__':
    main()
