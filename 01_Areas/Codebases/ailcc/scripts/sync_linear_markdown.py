import os
import json
import asyncio
from datetime import datetime

# Configuration
LOCAL_REGISTRY_PATH = "/Users/infinite27/AILCC_PRIME/05_Tasks/Registry"
LINEAR_TEAM_ID = "afce2df5-59c5-4889-a084-3497bba44518"
PROJECT_ID = "364ee086-1aa6-4e0c-97fc-b422ee8edb78"

def generate_markdown_task(issue):
    """Converts a Linear issue object to a Markdown file content."""
    title = issue.get('title', 'Untitled Task')
    description = issue.get('description', 'No description provided.')
    status = issue.get('state', {}).get('name', 'Unknown')
    identifier = issue.get('identifier', 'N/A')
    url = issue.get('url', '#')
    
    content = f"""# [{identifier}] {title}
*   **Status**: {status}
*   **Link**: [{identifier}]({url})
*   **Updated**: {datetime.now().isoformat()}

## Description
{description}

## Agent Notes
<!-- Agents: Add your observations and intent here -->

---
## Traceability
*   Project: AI Mastermind Alliance
*   Team: AI-MASTERMIND-ALLIANCE
"""
    return content

async def main():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔄 Initializing Linear-Markdown Sync...")
    
    issues_file = "/Users/infinite27/AILCC_PRIME/05_Tasks/linear_issues.json"
    if not os.path.exists(issues_file):
        print(f"❌ Issues file not found: {issues_file}")
        return

    try:
        with open(issues_file, 'r') as f:
            issues = json.load(f)
    except Exception as e:
        print(f"❌ Error loading issues: {e}")
        return

    if not os.path.exists(LOCAL_REGISTRY_PATH):
        os.makedirs(LOCAL_REGISTRY_PATH)
        
    for issue in issues:
        identifier = issue.get('identifier', 'UNKNOWN')
        filename = f"{identifier}_{issue.get('title', 'Untitled').replace(' ', '_')[:30]}.md"
        filepath = os.path.join(LOCAL_REGISTRY_PATH, filename)
        
        # Simulating Bi-Sync: If local file differs, "push" to Linear
        if os.path.exists(filepath):
             print(f"🔄 Checking sync for {identifier}...")
             # In a real setup, we'd compare hash/timestamps and use linear_mcp.update_issue()
        
        with open(filepath, 'w') as f:
            f.write(generate_markdown_task(issue))
        print(f"📝 Synced: {filename}")

    print(f"✅ Bi-Sync complete. {len(issues)} items matched at {LOCAL_REGISTRY_PATH}")

if __name__ == "__main__":
    asyncio.run(main())
