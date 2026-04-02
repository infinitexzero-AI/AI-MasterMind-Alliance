import json
import argparse
import re
from pathlib import Path
from datetime import datetime

AUTOMATIONS_DIR = Path(__file__).parent.parent
MANIFEST_DIR = AUTOMATIONS_DIR
NOTES_DIR = AUTOMATIONS_DIR.parent / "hippocampus_storage" / "scholar_notes"

def generate_item_id(course_code, week, item_type, title):
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return f"{course_code}-W{str(week).zfill(2)}-{item_type[:3].upper()}-{slug[:15]}"

def analyze_gaps(course_code):
    manifest_path = MANIFEST_DIR / f"course_manifest_{course_code}.jsonl"
    index_path = NOTES_DIR / f"course_index_{course_code}.md"
    gaps_jsonl_path = MANIFEST_DIR / f"gaps_{course_code}.jsonl"
    gaps_report_path = NOTES_DIR / f"course_outline_{course_code}.md"
    
    if not manifest_path.exists():
        print(f"Manifest not detected at {manifest_path}. Execute Comet Manifest Pass first.")
        return
        
    manifest_items = []
    with open(manifest_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                manifest_items.append(json.loads(line))
                
    synced_files = set()
    if NOTES_DIR.exists():
        for md_file in NOTES_DIR.glob(f"MOODLE_*{course_code}*.md"):
            synced_files.add(md_file.name)

    missing_items = []
    
    for item in manifest_items:
        title_slug = item['title'].replace(" ", "_").replace(":", "_").replace("(", "").replace(")", "")
        
        is_physically_synced = False
        for sf in synced_files:
            if title_slug.lower() in sf.lower() or item.get('item_id', '').lower() in sf.lower():
                is_physically_synced = True
                break
                
        # Gap detection triggers on synced=false
        if not item.get('synced', False) and not is_physically_synced:
            missing_items.append(item)
            
    if missing_items:
        with open(gaps_jsonl_path, 'w', encoding='utf-8') as f:
            for item in missing_items:
                f.write(json.dumps(item) + "\n")
                
        with open(gaps_report_path, 'w', encoding='utf-8') as f:
            f.write(f"## Course gap report — {course_code}\n")
            f.write(f"Generated: {datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')} | Daemon: course_gap_analyzer [LOCAL_ONLY]\n\n")
            f.write(f"### Unsynced items ({len(missing_items)})\n")
            f.write("| item_id | week | type | title | due_date |\n")
            f.write("|---|---|---|---|---|\n")
            for item in missing_items:
                due = item.get('due_date', '—')
                if due is None:
                    due = '—'
                f.write(f"| {item['item_id']} | {item['week']} | {item['type']} | {item['title']} | {due} |\n")
                
        print(f"✅ Gap analysis complete for {course_code}. {len(missing_items)} semantic gaps detected in the Hippocampus structural array.")
        print(f"   Output extracted to: {gaps_report_path.name}")
    else:
        print(f"✅ {course_code} is 100% perfectly synced. Zero architectural gaps detected against the JSONL manifest.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Moodle Course Gap Analyzer")
    parser.add_argument("course", help="Course code exact string (e.g. GENS2101)")
    args = parser.parse_args()
    analyze_gaps(args.course)
