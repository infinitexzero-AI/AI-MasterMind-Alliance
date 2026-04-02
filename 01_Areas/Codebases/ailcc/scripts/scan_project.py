#!/usr/bin/env python3
"""
Intelligent Project File Search and Organization Tool
Searches for AI project files across common locations and creates index
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from collections import defaultdict

class ProjectScanner:
    def __init__(self, workspace_root):
        self.workspace_root = workspace_root
        self.results = {
            "scan_time": datetime.now().isoformat(),
            "workspace": workspace_root,
            "files_by_type": defaultdict(list),
            "files_by_keyword": defaultdict(list),
            "duplicates": [],
            "total_files": 0,
            "total_size_mb": 0
        }
        
        self.keywords = [
            'ai', 'agent', 'cortex', 'valentine', 'comet', 'grok', 
            'linear', 'gemini', 'claude', 'chatgpt', 'antigravity',
            'mastermind', 'intel', 'automation', 'dashboard'
        ]
        
        self.extensions = [
            '.py', '.json', '.md', '.js', '.jsx', '.ts', '.tsx',
            '.yaml', '.yml', '.sh', '.txt', '.env', '.config'
        ]
    
    def scan_workspace(self):
        """Scan the specified workspace"""
        print(f"🔍 Scanning workspace: {self.workspace_root}")
        
        for root, dirs, files in os.walk(self.workspace_root):
            # Skip common excluded directories
            dirs[:] = [d for d in dirs if d not in [
                'node_modules', '.git', '.venv', '__pycache__', 
                'dist', 'build', '.next', 'venv'
            ]]
            
            for file in files:
                file_path = os.path.join(root, file)
                self._process_file(file_path)
        
        self.results['total_files'] = sum(len(files) for files in self.results['files_by_type'].values())
        print(f"✅ Found {self.results['total_files']} relevant files")
    
    def _process_file(self, file_path):
        """Process individual file"""
        try:
            ext = Path(file_path).suffix.lower()
            if ext not in self.extensions:
                return
            
            file_info = {
                "path": file_path,
                "name": os.path.basename(file_path),
                "size": os.path.getsize(file_path),
                "modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                "extension": ext
            }
            
            # Add to type category
            self.results['files_by_type'][ext].append(file_info)
            
            # Check for keywords in filename and path
            lower_path = file_path.lower()
            for keyword in self.keywords:
                if keyword in lower_path:
                    self.results['files_by_keyword'][keyword].append(file_info)
            
            # Update total size
            self.results['total_size_mb'] += file_info['size'] / (1024 * 1024)
            
        except Exception as e:
            print(f"⚠️  Error processing {file_path}: {e}")
    
    def generate_report(self, output_file):
        """Generate comprehensive report"""
        report = {
            "summary": {
                "scan_time": self.results['scan_time'],
                "workspace": self.results['workspace'],
                "total_files": self.results['total_files'],
                "total_size_mb": round(self.results['total_size_mb'], 2)
            },
            "by_extension": {},
            "by_keyword": {},
            "python_files": [],
            "json_files": [],
            "documentation": []
        }
        
        # Organize by extension
        for ext, files in self.results['files_by_type'].items():
            report['by_extension'][ext] = {
                "count": len(files),
                "files": sorted([f['path'] for f in files])
            }
        
        # Organize by keyword
        for keyword, files in self.results['files_by_keyword'].items():
            report['by_keyword'][keyword] = {
                "count": len(files),
                "files": sorted([f['path'] for f in files])
            }
        
        # Special categories
        report['python_files'] = sorted([f['path'] for f in self.results['files_by_type'].get('.py', [])])
        report['json_files'] = sorted([f['path'] for f in self.results['files_by_type'].get('.json', [])])
        report['documentation'] = sorted([f['path'] for f in self.results['files_by_type'].get('.md', [])])
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Report saved to: {output_file}")
        return report
    
    def print_summary(self):
        """Print summary to console"""
        print("\n" + "="*60)
        print("PROJECT FILE SCAN SUMMARY")
        print("="*60)
        print(f"Total Files: {self.results['total_files']}")
        print(f"Total Size: {self.results['total_size_mb']:.2f} MB")
        print(f"\nFiles by Type:")
        for ext, files in sorted(self.results['files_by_type'].items()):
            print(f"  {ext}: {len(files)} files")
        print(f"\nTop Keywords:")
        keyword_counts = [(k, len(v)) for k, v in self.results['files_by_keyword'].items()]
        for keyword, count in sorted(keyword_counts, key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {keyword}: {count} files")
        print("="*60 + "\n")

def main():
    workspace = os.path.abspath(os.path.dirname(__file__) + "/../..")
    
    print("🚀 AI Project File Scanner")
    print(f"📁 Workspace: {workspace}\n")
    
    scanner = ProjectScanner(workspace)
    scanner.scan_workspace()
    
    # Generate report
    output_file = os.path.join(workspace, "PROJECT_SCAN.json")
    scanner.generate_report(output_file)
    
    # Print summary
    scanner.print_summary()
    
    print(f"💡 View full report: {output_file}")
    print(f"💡 View project map: {workspace}/PROJECT_MAP.md")

if __name__ == "__main__":
    main()
