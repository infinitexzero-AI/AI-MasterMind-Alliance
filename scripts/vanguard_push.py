import requests
import sys
import os
import argparse

# Configuration
RELAY_URL = os.getenv("RELAY_URL", "http://127.0.0.1:3001/api/system/clipboard")
AUTH_TOKEN = os.getenv("ALLIANCE_BOT_TOKEN", "antigravity_dev_key")

def push_text(text, source="MacBook-Bridge"):
    print(f"📡 [Vanguard Push] Broadcasting to Synapse Relay...")
    try:
        payload = {
            "action": "set",
            "text": text,
            "source": source
        }
        headers = {"x-alliance-token": AUTH_TOKEN}
        response = requests.post(RELAY_URL, json=payload, headers=headers, timeout=5)
        
        if response.status_code == 200:
            print(f"✅ Success: {len(text)} characters broadcasted.")
            return True
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
    return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vanguard Synapse Push Utility")
    parser.add_argument("--text", help="Text to broadcast")
    parser.add_argument("--file", help="File to broadcast")
    parser.add_argument("--source", default="MacBook-Bridge", help="Source node name")
    
    args = parser.parse_args()
    
    content = ""
    if args.text:
        content = args.text
    elif args.file:
        with open(args.file, 'r') as f:
            content = f.read()
    else:
        # Read from stdin
        if not sys.stdin.isatty():
            content = sys.stdin.read()
    
    if content:
        push_text(content, args.source)
    else:
        print("⚠️ No content provided. Use --text, --file or pipe data to stdin.")
