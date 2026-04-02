#!/usr/bin/env python3
"""
Storage Cleanup - Safely clean system caches and temporary files
"""

import os
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict
import subprocess

class StorageCleanup:
    def __init__(self, home_dir: str = None):
        self.home_dir = Path(home_dir or os.path.expanduser("~"))
        self.space_freed = 0
        
    def get_dir_size(self, path: Path) -> int:
        """Calculate directory size in bytes"""
        total = 0
        try:
            for entry in path.rglob('*'):
                if entry.is_file():
                    total += entry.stat().st_size
        except Exception:
            pass
        return total
    
    def format_size(self, bytes_size: int) -> str:
        """Format bytes to human-readable size"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024
        return f"{bytes_size:.2f} TB"
    
    def clean_app_caches(self, dry_run: bool = False) -> Dict:
        """Clean application caches"""
        cache_dir = self.home_dir / 'Library' / 'Caches'
        
        # Safe to clean cache directories
        safe_caches = [
            'com.google.Chrome',
            'com.apple.Safari',
            'Firefox',
            'Homebrew',
            'pip',
            'yarn',
            'npm'
        ]
        
        print("🗑️  Cleaning application caches...")
        total_freed = 0
        
        for cache_name in safe_caches:
            cache_path = cache_dir / cache_name
            if cache_path.exists():
                size = self.get_dir_size(cache_path)
                if size > 0:
                    print(f"  {cache_name}: {self.format_size(size)}")
                    
                    if not dry_run:
                        try:
                            shutil.rmtree(cache_path)
                            total_freed += size
                            print(f"    ✅ Cleaned")
                        except Exception as e:
                            print(f"    ❌ Error: {e}")
        
        return {'freed': total_freed, 'formatted': self.format_size(total_freed)}
    
    def clean_downloads(self, days_old: int = 30, dry_run: bool = False) -> Dict:
        """Clean old downloads folder items"""
        downloads = self.home_dir / 'Downloads'
        cutoff_date = datetime.now() - timedelta(days=days_old)
        
        print(f"\n🗑️  Cleaning downloads older than {days_old} days...")
        total_freed = 0
        
        if not downloads.exists():
            return {'freed': 0, 'formatted': '0 B'}
        
        for item in downloads.iterdir():
            try:
                mtime = datetime.fromtimestamp(item.stat().st_mtime)
                if mtime < cutoff_date:
                    size = item.stat().st_size if item.is_file() else self.get_dir_size(item)
                    print(f"  {item.name}: {self.format_size(size)} (modified {mtime.strftime('%Y-%m-%d')})")
                    
                    if not dry_run:
                        if item.is_file():
                            item.unlink()
                        else:
                            shutil.rmtree(item)
                        total_freed += size
                        print(f"    ✅ Deleted")
            except Exception as e:
                print(f"  ❌ Error with {item.name}: {e}")
        
        return {'freed': total_freed, 'formatted': self.format_size(total_freed)}
    
    def clean_trash(self, dry_run: bool = False) -> Dict:
        """Empty trash"""
        print("\n🗑️  Emptying trash...")
        
        if not dry_run:
            try:
                subprocess.run(['osascript', '-e', 'tell application "Finder" to empty trash'], 
                             check=True, capture_output=True)
                print("  ✅ Trash emptied")
                return {'freed': 0, 'formatted': 'Unknown'}
            except Exception as e:
                print(f"  ❌ Error: {e}")
                return {'freed': 0, 'formatted': '0 B'}
        else:
            print("  [DRY RUN] Would empty trash")
            return {'freed': 0, 'formatted': '0 B (dry run)'}
    
    def clean_old_logs(self, days_old: int = 30, dry_run: bool = False) -> Dict:
        """Clean old log files"""
        logs_dir = self.home_dir / 'Library' / 'Logs'
        cutoff_date = datetime.now() - timedelta(days=days_old)
        
        print(f"\n🗑️  Cleaning logs older than {days_old} days...")
        total_freed = 0
        
        if not logs_dir.exists():
            return {'freed': 0, 'formatted': '0 B'}
        
        for log_file in logs_dir.rglob('*.log'):
            try:
                mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                if mtime < cutoff_date:
                    size = log_file.stat().st_size
                    if size > 1024 * 1024:  # Only show files > 1MB
                        print(f"  {log_file.name}: {self.format_size(size)}")
                        
                        if not dry_run:
                            log_file.unlink()
                            total_freed += size
                            print(f"    ✅ Deleted")
            except Exception:
                pass
        
        return {'freed': total_freed, 'formatted': self.format_size(total_freed)}
    
    def run_cleanup(self, dry_run: bool = False, skip_confirmations: bool = False):
        """Run all cleanup operations"""
        print(f"\n{'='*60}")
        print(f"🧹 STORAGE CLEANUP {'(DRY RUN)' if dry_run else ''}")
        print(f"{'='*60}\n")
        
        if not dry_run and not skip_confirmations:
            response = input("⚠️  This will delete caches and old files. Continue? (yes/no): ")
            if response.lower() not in ('yes', 'y'):
                print("Cleanup cancelled.")
                return
        
        total_freed = 0
        
        # Run cleanup operations
        results = []
        
        # App caches
        result = self.clean_app_caches(dry_run=dry_run)
        total_freed += result['freed']
        results.append(('App Caches', result['formatted']))
        
        # Old downloads
        result = self.clean_downloads(days_old=30, dry_run=dry_run)
        total_freed += result['freed']
        results.append(('Old Downloads', result['formatted']))
        
        # Old logs
        result = self.clean_old_logs(days_old=30, dry_run=dry_run)
        total_freed += result['freed']
        results.append(('Old Logs', result['formatted']))
        
        # Trash
        result = self.clean_trash(dry_run=dry_run)
        results.append(('Trash', result['formatted']))
        
        # Summary
        print(f"\n{'='*60}")
        print(f"📊 CLEANUP SUMMARY")
        print(f"{'='*60}")
        for operation, size in results:
            print(f"  {operation}: {size}")
        print(f"\n  💾 Total Space Freed: {self.format_size(total_freed)}")
        print(f"{'='*60}\n")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Clean system caches and temporary files')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be deleted without actually deleting')
    parser.add_argument('--yes', action='store_true',
                       help='Skip confirmation prompts')
    
    args = parser.parse_args()
    
    cleanup = StorageCleanup()
    cleanup.run_cleanup(dry_run=args.dry_run, skip_confirmations=args.yes)


if __name__ == '__main__':
    main()
