#!/usr/bin/env python3
"""
Progressive Summarizer - Second Brain "Distill" Phase
Automatically creates layered summaries of documents using Gemini AI

Based on Tiago Forte's Progressive Summarization technique:
Layer 1: Original content
Layer 2: Bold important sentences  
Layer 3: Highlight key phrases
Layer 4: Executive summary

Usage:
    python3 progressive_summarizer.py --file path/to/document.pdf
    python3 progressive_summarizer.py --batch --domain academic
    python3 progressive_summarizer.py --update-db
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import argparse

try:
    import google.generativeai as genai
except ImportError:
    print("❌ google-generativeai not installed. Run: pip install google-generativeai")
    sys.exit(1)

try:
    import PyPDF2
except ImportError:
    print("⚠️  PyPDF2 not installed. PDF support limited. Run: pip install PyPDF2")
    PyPDF2 = None

try:
    import docx
except ImportError:
    print("⚠️  python-docx not installed. DOCX support limited. Run: pip install python-docx")
    docx = None


class ProgressiveSummarizer:
    def __init__(self, api_key: Optional[str] = None):
        # Try to get API key from environment or config
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            # Try to load from AILCC config
            config_path = Path.home() / "ailcc-framework" / "ailcc-framework" / "config" / "credentials" / "gemini.json"
            if config_path.exists():
                with open(config_path) as f:
                    config = json.load(f)
                    self.api_key = config.get('api_key')
        
        if not self.api_key:
            raise ValueError("Gemini API key not found. Set GEMINI_API_KEY env var or add to config/credentials/gemini.json")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
        self.library_root = Path.home() / "LifeLibrary"
        self.inventory_db = Path.home() / "ailcc-framework" / "ailcc-framework" / "life_library_inventory_full.db"
        
    def extract_text(self, file_path: Path) -> Optional[str]:
        """Extract text from various file formats"""
        
        try:
            ext = file_path.suffix.lower()
            
            if ext == '.txt':
                return file_path.read_text(errors='ignore')
            
            elif ext == '.md':
                return file_path.read_text(errors='ignore')
            
            elif ext == '.pdf' and PyPDF2:
                with open(file_path, 'rb') as f:
                    pdf = PyPDF2.PdfReader(f)
                    text = ""
                    # Limit to first 50 pages for performance
                    for page in pdf.pages[:50]:
                        text += page.extract_text()
                    return text
            
            elif ext in ['.docx', '.doc'] and docx:
                doc = docx.Document(file_path)
                return '\n'.join([para.text for para in doc.paragraphs])
            
            elif ext in ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h']:
                # Code files
                return file_path.read_text(errors='ignore')
            
            else:
                print(f"  ⚠️  Unsupported file type: {ext}")
                return None
                
        except Exception as e:
            print(f"  ❌ Error extracting text: {e}")
            return None
    
    def create_progressive_summary(self, text: str, file_name: str) -> Dict:
        """Create progressive summary using Gemini"""
        
        # Limit text to ~15KB for API efficiency
        text_preview = text[:15000] if len(text) > 15000 else text
        
        prompt = f"""Analyze this document and create a progressive summary following the Building a Second Brain methodology.

Document: {file_name}

Content:
{text_preview}

Create a summary with these sections:

1. EXECUTIVE SUMMARY (2-3 sentences capturing the essence)
2. KEY POINTS (5-7 main ideas as bullet points)
3. IMPORTANT DETAILS (3-5 specific facts, quotes, or insights worth remembering)
4. ACTIONABLE TAKEAWAYS (2-3 things I can DO with this information)
5. CONNECTIONS (Suggest 2-3 topics or areas this relates to)

Format as markdown. Be concise but insightful."""

        try:
            response = self.model.generate_content(prompt)
            summary_text = response.text
            
            return {
                'summary': summary_text,
                'created': datetime.now().isoformat(),
                'word_count': len(text.split()),
                'preview_length': len(text_preview),
                'status': 'success'
            }
            
        except Exception as e:
            return {
                'summary': None,
                'created': datetime.now().isoformat(),
                'error': str(e),
                'status': 'failed'
            }
    
    def save_summary(self, file_path: Path, summary_data: Dict):
        """Save summary as .summary.md file"""
        
        summary_path = file_path.parent / f"{file_path.stem}.summary.md"
        
        content = f"""# Summary: {file_path.name}

**Created**: {summary_data['created']}  
**Original**: {file_path}  
**Word Count**: {summary_data.get('word_count', 'N/A')}

---

{summary_data['summary']}

---

*Generated by Life Library Progressive Summarizer*  
*Part of Second Brain integration*
"""
        
        summary_path.write_text(content)
        return summary_path
    
    def update_database(self, file_path: Path, summary_path: Path):
        """Add summary reference to inventory database"""
        
        if not self.inventory_db.exists():
            return
        
        try:
            conn = sqlite3.connect(self.inventory_db)
            cursor = conn.cursor()
            
            # Check if summary column exists
            cursor.execute("PRAGMA table_info(files)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'summary_path' not in columns:
                cursor.execute("ALTER TABLE files ADD COLUMN summary_path TEXT")
            
            if 'has_summary' not in columns:
                cursor.execute("ALTER TABLE files ADD COLUMN has_summary INTEGER DEFAULT 0")
            
            # Update the file record
            cursor.execute("""
                UPDATE files 
                SET summary_path = ?, has_summary = 1 
                WHERE file_path = ?
            """, (str(summary_path), str(file_path)))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"  ⚠️  Database update failed: {e}")
    
    def summarize_file(self, file_path: Path, update_db: bool = True) -> bool:
        """Summarize a single file"""
        
        print(f"\n📄 Processing: {file_path.name}")
        
        # Check if summary already exists
        summary_path = file_path.parent / f"{file_path.stem}.summary.md"
        if summary_path.exists():
            print(f"  ℹ️  Summary already exists, skipping")
            return False
        
        # Extract text
        print(f"  📖 Extracting text...")
        text = self.extract_text(file_path)
        
        if not text or len(text.strip()) < 100:
            print(f"  ⚠️  Insufficient text content")
            return False
        
        # Create summary
        print(f"  🧠 Generating summary...")
        summary_data = self.create_progressive_summary(text, file_path.name)
        
        if summary_data['status'] != 'success':
            print(f"  ❌ Summarization failed: {summary_data.get('error', 'Unknown error')}")
            return False
        
        # Save summary
        print(f"  💾 Saving summary...")
        saved_path = self.save_summary(file_path, summary_data)
        
        # Update database
        if update_db:
            self.update_database(file_path, saved_path)
        
        print(f"  ✅ Summary created: {saved_path.name}")
        return True
    
    def batch_summarize(self, domain: Optional[str] = None, limit: int = 10) -> Dict:
        """Batch summarize files from a domain"""
        
        results = {
            'processed': 0,
            'created': 0,
            'skipped': 0,
            'failed': 0
        }
        
        # Find files to summarize
        if domain:
            domain_map = {
                'academic': 'Academic_Wing',
                'professional': 'Professional_Wing',
                'personal': 'Personal_Wing',
                'ai_technical': 'AI_&_Technical_Wing',
                'creative': 'Creative_Wing'
            }
            domain_path = self.library_root / domain_map.get(domain, domain)
            
            if not domain_path.exists():
                print(f"❌ Domain not found: {domain}")
                return results
            
            # Find files in _Active folder (current work)
            active_folder = domain_path / "_Active"
            if active_folder.exists():
                files = []
                for ext in ['.pdf', '.docx', '.txt', '.md', '.py']:
                    files.extend(active_folder.rglob(f'*{ext}'))
            else:
                files = []
                for ext in ['.pdf', '.docx', '.txt', '.md']:
                    files.extend(domain_path.rglob(f'*{ext}'))
                    if len(files) >= limit * 2:
                        break
        else:
            # Summarize from all domains
            files = []
            for ext in ['.pdf', '.docx', '.txt', '.md']:
                files.extend(self.library_root.rglob(f'*{ext}'))
                if len(files) >= limit * 2:
                    break
        
        # Filter out already summarized
        files = [f for f in files if not (f.parent / f"{f.stem}.summary.md").exists()]
        files = files[:limit]
        
        print(f"\n📚 Batch Summarization")
        print(f"{'='*60}")
        print(f"Domain: {domain or 'All'}")
        print(f"Files to process: {len(files)}")
        print(f"{'='*60}")
        
        for file_path in files:
            results['processed'] += 1
            
            try:
                success = self.summarize_file(file_path, update_db=True)
                if success:
                    results['created'] += 1
                else:
                    results['skipped'] += 1
                    
            except Exception as e:
                results['failed'] += 1
                print(f"  ❌ Error: {e}")
        
        return results


def main():
    parser = argparse.ArgumentParser(description='Progressive Summarizer for Second Brain')
    parser.add_argument('--file', type=str, help='Summarize a specific file')
    parser.add_argument('--batch', action='store_true', help='Batch summarize files')
    parser.add_argument('--domain', type=str, choices=['academic', 'professional', 'personal', 'ai_technical', 'creative'],
                       help='Domain to summarize from')
    parser.add_argument('--limit', type=int, default=10, help='Number of files to summarize in batch mode')
    parser.add_argument('--update-db', action='store_true', help='Update inventory database')
    parser.add_argument('--api-key', type=str, help='Gemini API key')
    
    args = parser.parse_args()
    
    try:
        summarizer = ProgressiveSummarizer(api_key=args.api_key)
        
        if args.file:
            file_path = Path(args.file)
            if not file_path.exists():
                print(f"❌ File not found: {args.file}")
                return
            
            summarizer.summarize_file(file_path, update_db=args.update_db)
            
        elif args.batch:
            results = summarizer.batch_summarize(domain=args.domain, limit=args.limit)
            
            print(f"\n{'='*60}")
            print(f"📊 Batch Summary Results")
            print(f"{'='*60}")
            print(f"  Processed: {results['processed']}")
            print(f"  Created: {results['created']} ✅")
            print(f"  Skipped: {results['skipped']}")
            print(f"  Failed: {results['failed']}")
            print(f"{'='*60}\n")
            
        else:
            print("Usage: python3 progressive_summarizer.py --file <path> or --batch")
            print("\nExamples:")
            print("  # Summarize one file")
            print("  python3 progressive_summarizer.py --file ~/LifeLibrary/Academic_Wing/_Active/lecture1.pdf")
            print("\n  # Batch summarize 10 academic files")
            print("  python3 progressive_summarizer.py --batch --domain academic --limit 10")
            print("\n  # Summarize all domains")
            print("  python3 progressive_summarizer.py --batch --limit 20")
    
    except ValueError as e:
        print(f"\n❌ {e}")
        print("\nTo set up Gemini API key:")
        print("1. Get key from: https://makersuite.google.com/app/apikey")
        print("2. Set env var: export GEMINI_API_KEY='your-key-here'")
        print("3. Or create: ~/ailcc-framework/ailcc-framework/config/credentials/gemini.json")
        print('   {"api_key": "your-key-here"}')


if __name__ == '__main__':
    main()
