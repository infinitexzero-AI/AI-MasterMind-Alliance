"""
Linear API Integration
Extracts project data, issues, milestones from Linear AI Mastermind Alliance
"""

import os
import requests
import json
from dotenv import load_dotenv


from pathlib import Path
# Load from central credentials
cred_path = Path.home() / "ailcc-framework" / "ailcc-framework" / "config" / "credentials" / ".env"
load_dotenv(cred_path)


LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_TEAM_ID = os.getenv("LINEAR_TEAM_ID", "afce2df5-59c5-4889-a084-3497bba44518")
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
                    labels {
                        nodes {
                            name
                        }
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

def create_linear_issue(title: str, description: str, team_id: str = None, priority: int = 2, 
                       project_id: str = None, assignee_id: str = None, label_ids: list = None):
    """
    Create a new Linear issue
    
    Args:
        title: Issue title
        description: Issue description (markdown supported)
        team_id: Team ID (defaults to LINEAR_TEAM_ID)
        priority: Priority level 0-4 (0=None, 1=Low, 2=Medium, 3=High, 4=Urgent)
        project_id: Optional project to assign to
        assignee_id: Optional user to assign to
        label_ids: Optional list of label IDs
    """
    query = """
    mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
            success
            issue {
                id
                identifier
                title
                url
                state {
                    name
                }
            }
        }
    }
    """
    
    # Build input object
    issue_input = {
        "title": title,
        "description": description,
        "teamId": team_id or LINEAR_TEAM_ID,
        "priority": priority
    }
    
    if project_id:
        issue_input["projectId"] = project_id
    if assignee_id:
        issue_input["assigneeId"] = assignee_id
    if label_ids:
        issue_input["labelIds"] = label_ids
    
    variables = {"input": issue_input}
    return query_linear(query, variables)

def get_all_teams():
    """Get all teams the user has access to"""
    query = """
    query Teams {
        teams {
            nodes {
                id
                name
                key
                description
            }
        }
    }
    """
    return query_linear(query)

def get_team_labels(team_id: str = None):
    """Get all labels for a team"""
    query = """
    query TeamLabels($teamId: String!) {
        team(id: $teamId) {
            id
            labels {
                nodes {
                    id
                    name
                    color
                }
            }
        }
    }
    """
    variables = {"teamId": team_id or LINEAR_TEAM_ID}
    return query_linear(query, variables)

def get_team_members(team_id: str = None):
    """Get all members of a team"""
    query = """
    query TeamMembers($teamId: String!) {
        team(id: $teamId) {
            id
            members {
                nodes {
                    id
                    name
                    email
                    active
                }
            }
        }
    }
    """
    variables = {"teamId": team_id or LINEAR_TEAM_ID}
    return query_linear(query, variables)

def get_team_projects_list(team_id: str = None):
    """Get simplified list of projects for dropdown"""
    query = """
    query TeamProjects($teamId: String!) {
        team(id: $teamId) {
            id
            projects {
                nodes {
                    id
                    name
                    state
                }
            }
        }
    }
    """
    variables = {"teamId": team_id or LINEAR_TEAM_ID}
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


def update_issue(issue_id: str, title: str = None, description: str = None, 
                 state_id: str = None, assignee_id: str = None, label_ids: list = None):
    """
    Update an existing Linear issue
    """
    query = """
    mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
            success
            issue {
                id
                identifier
                title
                url
                state {
                    name
                }
                labels {
                    nodes {
                        name
                    }
                }
            }
        }
    }
    """
    
    input_data = {}
    if title: input_data["title"] = title
    if description: input_data["description"] = description
    if state_id: input_data["stateId"] = state_id
    if assignee_id: input_data["assigneeId"] = assignee_id
    if label_ids: input_data["labelIds"] = label_ids
    
    variables = {
        "id": issue_id,
        "input": input_data
    }
    return query_linear(query, variables)

def create_label(name: str, color: str, team_id: str = None, description: str = None):
    """
    Create a new label
    """
    query = """
    mutation IssueLabelCreate($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
            success
            issueLabel {
                id
                name
            }
        }
    }
    """
    
    input_data = {
        "name": name,
        "color": color,
        "teamId": team_id or LINEAR_TEAM_ID
    }
    if description:
        input_data["description"] = description
        
    variables = {"input": input_data}
    return query_linear(query, variables)

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

