import os
import urllib.parse
import subprocess
import re

DRAFTS_FILE = "/Users/infinite27/.gemini/antigravity/brain/c68e0e65-4921-4e13-bfd3-bb0306de78e9/valentine_drafts.md"

def parse_drafts(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Split by draft sections
    drafts = []
    sections = re.split(r'## \d+\. ', content)[1:]
    
    for section in sections:
        title_match = re.search(r'^(.*?)\n', section)
        title = title_match.group(1).strip() if title_match else "Draft"
        
        target_match = re.search(r'\*\*Target\*\*: `(.*?)`', section)
        target = target_match.group(1).strip() if target_match else ""
        
        subject_match = re.search(r'Subject: (.*?)\n', section)
        subject = subject_match.group(1).strip() if subject_match else "No Subject"
        
        body_match = re.search(r'```markdown\nSubject:.*?\n\n(.*?)\n```', section, re.DOTALL)
        if not body_match:
             # Fallback for simple bodies
             body_match = re.search(r'```markdown\n(.*?)\n```', section, re.DOTALL)
        
        body = body_match.group(1).strip() if body_match else "No Body Found"
        
        drafts.append({
            "target": target,
            "subject": subject,
            "body": body
        })
    
    return drafts

def open_draft(draft):
    subject = urllib.parse.quote(draft['subject'])
    body = urllib.parse.quote(draft['body'])
    mailto_url = f"mailto:{draft['target']}?subject={subject}&body={body}"
    
    print(f"🚀 Opening draft for: {draft['target']}...")
    subprocess.run(["open", mailto_url])

def main():
    if not os.path.exists(DRAFTS_FILE):
        print(f"❌ Error: Drafts file not found at {DRAFTS_FILE}")
        return

    print("🧠 Parsing Valentine Refined Drafts v2.0...")
    drafts = parse_drafts(DRAFTS_FILE)
    
    for draft in drafts:
        open_draft(draft)
    
    print("\n✅ All drafts opened in Edison Mail.")
    print("💡 REMINDER: Press Cmd+S in each window to save them to your Drafts folder.")

if __name__ == "__main__":
    main()
