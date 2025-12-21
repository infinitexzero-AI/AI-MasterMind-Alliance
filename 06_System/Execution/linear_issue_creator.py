import os
import requests
import json
import logging

# Configure Logging
log_file = "06_System/Logs/linear_sync.log"
os.makedirs(os.path.dirname(log_file), exist_ok=True)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger("LinearSync")

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_TEAM_ID = os.getenv("LINEAR_TEAM_ID") # e.g. "AILCC"

def create_linear_issue(title, description, priority=3):
    """Priority: 1 (Urgent), 2 (High), 3 (Normal), 4 (Low)"""
    logger.info(f"🚩 Creating Linear Issue: {title}")
    
    if not LINEAR_API_KEY or not LINEAR_TEAM_ID:
        logger.warning("⚠️ Linear credentials missing. Simulation mode.")
        return {"status": "simulated", "id": "LIN-123"}

    url = "https://api.linear.app/graphql"
    headers = {
        "Content-Type": "application/json",
        "Authorization": LINEAR_API_KEY
    }

    query = """
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          title
          url
        }
      }
    }
    """

    variables = {
        "input": {
            "title": title,
            "description": description,
            "teamId": LINEAR_TEAM_ID,
            "priority": priority
        }
    }

    try:
        response = requests.post(url, headers=headers, json={'query': query, 'variables': variables})
        response.raise_for_status()
        data = response.json()
        if data.get('data', {}).get('issueCreate', {}).get('success'):
            issue = data['data']['issueCreate']['issue']
            logger.info(f"✅ Linear Issue Created: {issue['url']}")
            return {"status": "success", "url": issue['url']}
        else:
            logger.error(f"Linear Error: {data}")
            return {"status": "error", "message": data}
    except Exception as e:
        logger.error(f"Failed to connect to Linear: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Test
    create_linear_issue(
        "Agent Failure: Scout Extraction Timeout",
        "The Comet Scout timed out while extracting data from IEEE Xplore. Trace ID: extraction_fail_001"
    )
