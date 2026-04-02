#!/usr/bin/env python3
"""
File Classifier - Automatically classify files into Life Library domains
Uses path analysis, filename patterns, and content hints
"""

import json
import re
from pathlib import Path
from typing import Dict, Optional, List, Tuple

class LifeLibraryClassifier:
    def __init__(self, taxonomy_path: str = None):
        if taxonomy_path is None:
            taxonomy_path = Path(__file__).parent.parent / "config" / "life_library_taxonomy.json"
        
        with open(taxonomy_path, 'r') as f:
            self.taxonomy = json.load(f)
        
        self.domains = self.taxonomy['domains']
        self.file_types = self.taxonomy.get('file_type_mappings', {})
        
    def classify_by_path(self, file_path: str) -> Tuple[Optional[str], float]:
        """Classify based on file path keywords"""
        path_lower = file_path.lower()
        
        # Academic indicators
        academic_keywords = ['mta', 'university', 'course', 'lecture', 'assignment', 
                            'exam', 'textbook', 'anatomy', 'philosophy', 'commercial law']
        if any(kw in path_lower for kw in academic_keywords):
            return ('academic', 0.8)
        
        # AI/Technical indicators
        ai_keywords = ['ailcc', 'code', 'python', 'javascript', 'github', 'repository',
                      'ai', 'cortex', 'agent', 'automation', 'script']
        if any(kw in path_lower for kw in ai_keywords):
            return ('ai_technical', 0.9)
        
        # Professional indicators
        prof_keywords = ['business', 'venture', 'ecfc', 'career', 'resume', 'cv',
                        'professional', 'portfolio', 'client', 'project']
        if any(kw in path_lower for kw in prof_keywords):
            return ('professional', 0.8)
        
        # Personal indicators
        personal_keywords = ['personal', 'health', 'finance', 'budget', 'medical',
                            'fitness', 'family', 'travel']
        if any(kw in path_lower for kw in personal_keywords):
            return ('personal', 0.7)
        
        # Creative indicators
        creative_keywords = ['writing', 'design', 'creative', 'art', 'music',
                            'video', 'photo', 'media']
        if any(kw in path_lower for kw in creative_keywords):
            return ('creative', 0.7)
        
        return (None, 0.0)
    
    def classify_by_extension(self, file_ext: str) -> Tuple[Optional[str], float]:
        """Classify based on file extension"""
        ext_lower = file_ext.lower().lstrip('.')
        
        # Code files → AI/Technical
        code_exts = ['py', 'js', 'jsx', 'tsx', 'java', 'cpp', 'go', 'sh', 'sql']
        if ext_lower in code_exts:
            return ('ai_technical', 0.6)
        
        # Academic documents
        if ext_lower in ['pdf', 'docx', 'pptx']:
            # Weak signal, need path context
            return (None, 0.0)
        
        # Media files → Creative (weak signal)
        media_exts = ['mp4', 'mov', 'jpg', 'png', 'psd', 'ai']
        if ext_lower in media_exts:
            return ('creative', 0.3)
        
        return (None, 0.0)
    
    def classify_by_filename(self, filename: str) -> Tuple[Optional[str], float]:
        """Classify based on filename patterns"""
        name_lower = filename.lower()
        
        # Date patterns suggest academic (assignments, exams)
        if re.search(r'\d{4}[-_]\d{2}[-_]\d{2}', name_lower):
            if any(word in name_lower for word in ['assignment', 'exam', 'quiz', 'homework']):
                return ('academic', 0.7)
        
        # Business/venture patterns
        if any(word in name_lower for word in ['business_plan', 'proposal', 'pitch', 'investor']):
            return ('professional', 0.8)
        
        # Research/paper patterns
        if any(word in name_lower for word in ['research', 'paper', 'thesis', 'literature_review']):
            return ('academic', 0.8)
        
        return (None, 0.0)
    
    def classify_file(self, file_path: str, file_name: str, file_ext: str) -> Dict:
        """
        Classify a file into a domain
        Returns: {domain, subdomain, confidence, reasoning}
        """
        signals = []
        
        # Collect classification signals
        path_domain, path_conf = self.classify_by_path(file_path)
        if path_domain:
            signals.append(('path', path_domain, path_conf))
        
        ext_domain, ext_conf = self.classify_by_extension(file_ext)
        if ext_domain:
            signals.append(('extension', ext_domain, ext_conf))
        
        name_domain, name_conf = self.classify_by_filename(file_name)
        if name_domain:
            signals.append(('filename', name_domain, name_conf))
        
        # No signals → unclassified
        if not signals:
            return {
                'domain': None,
                'subdomain': None,
                'confidence': 0.0,
                'reasoning': 'No classification signals found',
                'signals': []
            }
        
        # Aggregate signals (weighted average)
        domain_scores = {}
        for signal_type, domain, conf in signals:
            if domain not in domain_scores:
                domain_scores[domain] = []
            domain_scores[domain].append((signal_type, conf))
        
        # Calculate final scores
        final_scores = {}
        for domain, scores in domain_scores.items():
            # Use max confidence from all signals for this domain
            max_conf = max(conf for _, conf in scores)
            # Boost if multiple signals agree
            if len(scores) > 1:
                max_conf = min(1.0, max_conf * 1.2)
            final_scores[domain] = max_conf
        
        # Pick domain with highest confidence
        best_domain = max(final_scores.items(), key=lambda x: x[1])
        
        return {
            'domain': best_domain[0],
            'subdomain': self._suggest_subdomain(best_domain[0], file_path, file_name),
            'confidence': best_domain[1],
            'reasoning': f"Classified based on: {', '.join(s[0] for s in signals)}",
            'signals': signals
        }
    
    def _suggest_subdomain(self, domain: str, file_path: str, file_name: str) -> Optional[str]:
        """Suggest subdomain based on path/filename"""
        path_lower = (file_path + file_name).lower()
        
        if domain not in self.domains:
            return None
        
        subdomains = self.domains[domain]['subdomains']
        
        # Try to match subdomain keywords
        for subdomain in subdomains:
            subdomain_keywords = subdomain.lower().replace('_', ' ').split()
            if any(kw in path_lower for kw in subdomain_keywords):
                return subdomain
        
        # Default to first subdomain if no match
        return subdomains[0] if subdomains else None
    
    def classify_batch(self, files: List[Dict]) -> List[Dict]:
        """Classify multiple files from inventory"""
        results = []
        
        for file_info in files:
            classification = self.classify_file(
                file_info.get('file_path', ''),
                file_info.get('file_name', ''),
                file_info.get('file_extension', '')
            )
            
            results.append({
                **file_info,
                **classification
            })
        
        return results
    
    def print_classification_report(self, classified_files: List[Dict]):
        """Print classification statistics"""
        print("="*60)
        print("📊 FILE CLASSIFICATION REPORT")
        print("="*60)
        
        # Group by domain
        by_domain = {}
        unclassified = []
        
        for file in classified_files:
            domain = file.get('domain')
            if domain:
                if domain not in by_domain:
                    by_domain[domain] = []
                by_domain[domain].append(file)
            else:
                unclassified.append(file)
        
        # Print stats
        total = len(classified_files)
        classified_count = total - len(unclassified)
        
        print(f"\n📈 Overall Statistics:")
        print(f"  Total files: {total:,}")
        print(f"  Classified: {classified_count:,} ({100*classified_count/total:.1f}%)")
        print(f"  Unclassified: {len(unclassified):,} ({100*len(unclassified)/total:.1f}%)")
        
        print(f"\n🏛️  By Domain:")
        for domain_key in sorted(by_domain.keys()):
            domain_name = self.domains[domain_key]['name']
            domain_icon = self.domains[domain_key]['icon']
            count = len(by_domain[domain_key])
            total_size = sum(f.get('file_size_bytes', 0) for f in by_domain[domain_key])
            size_gb = total_size / 1024 / 1024 / 1024
            
            avg_confidence = sum(f.get('confidence', 0) for f in by_domain[domain_key]) / count
            
            print(f"\n  {domain_icon} {domain_name}")
            print(f"     Files: {count:,} ({100*count/total:.1f}%)")
            print(f"     Size: {size_gb:.2f} GB")
            print(f"     Avg Confidence: {avg_confidence:.2f}")
        
        # Show sample unclassified files
        if unclassified:
            print(f"\n❓ Sample Unclassified Files ({len(unclassified)} total):")
            for file in unclassified[:5]:
                print(f"     {file.get('file_name', 'unknown')}")
        
        print("\n" + "="*60)


def main():
    import argparse
    import sqlite3
    
    parser = argparse.ArgumentParser(description='Life Library File Classifier')
    parser.add_argument('--inventory-db', type=str, default='life_library_inventory.db',
                       help='Path to inventory database')
    parser.add_argument('--update-db', action='store_true',
                       help='Update inventory database with classifications')
    parser.add_argument('--sample-size', type=int, default=100,
                       help='Number of files to classify (for testing)')
    
    args = parser.parse_args()
    
    # Load files from inventory
    if not Path(args.inventory_db).exists():
        print(f"❌ Inventory database not found: {args.inventory_db}")
        print("Run storage_inventory.py first to create inventory")
        return
    
    print("📚 Loading files from inventory...")
    conn = sqlite3.connect(args.inventory_db)
    cursor = conn.cursor()
    
    cursor.execute(f'''
        SELECT library_id, file_path, file_name, file_extension, file_size_bytes
        FROM files
        LIMIT {args.sample_size}
    ''')
    
    files = [{
        'library_id': row[0],
        'file_path': row[1],
        'file_name': row[2],
        'file_extension': row[3],
        'file_size_bytes': row[4]
    } for row in cursor.fetchall()]
    
    print(f"✅ Loaded {len(files)} files\n")
    
    # Classify
    classifier = LifeLibraryClassifier()
    classified = classifier.classify_batch(files)
    
    # Print report
    classifier.print_classification_report(classified)
    
    # Update database if requested
    if args.update_db:
        print("\n📝 Updating database with classifications...")
        for file in classified:
            cursor.execute('''
                UPDATE files
                SET domain = ?, subdomain = ?
                WHERE library_id = ?
            ''', (file.get('domain'), file.get('subdomain'), file.get('library_id')))
        conn.commit()
        print("✅ Database updated")
    
    conn.close()


if __name__ == '__main__':
    main()
