import os
import sys
import json
import requests
from datetime import datetime

# n8n Webhook Configuration
# Example: https://infinitexzeroai.app.n8n.cloud/webhook/your-webhook-id
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")

def trigger_n8n_workflow(payload):
    """
    Triggers an n8n workflow with the provided JSON payload.
    """
    if not N8N_WEBHOOK_URL:
        print("❌ Error: N8N_WEBHOOK_URL not set in environment.")
        return False
        
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=payload)
        response.raise_for_status()
        print(f"✅ n8n Workflow Triggered: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Failed to trigger n8n: {e}")
        return False

def pull_insights_to_tasks():
    """
    Specialized trigger for the Insight-to-Task Pipeline.
    """
    # In a real scenario, this would read from a conversation log or vault
    payload = {
        "action": "pull_insights",
        "timestamp": datetime.now().isoformat(),
        "source": "local_bridge"
    }
    return trigger_n8n_workflow(payload)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "insights":
        pull_insights_to_tasks()
    else:
        print("Usage: python3 n8n_bridge.py [insights]")
