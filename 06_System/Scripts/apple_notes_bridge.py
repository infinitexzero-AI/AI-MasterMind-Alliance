import subprocess
import json
import logging
import requests
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [APPLE-NOTES] %(message)s")

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

GRAPHQL_URL = "https://api.linear.app/graphql"

def get_ailcc_notes():
    # AppleScript to fetch notes from a specific folder named "AILCC"
    script = """
    tell application "Notes"
        set output to ""
        try
            set targetFolder to folder "AILCC"
            repeat with cNote in notes of targetFolder
                set output to output & name of cNote & "|||" & body of cNote & "@@@"
            end repeat
        on error
            return "ERROR_FOLDER_NOT_FOUND"
        end try
        return output
    end tell
    """
    
    res = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if "ERROR_FOLDER_NOT_FOUND" in res.stdout:
        logging.warning("Folder 'AILCC' not found in Apple Notes. Create it to sync ideas.")
        return []
        
    raw_data = res.stdout.strip()
    notes = []
    
    if raw_data:
        for chunk in raw_data.split("@@@"):
            if "|||" in chunk:
                title, body = chunk.split("|||", 1)
                # Naive strip of HTML tags from Apple Notes rich text
                clean_body = body.replace("<div>", "\\n").replace("</div>", "").replace("<br>", "\\n").replace("<html><head></head><body>", "").replace("</body></html>", "")
                notes.append({"title": title.strip(), "body": clean_body.strip()})
                
    return notes

def push_to_linear(title, description):
    # This requires knowing the Team ID in Linear.
    # We will fetch the first team ID to use as a default fallback.
    headers = {
        "Authorization": LINEAR_API_KEY,
        "Content-Type": "application/json"
    }
    
    # 1. Fetch Team ID
    team_query = "{ teams { nodes { id } } }"
    res = requests.post(GRAPHQL_URL, json={"query": team_query}, headers=headers)
    if res.status_code != 200:
        logging.error("Failed to query Linear teams.")
        return False
        
    teams = res.json().get("data", {}).get("teams", {}).get("nodes", [])
    if not teams:
        logging.error("No Linear teams found in workspace.")
        return False
        
    team_id = teams[0]["id"]
    
    # 2. Create Issue
    mutation = """
    mutation CreateIssue($title: String!, $description: String, $teamId: String!) {
      issueCreate(input: { title: $title, description: $description, teamId: $teamId }) {
        success
        issue { id url }
      }
    }
    """
    variables = {
        "title": f"[Note Sync] {title}",
        "description": description,
        "teamId": team_id
    }
    
    issue_res = requests.post(GRAPHQL_URL, json={"query": mutation, "variables": variables}, headers=headers)
    data = issue_res.json()
    
    if data.get("data", {}).get("issueCreate", {}).get("success"):
        issue = data["data"]["issueCreate"]["issue"]
        logging.info(f"✅ Synced Note '{title}' -> Linear Ticket {issue['id']}")
        return True
    else:
        logging.error(f"Failed to create issue for note: {data}")
        return False

if __name__ == "__main__":
    logging.info("Starting Apple Notes -> Linear Sync Bridge...")
    if not LINEAR_API_KEY:
        logging.error("Aborting. Linear API key is missing.")
        exit(1)
        
    notes = get_ailcc_notes()
    logging.info(f"Found {len(notes)} notes in AILCC folder.")
    
    for note in notes:
        push_to_linear(note["title"], note["body"])
