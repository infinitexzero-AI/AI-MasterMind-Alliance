import os
import json
import requests
from datetime import datetime

# Unified Nexus Sync Hub
# Bridges: Linear (Tactical) <-> Airtable (Strategic) <-> Local (AILCC Pulse)

# Config
def load_env(path=".env"):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                key, val = line.strip().split("=", 1)
                os.environ[key] = val

load_env("/Users/infinite27/AILCC_PRIME/.env")

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_TEAM_ID = os.getenv("LINEAR_TEAM_ID", "AILCC")
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")

def get_linear_issues():
    if not LINEAR_API_KEY:
        print("⚠️ Linear API Key missing.")
        return []
    
    url = "https://api.linear.app/graphql"
    headers = {"Authorization": LINEAR_API_KEY, "Content-Type": "application/json"}
    query = """
    query Issues {
      issues(first: 10) {
        nodes {
          id
          title
          priority
          state {
            name
          }
        }
      }
    }
    """
    try:
        response = requests.post(url, headers=headers, json={"query": query})
        if response.status_code != 200:
            print(f"❌ Linear API Error {response.status_code}: {response.text}")
            return []
        
        data = response.json()
        if "errors" in data:
            print(f"❌ Linear GraphQL Errors: {data['errors']}")
            return []
            
        return data.get("data", {}).get("issues", {}).get("nodes", [])
    except Exception as e:
        print(f"❌ Linear Fetch Exception: {e}")
        return []

def sync_to_nexus():
    print(f"🚀 Initializing Tactical Sync [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]")
    
    # 1. Fetch from Linear
    issues = get_linear_issues()
    print(f"📦 Found {len(issues)} issues in Linear.")

    # 2. Update Local State (Pulse)
    pulse_path = "01_Areas/Codebases/ailcc/dashboard/server/data/mission_roadmap.json"
    if os.path.exists(pulse_path):
        with open(pulse_path, 'r') as f:
            pulse = json.load(f)
        
        pulse["tactical_state"] = issues
        pulse["last_sync"] = datetime.now().isoformat()
        
        with open(pulse_path, 'w') as f:
            json.dump(pulse, f, indent=2)
        print("✅ Local Pulse updated.")

    # 3. Push to Airtable (Strategic)
    if AIRTABLE_API_KEY and AIRTABLE_BASE_ID:
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Mission%20Manifest"
        headers = {"Authorization": f"Bearer {AIRTABLE_API_KEY}", "Content-Type": "application/json"}
        
        # Simple status update record
        payload = {
            "fields": {
                "Mission": "Nexus Tactical Sync",
                "Status": "COMPLETED",
                "System Context": f"Synced {len(issues)} items from Linear",
                "Last Sync": datetime.now().isoformat()
            }
        }
        try:
            res = requests.post(url, headers=headers, json=payload)
            res.raise_for_status()
            print("✅ Airtable Strategic Hub updated.")
        except Exception as e:
            print(f"❌ Airtable Sync Failed: {e}")

if __name__ == "__main__":
    sync_to_nexus()
