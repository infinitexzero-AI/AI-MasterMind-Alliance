import os
import time
import requests
import json
from datetime import datetime, timezone, timedelta
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [AUDIT-DAEMON] %(message)s")

# Load Linear API Key
ENV_PATH = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/.env.local"
LINEAR_API_KEY = None

try:
    with open(ENV_PATH, 'r') as f:
        for line in f:
            if line.startswith("LINEAR_API_KEY="):
                LINEAR_API_KEY = line.split("=", 1)[1].strip()
except Exception as e:
    logging.error(f"Failed to read Linear API Key: {e}")

if not LINEAR_API_KEY:
    logging.error("No Linear API Key found. Aborting Audit Daemon.")
    exit(1)

VAULT_DIR = "/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault/Audits"
os.makedirs(VAULT_DIR, exist_ok=True)
STATE_FILE = os.path.join(VAULT_DIR, ".audit_state.json")

GRAPHQL_URL = "https://api.linear.app/graphql"

def load_last_checked():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f).get("last_checked")
    return (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat().replace("+00:00", "Z")

def save_last_checked(timestamp):
    with open(STATE_FILE, "w") as f:
        json.dump({"last_checked": timestamp}, f)

QUERY = """
query GetRecentlyClosedIssues($updatedAt: DateTimeOrDuration!) {
  issues(filter: { state: { name: { eq: "Done" } }, updatedAt: { gte: $updatedAt } }) {
    nodes {
      id
      title
      description
      completedAt
      createdAt
      estimate
      assignee {
        name
      }
      comments {
        nodes {
          body
        }
      }
    }
  }
}
"""

def generate_audit_file(issue):
    issue_id = issue['id']
    title = issue['title']
    safe_title = "".join([c if c.isalnum() else "_" for c in title])
    
    file_name = f"{issue_id}_{safe_title}_Audit.md"
    file_path = os.path.join(VAULT_DIR, file_name)
    
    # Don't overwrite existing audits unless we want to update them
    if os.path.exists(file_path):
        return
        
    logging.info(f"Generating retrospective audit for ticket: {issue_id}")
    
    completed = issue.get('completedAt', 'Unknown')
    created = issue.get('createdAt', 'Unknown')
    assignee = issue.get('assignee', {})
    assignee_name = assignee.get('name', 'Swarm Interface') if assignee else 'Swarm Interface'
    desc = issue.get('description') or "No description provided."
    comments = issue.get('comments', {}).get('nodes', [])
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(f"# 🔍 Retrospective Audit: {issue_id}\n")
        f.write(f"**Title**: {title}\n")
        f.write(f"**Completed**: {completed}\n")
        f.write(f"**Lead Agent**: {assignee_name}\n\n")
        
        f.write("## Original Directive\n")
        f.write(f"{desc}\n\n")
        
        f.write("## Execution Log & Consensus\n")
        if comments:
            for c in comments:
                f.write(f"- {c['body']}\n")
        else:
            f.write("No operational comments recorded during execution.\n")
            
        f.write("\n## Entropy & System Impact\n")
        f.write("*(Auto-generated during closure)*: The ticket was closed successfully. Awaiting Judge v2.0 heuristics for code-level impact analysis.\n")
        
def run_loop():
    logging.info("Starting Retrospective Audit Daemon...")
    while True:
        try:
            last_checked = load_last_checked()
            
            headers = {
                "Authorization": LINEAR_API_KEY,
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": QUERY,
                "variables": { "updatedAt": last_checked }
            }
            
            res = requests.post(GRAPHQL_URL, json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                issues = data.get("data", {}).get("issues", {}).get("nodes", [])
                
                for issue in issues:
                    generate_audit_file(issue)
                    
                # Update watermark to now
                save_last_checked(datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
            else:
                logging.error(f"GraphQL Error: {res.text}")
                
        except Exception as e:
            logging.error(f"Audit loop error: {e}")
            
        time.sleep(60) # Poll every 60 seconds

if __name__ == "__main__":
    run_loop()
