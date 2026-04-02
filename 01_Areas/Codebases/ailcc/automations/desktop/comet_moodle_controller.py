import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime
from pathlib import Path
import re
import sys

# AILCC Prime Paths
AUTOMATIONS_DIR = Path(__file__).parent.parent
SPOOL_DIR = AUTOMATIONS_DIR.parent / "moodle_spool"
LOG_FILE = SPOOL_DIR / "download_log.jsonl"
MOODLE_URL = "https://moodle.mta.ca/"

def generate_item_id(course_code, week, item_type, title):
    slug = re.sub(r'[^a-z0-9]+', '-', str(title).lower()).strip('-')
    return f"{course_code}-W{str(week).zfill(2)}-{item_type[:3].upper()}-{slug[:15]}"

def extract_course_code(title):
    match = re.search(r'([A-Z]{4}\s*\d{4})', title, re.IGNORECASE)
    if match:
        return match.group(1).replace(" ", "")
    # Fallback to a hash if code is obfuscated
    return title.split(" ")[0]

async def harvest_moodle():
    print("\n🚀 [Comet] Moodle Harvest Protocol Initiated (MANIFEST MODE)")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(accept_downloads=True)
        page = await context.new_page()

        print(f"Commander: Navigating to {MOODLE_URL}...")
        await page.goto(MOODLE_URL)
        
        print("⏸️  Waiting for Commander to manually authenticate using native credentials.")
        print("   No session cookies are extracted or reused.")
        print("   Comet is structurally paused. Navigate safely to a Course Page when ready.")
        
        await page.wait_for_url("**/course/view.php*", timeout=0)
        print("\n✅ Authentication confirmed. Active supervised session locked on a course.")
        
        while True:
            course_title = await page.title()
            course_code = extract_course_code(course_title)
            print(f"\n📚 Entered Course Matrix: {course_title} ({course_code})")
            
            manifest_path = AUTOMATIONS_DIR / f"course_manifest_{course_code}.jsonl"
            
            print(f"   [Manifest] Scanning DOM structure for {course_code}...")
            
            # Execute JS in browser to parse Moodle DOM
            raw_items = await page.evaluate('''() => {
                const results = [];
                const sections = document.querySelectorAll('li.section.main');
                
                sections.forEach((section, index) => {
                    const weekNum = index;
                    const activities = section.querySelectorAll('li.activity');
                    
                    activities.forEach((act) => {
                        const instancename = act.querySelector('.instancename');
                        if(instancename) {
                            let title = "Unknown Resource";
                            if(instancename.childNodes.length > 0) {
                                title = instancename.childNodes[0].nodeValue;
                                if(title) title = title.trim();
                            }
                            if(!title || title === "Unknown Resource") {
                                title = instancename.innerText.split('\\n')[0].trim();
                            }
                            
                            const anchor = act.querySelector('a');
                            const url = anchor ? anchor.href : "";
                            
                            let type = "lecture";
                            let file_type = "link";
                            
                            if(act.classList.contains('assign')) {
                                type = "assignment";
                                file_type = "assignment";
                            } else if(act.classList.contains('quiz')) {
                                type = "quiz";
                                file_type = "quiz";
                            } else if(act.classList.contains('resource')) {
                                type = "reading";
                                if(act.innerHTML.includes('pdf')) file_type = "pdf";
                                else if(act.innerHTML.includes('powerpoint')) file_type = "pptx";
                            }
                            
                            results.push({
                                title: title || "Unknown Resource",
                                url: url,
                                week: weekNum,
                                type: type,
                                file_type: file_type
                            });
                        }
                    });
                });
                return results;
            }''')
            
            print(f"   ✅ DOM scan pulled {len(raw_items)} physical objects.")
            
            # Write to JSONL
            with open(manifest_path, 'a', encoding='utf-8') as f:
                for item in raw_items:
                    item_id = generate_item_id(course_code, item['week'], item['type'], item['title'])
                    
                    record = {
                        "item_id": item_id,
                        "week": item['week'],
                        "type": item['type'],
                        "title": item['title'],
                        "url": item['url'],
                        "file_type": item['file_type'],
                        "scraped_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
                        "checksum": None,
                        "synced": False,
                        "local_path": None
                    }
                    if item['type'] == 'assignment':
                        record["due_date"] = None # Optional logic for future DOM scraping
                        
                    f.write(json.dumps(record) + "\n")
                    
            print(f"   ✅ Saved manifest successfully to: {manifest_path.name}")
            print(f"\n[Comet] Navigate to another course in the Playwright window to scan it.")
            break
            # We removed the infinite loop locally to prevent Commander friction.
            # Rerunning the script is safer.

        print("\n🛑 Manifest extraction complete.")
        print("Commander: The supervised sweep has finished.")
        print("Please manually click 'Log out' in Moodle to terminate the session cookies.")
        print("Comet will automatically close the Chromium window the moment the logout returns to the public gateway.")
        
        await page.wait_for_url("**/login/**", timeout=0)
        
        print("\n✅ Session logged natively. Browser terminating. The environment is now perfectly sealed.")

if __name__ == "__main__":
    try:
        asyncio.run(harvest_moodle())
    except KeyboardInterrupt:
        print("\n🛑 Comet explicitly halted by Commander shortcut.")
