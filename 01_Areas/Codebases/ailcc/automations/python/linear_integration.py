"""
Linear API Integration
Extracts project data, issues, milestones from Linear AI Mastermind Alliance
"""

import os
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the script's directory, not the current working directory
script_dir = Path(__file__).parent
env_path = script_dir / '.env'
load_dotenv(dotenv_path=env_path)

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_TEAM_ID = os.getenv("LINEAR_TEAM_ID")
LINEAR_API_URL = "https://api.linear.app/graphql"

def query_linear(query: str, variables: dict = None):
    """Execute GraphQL query against Linear API"""
    if not LINEAR_API_KEY:
        print("❌ LINEAR_API_KEY not set in .env file")
        return None
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"{LINEAR_API_KEY}"  # Linear expects just the API key
    }
    
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    try:
        response = requests.post(LINEAR_API_URL, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            if 'errors' in result:
                print(f"❌ Linear GraphQL errors: {json.dumps(result['errors'], indent=2)}")
                return None
            return result
        else:
            print(f"❌ Linear API error: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Linear API exception: {e}")
        return None

def get_team_projects():
    """Get all projects for the team"""
    query = """
    query TeamProjects($teamId: String!) {
        team(id: $teamId) {
            id
            name
            projects {
                nodes {
                    id
                    name
                    description
                    state
                    progress
                    startDate
                    targetDate
                    url
                    createdAt
                    updatedAt
                }
            }
        }
    }
    """
    
    variables = {"teamId": LINEAR_TEAM_ID}
    return query_linear(query, variables)

def get_project_issues(project_id: str):
    """Get all issues for a specific project"""
    query = """
    query ProjectIssues($projectId: String!) {
        project(id: $projectId) {
            id
            name
            issues {
                nodes {
                    id
                    identifier
                    title
                    description
                    state {
                        name
                    }
                    priority
                    assignee {
                        name
                    }
                    labels {
                        nodes {
                            name
                        }
                    }
                    url
                    createdAt
                    updatedAt
                }
            }
        }
    }
    """
    
    variables = {"projectId": project_id}
    return query_linear(query, variables)

def get_team_issues():
    """Get all issues for the team"""
    query = """
    query TeamIssues($teamId: String!) {
        team(id: $teamId) {
            id
            name
            issues(first: 50) {
                nodes {
                    id
                    identifier
                    title
                    description
                    state {
                        name
                    }
                    priority
                    assignee {
                        name
                    }
                    project {
                        name
                    }
                    url
                    createdAt
                    updatedAt
                }
            }
        }
    }
    """
    
    variables = {"teamId": LINEAR_TEAM_ID}
    return query_linear(query, variables)

def get_recent_activity():
    """Get recent activity/updates"""
    query = """
    query TeamActivity($teamId: String!) {
        team(id: $teamId) {
            id
            name
            issues(first: 10, orderBy: updatedAt) {
                nodes {
                    identifier
                    title
                    state {
                        name
                    }
                    updatedAt
                    url
                }
            }
        }
    }
    """
    
    variables = {"teamId": LINEAR_TEAM_ID}
    return query_linear(query, variables)

def extract_linear_artifacts():
    """
    Extract all Linear data and format as artifacts for Antigravity
    Returns structured data for agent registry integration
    """
    artifacts = {
        "source": "Linear AI Mastermind Alliance",
        "extracted_at": "",
        "projects": [],
        "issues": [],
        "recent_activity": []
    }
    
    # Get projects
    projects_data = get_team_projects()
    if projects_data and 'data' in projects_data:
        team = projects_data['data'].get('team', {})
        projects = team.get('projects', {}).get('nodes', [])
        artifacts['projects'] = projects
        
        # Get issues for each project
        for project in projects:
            issues_data = get_project_issues(project['id'])
            if issues_data and 'data' in issues_data:
                project_issues = issues_data['data'].get('project', {}).get('issues', {}).get('nodes', [])
                artifacts['issues'].extend(project_issues)
    
    # Get recent activity
    activity_data = get_recent_activity()
    if activity_data and 'data' in activity_data:
        team = activity_data['data'].get('team', {})
        recent = team.get('issues', {}).get('nodes', [])
        artifacts['recent_activity'] = recent
    
    import datetime
    artifacts['extracted_at'] = datetime.datetime.now().isoformat()
    
    return artifacts

if __name__ == "__main__":
    print("🔍 Extracting Linear AI Mastermind Alliance data...")
    artifacts = extract_linear_artifacts()
    
    # Save to file
    output_file = os.path.join(os.path.dirname(__file__), 'linear_artifacts.json')
    with open(output_file, 'w') as f:
        json.dump(artifacts, f, indent=2)
    
    print(f"✅ Extracted {len(artifacts['projects'])} projects")
    print(f"✅ Extracted {len(artifacts['issues'])} issues")
    print(f"✅ Extracted {len(artifacts['recent_activity'])} recent activities")
    print(f"📁 Saved to: {output_file}")
