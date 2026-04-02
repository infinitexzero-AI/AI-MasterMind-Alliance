import argparse
import re
import os
import subprocess
from pathlib import Path

NOTES_DIR = Path(__file__).parent.parent.parent / "hippocampus_storage" / "scholar_notes"

def query_nodes(course_keyword, week_range=None, external_filter=None, doc_type=None, open_files=False, study_mode=False):
    results = []
    
    if not NOTES_DIR.exists():
        print("Hippocampus node directory is missing.")
        return
        
    valid_weeks = []
    if week_range:
        if "-" in week_range:
            start, end = map(int, week_range.split("-"))
            valid_weeks = list(range(start, end + 1))
        else:
            valid_weeks = [int(week_range)]
            
    for md_file in NOTES_DIR.glob("MOODLE_*.md"):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if course_keyword.lower() not in content.lower() and course_keyword.lower() not in md_file.name.lower():
            continue
            
        if valid_weeks:
            match = re.search(r'(class|week)[\s_]*(\d+)', md_file.name.lower())
            if not match or int(match.group(2)) not in valid_weeks:
                # Fallback to internal content
                content_match = re.search(r'(class|week)[\s_]*(\d+)', content.lower())
                if not content_match or int(content_match.group(2)) not in valid_weeks:
                    continue
                    
        if external_filter:
            if external_filter.lower() not in content.lower() and external_filter.lower() not in md_file.name.lower():
                continue
                
        if doc_type:
            if doc_type.lower() not in md_file.name.lower():
                continue
                
        results.append(md_file)
                    
    print(f"--- Vanguard Query Diagnostics: '{course_keyword}' ---")
    if not results:
        print("No mathematical telemetry nodes matched the search criteria.")
    else:
        study_payload = ""
        for r in results:
            print(f"🗂️ {r.name}")
            
            if study_mode:
                with open(r, 'r', encoding='utf-8') as f:
                    study_payload += f"\n\n--- Start Node: {r.name} ---\n\n"
                    study_payload += f.read()

            if open_files and not study_mode:
                subprocess.run(["open", str(r)])
                print("   [Triggered Native MacOS Open]")

        print(f"\n✅ Total Matches Isolated: {len(results)}")
        
        if study_mode and study_payload:
            try:
                # Pipe to MacOS pbcopy natively
                p = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
                p.communicate(input=study_payload.encode('utf-8'))
                print("\n🧠 [STUDY MODE ENGAGED]")
                print("✅ 100% of the mathematical telemetry from these nodes has been natively injected into your MacOS Clipboard!")
                print("   Simply press CMD+V in your active GPT/Claude interface to transfer exact scholarly context.")
            except Exception as e:
                print(f"⚠️ Failed to bind to MacOS clipboard: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query mathematical nodes stationed in Hippocampus")
    parser.add_argument("--course", required=True, help="Course keyword (e.g. GENS2101 or Natural)")
    parser.add_argument("--week", help="Week/Class range (e.g. '1-3' or '4')", default=None)
    parser.add_argument("--filter", help="String to filter by (e.g. 'Mitchell')", default=None)
    parser.add_argument("--type", help="Document structural type filter (e.g. 'syllabus', 'assignment', 'narrative')", default=None)
    parser.add_argument("--open", action="store_true", help="Open matching node files natively in MacOS")
    parser.add_argument("--study", action="store_true", help="Injects the absolute full-text contents of matching nodes natively into the MacOS Clipboard (pbcopy) for instant LLM pasting.")
    args = parser.parse_args()
    
    query_nodes(args.course, args.week, args.filter, args.type, args.open, args.study)
