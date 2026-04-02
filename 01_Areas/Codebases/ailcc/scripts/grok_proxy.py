import os
import sys
import json
from datetime import datetime

# Path to the shared context file used by Grok/Valentine
CONTEXT_FILE = "/Users/infinite27/AILCC_PRIME/06_System/State/current_web_context.json"

def ingest_web_content(url, content, summary=None):
    """
    Saves web content to a JSON file that Grok/Valentine can pick up.
    """
    data = {
        "timestamp": datetime.now().isoformat(),
        "url": url,
        "content": content,
        "summary": summary
    }
    
    with open(CONTEXT_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Web context ingested from {url}. Ready for analysis.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 grok_proxy.py <url> <content_file>")
        sys.exit(1)
    
    url = sys.argv[1]
    content_file = sys.argv[2]
    
    if os.path.exists(content_file):
        with open(content_file, 'r') as f:
            content = f.read()
        ingest_web_content(url, content)
    else:
        print(f"❌ Content file not found: {content_file}")
