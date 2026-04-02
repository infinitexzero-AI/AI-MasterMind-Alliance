#!/usr/bin/env python3
"""
Storage Analyzer - Identify files for migration to external drive
Analyzes disk usage and generates migration recommendations
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple
import subprocess

class StorageAnalyzer:
    def __init__(self, home_dir: str = None, min_size_mb: int = 100):
        self.home_dir = Path(home_dir or os.path.expanduser("~"))
        self.min_size_bytes = min_size_mb * 1024 * 1024
        self.files_analyzed = []
        self.duplicates = {}
        
        # Directories to skip (system/cache directories that shouldn't be migrated)
        self.skip_dirs = {
            'Library/Caches',
            'Library/Logs',
            '.Trash',
            '.cache',
            'node_modules',
            '__pycache__',
            '.venv',
            '.git'
        }
        
    def get_disk_usage(self) -> Dict:
        """Get current disk usage statistics"""
        result = subprocess.run(['df', '-h'], capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')
        
        disk_info = {}
        for line in lines[1:]:  # Skip header
            parts = line.split()
            if len(parts) >= 6:
                filesystem = parts[0]
                size = parts[1]
                used = parts[2]
                avail = parts[3]
                capacity = parts[4]
                mounted = parts[5] if len(parts) == 6 else ' '.join(parts[5:])
                
                disk_info[mounted] = {
                    'filesystem': filesystem,
                    'size': size,
                    'used': used,
                    'available': avail,
                    'capacity': capacity
                }
        
        return disk_info
    
    def should_skip(self, path: Path) -> bool:
        """Check if path should be skipped"""
        try:
            path_str = str(path.relative_to(self.home_dir))
            for skip_dir in self.skip_dirs:
                if skip_dir in path_str:
                    return True
        except ValueError:
            pass
        return False
    
    def categorize_file(self, file_path: Path) -> str:
        """Categorize file by type"""
        suffix = file_path.suffix.lower()
        
        photo_exts = {'.jpg', '.jpeg', '.png', '.heic', '.raw', '.cr2', '.nef'}
        video_exts = {'.mp4', '.mov', '.avi', '.mkv', '.m4v'}
        doc_exts = {'.pdf', '.doc', '.docx', '.txt', '.md', '.pages'}
        archive_exts = {'.zip', '.tar', '.gz', '.7z', '.rar', '.dmg'}
        code_exts = {'.py', '.js', '.tsx', '.jsx', '.java', '.cpp', '.go'}
        
        if suffix in photo_exts:
            return 'photos'
        elif suffix in video_exts:
            return 'videos'
        elif suffix in doc_exts:
            return 'documents'
        elif suffix in archive_exts:
            return 'archives'
        elif suffix in code_exts:
            return 'code'
        elif '.app' in file_path.parts:
            return 'applications'
        elif file_path.name.endswith('.photoslibrary'):
            return 'photo_library'
        else:
            return 'other'
    
    def find_large_files(self, max_files: int = 500) -> List[Dict]:
        """Find files larger than min_size_mb"""
        print(f"🔍 Scanning {self.home_dir} for files > {self.min_size_bytes / 1024 / 1024:.0f}MB...")
        
        large_files = []
        
        for root, dirs, files in os.walk(self.home_dir):
            # Filter out directories we want to skip
            dirs[:] = [d for d in dirs if not self.should_skip(Path(root) / d)]
            
            for file in files:
                try:
                    file_path = Path(root) / file
                    
                    if self.should_skip(file_path):
                        continue
                    
                    # Get file size
                    size = file_path.stat().st_size
                    
                    if size >= self.min_size_bytes:
                        category = self.categorize_file(file_path)
                        
                        file_info = {
                            'path': str(file_path),
                            'size_bytes': size,
                            'size_mb': round(size / 1024 / 1024, 2),
                            'size_gb': round(size / 1024 / 1024 / 1024, 2),
                            'category': category,
                            'modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                            'accessed': datetime.fromtimestamp(file_path.stat().st_atime).isoformat()
                        }
                        
                        large_files.append(file_info)
                        print(f"  Found: {file_path.name} ({file_info['size_mb']:.1f}MB) - {category}")
                        
                        if len(large_files) >= max_files:
                            print(f"⚠️  Reached max_files limit ({max_files}), stopping scan")
                            break
                            
                except (PermissionError, OSError) as e:
                    continue
            
            if len(large_files) >= max_files:
                break
        
        # Sort by size descending
        large_files.sort(key=lambda x: x['size_bytes'], reverse=True)
        return large_files
    
    def recommend_migrations(self, files: List[Dict]) -> Dict[str, List[Dict]]:
        """Generate migration recommendations by category"""
        recommendations = {
            'photos': [],
            'videos': [],
            'photo_library': [],
            'documents': [],
            'archives': [],
            'applications': [],
            'other': []
        }
        
        for file in files:
            category = file['category']
            if category in recommendations:
                recommendations[category].append(file)
        
        return recommendations
    
    def generate_report(self, output_path: str = None) -> Dict:
        """Generate complete analysis report"""
        print("\n📊 Generating Storage Analysis Report\n")
        
        # Get disk usage
        disk_usage = self.get_disk_usage()
        
        # Find large files
        large_files = self.find_large_files()
        
        # Get recommendations
        recommendations = self.recommend_migrations(large_files)
        
        # Calculate potential savings
        total_size_gb = sum(f['size_bytes'] for f in large_files) / 1024 / 1024 / 1024
        
        category_sizes = {}
        for category, files in recommendations.items():
            size_gb = sum(f['size_bytes'] for f in files) / 1024 / 1024 / 1024
            category_sizes[category] = {
                'count': len(files),
                'size_gb': round(size_gb, 2)
            }
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'disk_usage': disk_usage,
            'summary': {
                'total_files_found': len(large_files),
                'total_size_gb': round(total_size_gb, 2),
                'categories': category_sizes
            },
            'recommendations': recommendations
        }
        
        # Save report if output path provided
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✅ Report saved to: {output_path}")
        
        return report
    
    def print_summary(self, report: Dict):
        """Print human-readable summary"""
        print("\n" + "="*60)
        print("📦 STORAGE ANALYSIS SUMMARY")
        print("="*60)
        
        print("\n🖥️  Disk Usage:")
        for mount, info in report['disk_usage'].items():
            if mount in ['/', '/System/Volumes/Data'] or mount.startswith('/Volumes'):
                print(f"  {mount}: {info['used']}/{info['size']} ({info['capacity']} full)")
        
        print(f"\n📁 Large Files Found: {report['summary']['total_files_found']}")
        print(f"💾 Total Size: {report['summary']['total_size_gb']:.2f} GB")
        
        print("\n📊 By Category:")
        for category, info in report['summary']['categories'].items():
            if info['count'] > 0:
                print(f"  {category.capitalize()}: {info['count']} files, {info['size_gb']:.2f} GB")
        
        print("\n🎯 Migration Recommendations:")
        
        # Photos & Videos to LaCie/Media
        media_size = (report['summary']['categories'].get('photos', {}).get('size_gb', 0) + 
                     report['summary']['categories'].get('videos', {}).get('size_gb', 0) +
                     report['summary']['categories'].get('photo_library', {}).get('size_gb', 0))
        if media_size > 0:
            print(f"  → Move photos/videos to /Volumes/LaCie/Media/ ({media_size:.2f} GB)")
        
        # Archives to LaCie/Archives
        archive_size = report['summary']['categories'].get('archives', {}).get('size_gb', 0)
        if archive_size > 0:
            print(f"  → Move archives to /Volumes/LaCie/Archives/ ({archive_size:.2f} GB)")
        
        # Documents to iCloud
        doc_size = report['summary']['categories'].get('documents', {}).get('size_gb', 0)
        if doc_size > 0:
            print(f"  → Sync documents to iCloud Drive ({doc_size:.2f} GB)")
        
        print("\n💡 Potential Space Savings: ~{:.2f} GB".format(
            media_size + archive_size + doc_size
        ))
        print("="*60 + "\n")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze storage and recommend migrations')
    parser.add_argument('--min-size', type=int, default=100, 
                       help='Minimum file size in MB (default: 100)')
    parser.add_argument('--output', type=str, default='storage_report.json',
                       help='Output JSON file path')
    parser.add_argument('--test-mode', action='store_true',
                       help='Run in test mode (analyze ~/Desktop only)')
    
    args = parser.parse_args()
    
    # In test mode, only analyze Desktop
    home_dir = os.path.join(os.path.expanduser("~"), "Desktop") if args.test_mode else None
    
    analyzer = StorageAnalyzer(home_dir=home_dir, min_size_mb=args.min_size)
    report = analyzer.generate_report(output_path=args.output)
    analyzer.print_summary(report)


if __name__ == '__main__':
    main()
