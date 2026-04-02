#!/usr/bin/env python3
"""
Storage Migrator - Safely migrate files to external drive
Features: checksum verification, symlinks, rollback capability
"""

import os
import json
import shutil
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import subprocess

class StorageMigrator:
    def __init__(self, external_drive: str = "/Volumes/LaCie", log_file: str = "migration.log"):
        self.external_drive = Path(external_drive)
        self.log_file = Path(log_file)
        self.operations = []
        
        # Migration structure on external drive
        self.migration_paths = {
            'photos': self.external_drive / 'Media' / 'Photos',
            'videos': self.external_drive / 'Media' / 'Videos',
            'photo_library': self.external_drive / 'Media' / 'PhotoLibraries',
            'documents': self.external_drive / 'Documents',
            'archives': self.external_drive / 'Archives',
            'applications': self.external_drive / 'Applications',
            'other': self.external_drive / 'Other'
        }
    
    def verify_external_drive(self) -> bool:
        """Verify external drive is mounted and writable"""
        if not self.external_drive.exists():
            print(f"❌ External drive not found at {self.external_drive}")
            print("   Please ensure the drive is mounted.")
            return False
        
        # Test write permissions
        test_file = self.external_drive / '.write_test'
        try:
            test_file.write_text('test')
            test_file.unlink()
            print(f"✅ External drive verified: {self.external_drive}")
            return True
        except Exception as e:
            print(f"❌ Cannot write to external drive: {e}")
            return False
    
    def create_directory_structure(self):
        """Create migration directory structure on external drive"""
        print("📁 Creating directory structure...")
        for category, path in self.migration_paths.items():
            path.mkdir(parents=True, exist_ok=True)
            print(f"  ✓ {path}")
    
    def calculate_checksum(self, file_path: Path) -> str:
        """Calculate SHA256 checksum of file"""
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            while chunk := f.read(8192):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    def migrate_file(self, source: Path, category: str, create_symlink: bool = True, 
                    dry_run: bool = False) -> Dict:
        """
        Migrate a single file to external drive
        
        Args:
            source: Source file path
            category: File category (photos, videos, etc.)
            create_symlink: Create symlink at original location
            dry_run: Don't actually move files, just simulate
        
        Returns:
            Operation record dict
        """
        if category not in self.migration_paths:
            category = 'other'
        
        dest_dir = self.migration_paths[category]
        dest = dest_dir / source.name
        
        # Handle filename conflicts
        counter = 1
        while dest.exists():
            stem = source.stem
            suffix = source.suffix
            dest = dest_dir / f"{stem}_{counter}{suffix}"
            counter += 1
        
        operation = {
            'timestamp': datetime.now().isoformat(),
            'source': str(source),
            'destination': str(dest),
            'category': category,
            'size_bytes': source.stat().st_size,
            'status': 'pending',
            'checksum_source': None,
            'checksum_dest': None,
            'symlink_created': False
        }
        
        if dry_run:
            operation['status'] = 'dry_run'
            print(f"  [DRY RUN] Would migrate: {source.name} → {dest}")
            return operation
        
        try:
            # Calculate source checksum
            print(f"  📝 Calculating checksum for {source.name}...")
            operation['checksum_source'] = self.calculate_checksum(source)
            
            # Copy file to external drive
            print(f"  📦 Copying to {dest}...")
            shutil.copy2(source, dest)
            
            # Verify destination checksum
            print(f"  ✓ Verifying integrity...")
            operation['checksum_dest'] = self.calculate_checksum(dest)
            
            if operation['checksum_source'] != operation['checksum_dest']:
                raise Exception("Checksum mismatch! File may be corrupted.")
            
            # Remove original file
            print(f"  🗑️  Removing original...")
            source.unlink()
            
            # Create symlink if requested
            if create_symlink:
                print(f"  🔗 Creating symlink...")
                source.symlink_to(dest)
                operation['symlink_created'] = True
            
            operation['status'] = 'success'
            print(f"  ✅ Migration complete: {source.name}")
            
        except Exception as e:
            operation['status'] = 'failed'
            operation['error'] = str(e)
            print(f"  ❌ Migration failed: {e}")
            
            # Cleanup on failure
            if dest.exists():
                dest.unlink()
        
        self.operations.append(operation)
        return operation
    
    def migrate_from_report(self, report_path: str, categories: List[str] = None,
                           max_files: int = None, dry_run: bool = False,
                           auto_approve: bool = False) -> Dict:
        """
        Migrate files based on storage analysis report
        
        Args:
            report_path: Path to storage_report.json
            categories: List of categories to migrate (None = all)
            max_files: Maximum number of files to migrate
            dry_run: Simulate migration without actually moving files
            auto_approve: Skip confirmation prompts
        """
        print(f"\n{'='*60}")
        print(f"📦 STORAGE MIGRATION {'(DRY RUN)' if dry_run else ''}")
        print(f"{'='*60}\n")
        
        # Load report
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        # Filter categories
        if categories is None:
            categories = list(report['recommendations'].keys())
        
        # Collect files to migrate
        files_to_migrate = []
        for category in categories:
            if category in report['recommendations']:
                for file_info in report['recommendations'][category]:
                    files_to_migrate.append((Path(file_info['path']), category))
        
        if max_files:
            files_to_migrate = files_to_migrate[:max_files]
        
        if not files_to_migrate:
            print("No files to migrate.")
            return {'total': 0, 'success': 0, 'failed': 0}
        
        # Calculate total size
        total_size_gb = sum(Path(f[0]).stat().st_size for f in files_to_migrate) / 1024 / 1024 / 1024
        
        print(f"📊 Migration Summary:")
        print(f"  Files to migrate: {len(files_to_migrate)}")
        print(f"  Total size: {total_size_gb:.2f} GB")
        print(f"  Categories: {', '.join(set(c for _, c in files_to_migrate))}")
        
        # Get user confirmation
        if not dry_run and not auto_approve:
            response = input("\n⚠️  Proceed with migration? (yes/no): ")
            if response.lower() not in ('yes', 'y'):
                print("Migration cancelled.")
                return {'total': 0, 'success': 0, 'failed': 0, 'cancelled': True}
        
        # Create directory structure
        if not dry_run:
            self.create_directory_structure()
        
        # Migrate files
        results = {'total': len(files_to_migrate), 'success': 0, 'failed': 0}
        
        for i, (source, category) in enumerate(files_to_migrate, 1):
            print(f"\n[{i}/{len(files_to_migrate)}] Migrating {source.name}...")
            
            if not source.exists():
                print(f"  ⚠️  File no longer exists, skipping.")
                results['failed'] += 1
                continue
            
            operation = self.migrate_file(source, category, create_symlink=True, dry_run=dry_run)
            
            if operation['status'] == 'success' or operation['status'] == 'dry_run':
                results['success'] += 1
            else:
                results['failed'] += 1
        
        # Save migration log
        self.save_log()
        
        print(f"\n{'='*60}")
        print(f"📊 MIGRATION COMPLETE")
        print(f"{'='*60}")
        print(f"  Total: {results['total']}")
        print(f"  Success: {results['success']}")
        print(f"  Failed: {results['failed']}")
        print(f"  Log saved to: {self.log_file}")
        print(f"{'='*60}\n")
        
        return results
    
    def save_log(self):
        """Save operations log"""
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'external_drive': str(self.external_drive),
            'operations': self.operations
        }
        
        with open(self.log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
    
    def rollback(self, log_file: str = None):
        """Rollback migration using log file"""
        log_path = Path(log_file or self.log_file)
        
        if not log_path.exists():
            print(f"❌ Log file not found: {log_path}")
            return
        
        print(f"🔄 Rolling back migration from {log_path}...")
        
        with open(log_path, 'r') as f:
            log_data = json.load(f)
        
        for operation in reversed(log_data['operations']):
            if operation['status'] != 'success':
                continue
            
            source = Path(operation['source'])
            dest = Path(operation['destination'])
            
            print(f"  Restoring {source.name}...")
            
            try:
                # Remove symlink if exists
                if source.exists() and source.is_symlink():
                    source.unlink()
                
                # Copy file back
                if dest.exists():
                    shutil.copy2(dest, source)
                    print(f"  ✅ Restored {source.name}")
                else:
                    print(f"  ⚠️  Original file not found on external drive")
                
            except Exception as e:
                print(f"  ❌ Failed to restore {source.name}: {e}")
        
        print("✅ Rollback complete")
    
    def verify_only(self):
        """Verify all migrated files have matching checksums"""
        if not self.log_file.exists():
            print(f"❌ No migration log found at {self.log_file}")
            return
        
        with open(self.log_file, 'r') as f:
            log_data = json.load(f)
        
        print(f"🔍 Verifying {len(log_data['operations'])} migrations...")
        
        errors = 0
        for operation in log_data['operations']:
            if operation['status'] != 'success':
                continue
            
            dest = Path(operation['destination'])
            if not dest.exists():
                print(f"  ❌ Missing: {dest.name}")
                errors += 1
                continue
            
            checksum = self.calculate_checksum(dest)
            if checksum != operation['checksum_dest']:
                print(f"  ❌ Checksum mismatch: {dest.name}")
                errors += 1
        
        if errors == 0:
            print("✅ All files verified successfully")
        else:
            print(f"⚠️  {errors} errors found")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrate files to external drive')
    parser.add_argument('--report', type=str, default='storage_report.json',
                       help='Storage analysis report JSON file')
    parser.add_argument('--categories', nargs='+', 
                       help='Categories to migrate (e.g., photos videos archives)')
    parser.add_argument('--max-files', type=int,
                       help='Maximum number of files to migrate')
    parser.add_argument('--external-drive', type=str, default='/Volumes/LaCie',
                       help='Path to external drive')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simulate migration without moving files')
    parser.add_argument('--rollback', action='store_true',
                       help='Rollback previous migration')
    parser.add_argument('--verify-only', action='store_true',
                       help='Verify checksums of migrated files')
    parser.add_argument('--log-file', type=str, default='migration.log',
                       help='Migration log file path')
    parser.add_argument('--auto-approve', action='store_true',
                       help='Skip confirmation prompts')
    
    args = parser.parse_args()
    
    migrator = StorageMigrator(external_drive=args.external_drive, log_file=args.log_file)
    
    if args.rollback:
        migrator.rollback()
        return
    
    if args.verify_only:
        migrator.verify_only()
        return
    
    # Verify external drive
    if not args.dry_run:
        if not migrator.verify_external_drive():
            return
    
    # Run migration
    migrator.migrate_from_report(
        report_path=args.report,
        categories=args.categories,
        max_files=args.max_files,
        dry_run=args.dry_run,
        auto_approve=args.auto_approve
    )


if __name__ == '__main__':
    main()
