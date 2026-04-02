#!/usr/bin/env python3
"""
Email Storage Analyzer - Analyze Edison Mail database storage usage
Identifies large attachments, old emails, and cleanup opportunities
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import json

class EmailStorageAnalyzer:
    def __init__(self, edison_mail_path: str = None):
        if edison_mail_path is None:
            self.base_path = Path.home() / "Library/Containers/com.edisonmail.edisonmail/Data/Library/Application Support/EdisonMail"
        else:
            self.base_path = Path(edison_mail_path)
        
        self.main_db = self.base_path / "edisonmail.db"
        self.embody_db = self.base_path / "embody.db"
        
    def get_database_sizes(self) -> Dict:
        """Get size of all Edison Mail databases"""
        databases = {}
        total_size = 0
        
        for db_file in self.base_path.glob("*.db"):
            size_bytes = db_file.stat().st_size
            size_mb = size_bytes / 1024 / 1024
            databases[db_file.name] = {
                'size_bytes': size_bytes,
                'size_mb': round(size_mb, 2),
                'path': str(db_file)
            }
            total_size += size_bytes
        
        return {
            'total_size_gb': round(total_size / 1024 / 1024 / 1024, 2),
            'databases': databases
        }
    
    def analyze_main_database(self) -> Dict:
        """Analyze the main edisonmail.db for email statistics"""
        if not self.main_db.exists():
            return {'error': 'Main database not found'}
        
        try:
            conn = sqlite3.connect(str(self.main_db))
            cursor = conn.cursor()
            
            # Get table list
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            stats = {
                'tables': tables,
                'table_row_counts': {}
            }
            
            # Count rows in each table
            for table in tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    stats['table_row_counts'][table] = count
                except Exception as e:
                    stats['table_row_counts'][table] = f"Error: {str(e)}"
            
            conn.close()
            return stats
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_cache_sizes(self) -> Dict:
        """Get size of Edison Mail cache and temporary files"""
        cache_data = {}
        
        # Check for cache directories
        cache_paths = [
            self.base_path.parent.parent / "Caches",
            self.base_path / "cache",
            self.base_path / "tmp"
        ]
        
        for cache_path in cache_paths:
            if cache_path.exists():
                size = sum(f.stat().st_size for f in cache_path.rglob('*') if f.is_file())
                cache_data[cache_path.name] = {
                    'path': str(cache_path),
                    'size_mb': round(size / 1024 / 1024, 2)
                }
        
        return cache_data
    
    def generate_cleanup_recommendations(self, stats: Dict) -> List[Dict]:
        """Generate cleanup recommendations based on analysis"""
        recommendations = []
        
        # Database sizes
        db_sizes = stats.get('database_sizes', {})
        total_gb = db_sizes.get('total_size_gb', 0)
        
        if total_gb > 2:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Database Size',
                'description': f'Edison Mail databases total {total_gb:.2f} GB',
                'suggestion': 'Consider clearing old emails or attachments',
                'potential_savings_gb': total_gb * 0.5  # Estimate 50% can be cleaned
            })
        
        # Check for WAL files (Write-Ahead Log - can be large)
        for db_name, db_info in db_sizes.get('databases', {}).items():
            if db_name.endswith('.db-wal') and db_info['size_mb'] > 5:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'category': 'WAL Files',
                    'description': f'{db_name} is {db_info["size_mb"]} MB',
                    'suggestion': 'Close Edison Mail to merge WAL files into main database',
                    'potential_savings_mb': db_info['size_mb']
                })
        
        # Cache sizes
        cache_sizes = stats.get('cache_sizes', {})
        for cache_name, cache_info in cache_sizes.items():
            if cache_info['size_mb'] > 100:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'category': 'Cache',
                    'description': f'{cache_name} cache is {cache_info["size_mb"]} MB',
                    'suggestion': 'Safe to clear cache files',
                    'potential_savings_mb': cache_info['size_mb']
                })
        
        return recommendations
    
    def generate_report(self, output_path: str = None) -> Dict:
        """Generate comprehensive email storage report"""
        print("📊 Analyzing Edison Mail Storage...\n")
        
        # Collect all statistics
        report = {
            'generated_at': datetime.now().isoformat(),
            'database_sizes': self.get_database_sizes(),
            'main_db_stats': self.analyze_main_database(),
            'cache_sizes': self.get_cache_sizes()
        }
        
        # Generate recommendations
        report['recommendations'] = self.generate_cleanup_recommendations(report)
        
        # Save to file if requested
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✅ Report saved to: {output_path}\n")
        
        return report
    
    def print_summary(self, report: Dict):
        """Print human-readable summary"""
        print("="*60)
        print("📧 EDISON MAIL STORAGE ANALYSIS")
        print("="*60)
        
        # Database sizes
        db_sizes = report['database_sizes']
        print(f"\n💾 Total Database Size: {db_sizes['total_size_gb']:.2f} GB")
        print(f"\n📁 Database Files:")
        for db_name, db_info in sorted(db_sizes['databases'].items(), 
                                      key=lambda x: x[1]['size_mb'], 
                                      reverse=True)[:10]:
            print(f"  {db_name}: {db_info['size_mb']:.1f} MB")
        
        # Main database stats
        main_stats = report.get('main_db_stats', {})
        if 'table_row_counts' in main_stats:
            print(f"\n📊 Main Database Tables:")
            for table, count in sorted(main_stats['table_row_counts'].items(),
                                      key=lambda x: x[1] if isinstance(x[1], int) else 0,
                                      reverse=True)[:5]:
                if isinstance(count, int):
                    print(f"  {table}: {count:,} rows")
        
        # Cache sizes
        cache_sizes = report.get('cache_sizes', {})
        if cache_sizes:
            print(f"\n🗂️  Cache Sizes:")
            for cache_name, cache_info in cache_sizes.items():
                print(f"  {cache_name}: {cache_info['size_mb']:.1f} MB")
        
        # Recommendations
        recommendations = report.get('recommendations', [])
        if recommendations:
            print(f"\n💡 Cleanup Recommendations:")
            for i, rec in enumerate(recommendations, 1):
                print(f"\n  {i}. [{rec['priority']}] {rec['category']}")
                print(f"     {rec['description']}")
                print(f"     → {rec['suggestion']}")
                if 'potential_savings_gb' in rec:
                    print(f"     Potential savings: ~{rec['potential_savings_gb']:.2f} GB")
                elif 'potential_savings_mb' in rec:
                    print(f"     Potential savings: ~{rec['potential_savings_mb']:.1f} MB")
        
        print("\n" + "="*60 + "\n")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze Edison Mail storage usage')
    parser.add_argument('--output', type=str, default='edison_mail_report.json',
                       help='Output JSON file path')
    parser.add_argument('--edison-path', type=str,
                       help='Custom path to Edison Mail data directory')
    
    args = parser.parse_args()
    
    analyzer = EmailStorageAnalyzer(edison_mail_path=args.edison_path)
    
    # Check if Edison Mail directory exists
    if not analyzer.base_path.exists():
        print(f"❌ Edison Mail directory not found at: {analyzer.base_path}")
        print("   Is Edison Mail installed?")
        return
    
    # Generate report
    report = analyzer.generate_report(output_path=args.output)
    analyzer.print_summary(report)
    
    print("📝 For detailed analysis, check:", args.output)


if __name__ == '__main__':
    main()
