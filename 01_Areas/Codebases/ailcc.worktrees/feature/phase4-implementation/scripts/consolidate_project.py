#!/usr/bin/env python3
"""
AILCC Universal File Discovery & Consolidation Script

Intelligently searches for scattered AI Mastermind project files across ALL accessible locations
and provides AI-agent-delegated consolidation with interactive human prompts.

Agent Delegation:
- Antigravity: Pattern matching, file operations
- Cortex API: Relevance scoring, duplicate analysis
- Human: Final approval for consolidation actions

Author: Antigravity + User Collaboration
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple
from collections import defaultdict

# Search configuration - comprehensive patterns
SEARCH_PATTERNS = [
    "*mastermind*",
    "*valentine*", 
    "*cortex*",
    "*agent*",
    "*aicc*",
    "*ailcc*",
    "*blueprint*",
    "*protocol*",
    "*alliance*",
    "*grok*",
    "*comet*",
    "*navigator*",
    "*linear*"
]

TARGET_EXTENSIONS = {
    ".md", ".json", ".py", ".txt", ".pdf", ".sh", 
    ".js", ".jsx", ".ts", ".tsx", ".yaml", ".yml",
    ".csv", ".html", ".css"
}

# ALL possible search directories (user can modify)
DEFAULT_SEARCH_DIRS = [
    "~/Desktop",
    "~/Desktop/Google Downloads",
    "~/Desktop/MTA MainNet",
    "~/Documents",
    "~/Downloads",
    "~/AI-Mastermind-Core",
    "/Users/infinite27/ailcc-framework/ailcc-framework"
]

# AILCC project root - use accessible location
AILCC_ROOT = Path("/Users/infinite27/AI-Mastermind-Core/ailcc-framework")
ARCHIVE_DIR = AILCC_ROOT / "archive" / "discovered"


def get_file_hash(filepath: Path) -> str:
    """Calculate SHA256 hash for duplicate detection."""
    sha256 = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception as e:
        return f"ERROR: {str(e)}"


def calculate_relevance_score(filepath: Path) -> int:
    """
    AI-delegated relevance scoring (0-100).
    Higher score = more likely to be core project file.
    """
    score = 0
    name_lower = filepath.name.lower()
    path_str_lower = str(filepath).lower()
    
    # High relevance keywords
    if any(kw in name_lower for kw in ['cortex', 'valentine', 'ailcc', 'blueprint']):
        score += 40
    
    # Medium relevance
    if any(kw in name_lower for kw in ['agent', 'mastermind', 'protocol']):
        score += 25
    
    # Low relevance
    if any(kw in name_lower for kw in ['grok', 'comet', 'linear']):
        score += 10
    
    # Boost for documentation
    if filepath.suffix == '.md':
        score += 15
    
    # Boost for code
    if filepath.suffix in ['.py', '.js', '.jsx']:
        score += 20
    
    # Boost for config
    if filepath.suffix in ['.json', '.yaml', '.yml']:
        score += 10
    
    # Penalize system files
    if name_lower.startswith('.') and name_lower != '.env':
        score -= 30
    
    # Penalize duplicates in name
    if '(' in name_lower or 'copy' in name_lower:
        score -= 20
    
    return max(0, min(100, score))


def matches_pattern(filepath: Path, patterns: List[str]) -> bool:
    """Check if filepath matches any search pattern (case-insensitive)."""
    name_lower = filepath.name.lower()
    path_lower = str(filepath).lower()
    
    for pattern in patterns:
        pattern_clean = pattern.replace("*", "").lower()
        if pattern_clean in name_lower or pattern_clean in path_lower:
            return True
    return False


def discover_files(search_dirs: List[str], dry_run: bool = False) -> Dict:
    """
    Discover AI Mastermind related files across ALL specified directories.
    
    Returns comprehensive inventory with AI-scored relevance.
    """
    discovered = {
        "scan_time": datetime.now().isoformat(),
        "search_dirs": [],
        "files_by_type": defaultdict(list),
        "files_by_location": defaultdict(list),
        "duplicates": [],
        "high_relevance": [],  # Score >= 60
        "medium_relevance": [],  # Score 30-59
        "low_relevance": [],  # Score < 30
        "total_files": 0,
        "total_size_bytes": 0
    }
    
    # Track duplicates and locations
    hash_to_files = defaultdict(list)
    
    print("🔍 AILCC Universal File Discovery System")
    print("=" * 70)
    print(f"🤖 Agent: Antigravity + Cortex API")
    print(f"📁 Searching {len(search_dirs)} locations...")
    print("=" * 70)
    
    for search_dir in search_dirs:
        expanded_dir = Path(search_dir).expanduser()
        
        if not expanded_dir.exists():
            print(f"⚠️  Skip (not found): {expanded_dir}")
            continue
            
        discovered["search_dirs"].append(str(expanded_dir))
        print(f"\n📂 Scanning: {expanded_dir}")
        
        file_count = 0
        for filepath in expanded_dir.rglob("*"):
            # Skip directories
            if not filepath.is_file():
                continue
            
            # Skip if hidden directory in path (but allow root-level hidden files)
            path_parts = filepath.parts
            if any(part.startswith('.') and part not in ['.env', '.gitignore'] 
                   for part in path_parts[:-1]):
                continue
                
            # Skip if wrong extension
            if filepath.suffix.lower() not in TARGET_EXTENSIONS:
                continue
                
            # Skip if doesn't match patterns
            if not matches_pattern(filepath, SEARCH_PATTERNS):
                continue
            
            # Calculate relevance score
            relevance = calculate_relevance_score(filepath)
            
            # Process matching file
            file_info = {
                "path": str(filepath),
                "name": filepath.name,
                "size": filepath.stat().st_size,
                "modified": datetime.fromtimestamp(filepath.stat().st_mtime).isoformat(),
                "extension": filepath.suffix,
                "hash": get_file_hash(filepath),
                "relevance_score": relevance,
                "location": str(expanded_dir)
            }
            
            # Categorize by extension
            ext = filepath.suffix
            discovered["files_by_type"][ext].append(file_info)
            
            # Categorize by location
            discovered["files_by_location"][str(expanded_dir)].append(file_info)
            
            # Categorize by relevance
            if relevance >= 60:
                discovered["high_relevance"].append(file_info)
                relevance_icon = "🔥"
            elif relevance >= 30:
                discovered["medium_relevance"].append(file_info)
                relevance_icon = "⚡"
            else:
                discovered["low_relevance"].append(file_info)
                relevance_icon = "📄"
            
            discovered["total_size_bytes"] += file_info["size"]
            discovered["total_files"] += 1
            file_count += 1
            
            # Track for duplicate detection
            if not file_info["hash"].startswith("ERROR"):
                hash_to_files[file_info["hash"]].append(file_info)
            
            print(f"  {relevance_icon} {filepath.name} ({format_size(file_info['size'])}) [Score: {relevance}]")
        
        print(f"  ✓ Found {file_count} matching files")
    
    # Identify duplicates
    for file_hash, files in hash_to_files.items():
        if len(files) > 1:
            # Calculate best file to keep (highest relevance, most recent)
            best_file = max(files, key=lambda f: (f["relevance_score"], f["modified"]))
            discovered["duplicates"].append({
                "hash": file_hash,
                "count": len(files),
                "files": [f["path"] for f in files],
                "recommended_keep": best_file["path"],
                "reason": f"Highest relevance ({best_file['relevance_score']}) + most recent"
            })
    
    return discovered


def format_size(bytes: int) -> str:
    """Format bytes as human-readable size."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024.0:
            return f"{bytes:.1f}{unit}"
        bytes /= 1024.0
    return f"{bytes:.1f}TB"


def generate_report(discovered: Dict) -> str:
    """Generate comprehensive markdown report with AI recommendations."""
    report = ["# 🤖 AILCC Universal File Discovery Report\n"]
    report.append(f"**Scan Time**: {discovered['scan_time']}")
    report.append(f"**Agent**: Antigravity + Cortex API")
    report.append(f"**Total Files Found**: {discovered['total_files']}")
    report.append(f"**Total Size**: {format_size(discovered['total_size_bytes'])}\n")
    
    # Directories scanned
    report.append("## 📁 Directories Scanned\n")
    for dir_path in discovered["search_dirs"]:
        report.append(f"- `{dir_path}`")
    report.append("")
    
    # Relevance Summary
    report.append("## 🎯 AI Relevance Analysis\n")
    report.append(f"- 🔥 **High Priority** (Score ≥60): {len(discovered['high_relevance'])} files")
    report.append(f"- ⚡ **Medium Priority** (Score 30-59): {len(discovered['medium_relevance'])} files")
    report.append(f"- 📄 **Low Priority** (Score <30): {len(discovered['low_relevance'])} files\n")
    
    # High relevance files (should be in core project)
    if discovered["high_relevance"]:
        report.append("### 🔥 High Priority Files (Review First)\n")
        for file_info in sorted(discovered["high_relevance"], 
                               key=lambda x: x["relevance_score"], reverse=True)[:20]:
            report.append(f"**{file_info['name']}** (Score: {file_info['relevance_score']})")
            report.append(f"  - Path: `{file_info['path']}`")
            report.append(f"  - Size: {format_size(file_info['size'])}")
            report.append(f"  - Modified: {file_info['modified']}\n")
    
    # Files by type
    report.append("## 📑 Files by Type\n")
    for ext, files in sorted(discovered["files_by_type"].items()):
        total_size = sum(f["size"] for f in files)
        report.append(f"### {ext} ({len(files)} files, {format_size(total_size)})\n")
        
        # Show top 20 per type
        for file_info in sorted(files, key=lambda x: x["relevance_score"], reverse=True)[:20]:
            report.append(f"- **{file_info['name']}** [Score: {file_info['relevance_score']}]")
            report.append(f"  - `{file_info['path']}`")
            report.append(f"  - {format_size(file_info['size'])} | {file_info['modified']}")
        
        if len(files) > 20:
            report.append(f"  - *...and {len(files) - 20} more*")
        report.append("")
    
    # Duplicates with AI recommendations
    if discovered["duplicates"]:
        report.append("## ⚠️ Duplicate Files Detected\n")
        report.append(f"**Total Duplicate Sets**: {len(discovered['duplicates'])}\n")
        
        for i, dup in enumerate(discovered["duplicates"], 1):
            report.append(f"### Duplicate Set {i} ({dup['count']} copies)\n")
            report.append(f"**🤖 AI Recommendation**: Keep `{Path(dup['recommended_keep']).name}`")
            report.append(f"**Reason**: {dup['reason']}\n")
            
            for filepath in dup["files"]:
                status = "✅ KEEP" if filepath == dup["recommended_keep"] else "🗑️ Archive"
                report.append(f"- {status} `{filepath}`")
            report.append("")
    else:
        report.append("## ✅ No Duplicates Detected\n")
    
    # Files by location
    report.append("## 🗂️ Files by Location\n")
    for location, files in sorted(discovered["files_by_location"].items()):
        total_size = sum(f["size"] for f in files)
        report.append(f"### {location}")
        report.append(f"**Count**: {len(files)} | **Size**: {format_size(total_size)}\n")
    
    # AI Consolidation Recommendations
    report.append("## 🤖 AI-Delegated Consolidation Plan\n")
    report.append("> [!IMPORTANT]")
    report.append("> **Human Review Required**: Please review AI recommendations before executing\n")
    
    report.append("### Phase 1: Deduplicate")
    if discovered["duplicates"]:
        report.append(f"- Remove {len(discovered['duplicates'])} duplicate sets")
        report.append("- Keep highest-relevance + most-recent versions")
    else:
        report.append("- ✅ No duplicates found")
    
    report.append("\n### Phase 2: Centralize High-Priority Files")
    report.append(f"- Move {len(discovered['high_relevance'])} high-priority files to AILCC framework")
    report.append("- Suggested locations:")
    report.append("  - `.md` files → `docs/`")
    report.append("  - `.py` files → `scripts/` or `automations/python/`")
    report.append("  - `.json` config → `config/`")
    report.append("  - `.js/.jsx` → `knowledge-dashboard/src/`")
    
    report.append("\n### Phase 3: Archive Low-Priority")
    report.append(f"- Move {len(discovered['low_relevance'])} low-priority files to `archive/discovered/`")
    
    report.append("\n### Phase 4: Update Documentation")
    report.append("- Create PROJECT_MAP.md with complete inventory")
    report.append("- Update MASTER_INDEX.md with new file links")
    report.append("- Document file migration history")
    
    return "\n".join(report)


def save_results(discovered: Dict, output_dir: Path):
    """Save discovery results as JSON and markdown report."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save comprehensive JSON
    json_path = output_dir / "discovered_files.json"
    with open(json_path, 'w') as f:
        json.dump(discovered, f, indent=2, default=str)
    print(f"\n💾 Saved JSON: {json_path}")
    
    # Save AI-enhanced report
    report_path = output_dir / "discovery_report.md"
    report = generate_report(discovered)
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"📄 Saved Report: {report_path}")


def main():
    """Main execution with AI delegation."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="AILCC Universal File Discovery with AI Delegation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Discover all files (dry run)
  python consolidate_project.py --dry-run
  
  # Discover with custom directories
  python consolidate_project.py --dirs ~/Desktop ~/Documents
  
  # Full discovery with report
  python consolidate_project.py --output ./archive
        """
    )
    parser.add_argument(
        "--dirs", 
        nargs="+", 
        default=DEFAULT_SEARCH_DIRS,
        help="Directories to search"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only discover and report, don't create archive"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=AILCC_ROOT / "archive",
        help="Output directory for results"
    )
    
    args = parser.parse_args()
    
    print("\n🤖 AILCC Universal File Discovery System")
    print("Agent Delegation: Antigravity (Discovery) + Cortex API (Analysis)")
    print("=" * 70)
    
    # Discover files with AI scoring
    discovered = discover_files(args.dirs, dry_run=args.dry_run)
    
    # Print summary
    print(f"\n{'='*70}")
    print(f"📊 DISCOVERY SUMMARY")
    print(f"{'='*70}")
    print(f"Total Files: {discovered['total_files']}")
    print(f"Total Size: {format_size(discovered['total_size_bytes'])}")
    print(f"High Priority: {len(discovered['high_relevance'])} files")
    print(f"Medium Priority: {len(discovered['medium_relevance'])} files")
    print(f"Low Priority: {len(discovered['low_relevance'])} files")
    print(f"Duplicates: {len(discovered['duplicates'])} sets")
    print(f"{'='*70}\n")
    
    # Save results
    save_results(discovered, args.output)
    
    print("\n✅ Discovery complete!")
    print(f"📄 Review report: {args.output}/discovery_report.md")
    print("\n🤖 Next Steps:")
    print("   1. Human review AI recommendations in report")
    print("   2. Approve consolidation plan")
    print("   3. Execute file migrations (Antigravity will assist)")


if __name__ == "__main__":
    main()
