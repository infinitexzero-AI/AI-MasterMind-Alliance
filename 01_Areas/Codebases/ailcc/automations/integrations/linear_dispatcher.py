
import sys
import os
import json
import argparse
from typing import List, Dict
from automations.integrations.linear_integration import (
    get_team_issues, 
    update_issue, 
    create_label, 
    get_team_labels, 
    LINEAR_TEAM_ID
)

# Agent Definitions and Keywords
AGENTS = {
    "claude": {
        "name": "Claude Desktop",
        "label": "agent:claude",
        "color": "#D97757", # Orange-ish
        "keywords": ["code", "refactor", "implement", "debug", "test", "analyze", "python", "react", "js", "fix"]
    },
    "grok": {
        "name": "SuperGrok",
        "label": "agent:grok",
        "color": "#333333", # Black/Dark
        "keywords": ["plan", "strategy", "orchestrate", "manage", "review", "coordinate", "verify"]
    },
    "perplexity": {
        "name": "Comet (Perplexity)",
        "label": "agent:perplexity",
        "color": "#22B8CF", # Cyan
        "keywords": ["research", "find", "search", "investigate", "market", "trends", "info"]
    },
    "antigravity-exec": {
        "name": "AntiGravity",
        "label": "agent:antigravity",
        "color": "#82C91E", # Lime
        "keywords": ["file", "organize", "email", "calendar", "system", "cleanup", "sort"]
    }
}

def ensure_labels(existing_labels: List[Dict]):
    """Ensure agent labels exist in Linear"""
    existing_names = {l['name']: l for l in existing_labels}
    label_map = {}
    
    for agent_key, agent_data in AGENTS.items():
        label_name = agent_data['label']
        if label_name not in existing_names:
            print(f"Creating label: {label_name}")
            result = create_label(label_name, agent_data['color'], LINEAR_TEAM_ID)
            if result and result.get('data', {}).get('issueLabelCreate', {}).get('success'):
                label_id = result['data']['issueLabelCreate']['issueLabel']['id']
                label_map[label_name] = label_id
            else:
                print(f"Failed to create label {label_name}")
        else:
            label_map[label_name] = existing_names[label_name]['id']
            
    return label_map

def determine_agent(title: str, description: str) -> str:
    """Determine the best agent for the task based on keywords"""
    text = (title + " " + (description or "")).lower()
    
    scores = {k: 0 for k in AGENTS.keys()}
    
    for agent_key, data in AGENTS.items():
        for keyword in data['keywords']:
            if keyword in text:
                scores[agent_key] += 1
                
    # Get highest scorer
    best_agent = max(scores, key=scores.get)
    if scores[best_agent] > 0:
        return best_agent
    return None

def main():
    parser = argparse.ArgumentParser(description="Linear Task Dispatcher")
    parser.add_argument("--execute", action="store_true", help="Apply changes to Linear")
    args = parser.parse_args()

    print("--- Linear Task Dispatcher ---")
    
    # 1. Get Labels
    print("Fetching labels...")
    labels_resp = get_team_labels(LINEAR_TEAM_ID)
    if not labels_resp or 'data' not in labels_resp:
        print("Failed to fetch labels.")
        return

    existing_labels = labels_resp['data']['team']['labels']['nodes']
    label_id_map = ensure_labels(existing_labels)
    
    # 2. Get Issues
    print("Fetching issues...")
    issues_resp = get_team_issues()
    if not issues_resp or 'data' not in issues_resp:
        print("Failed to fetch issues.")
        return

    issues = issues_resp['data']['team']['issues']['nodes']
    pending_updates = []

    print(f"Found {len(issues)} issues.")
    
    for issue in issues:
        state = issue['state']['name']
        if state not in ["Todo", "Triage", "Backlog"]:
            continue
            
        # Check if already assigned to an agent
        current_labels = [l['name'] for l in issue['labels']['nodes']]
        already_assigned = any(l.startswith("agent:") for l in current_labels)
        
        if already_assigned:
            continue
            
        assignments = determine_agent(issue['title'], issue['description'])
        
        if assignments:
            print(f"[PROPOSED] {issue['title']} ({state}) -> {AGENTS[assignments]['name']}")
            pending_updates.append({
                "issue": issue,
                "agent": assignments,
                "label_id": label_id_map[AGENTS[assignments]['label']]
            })
        else:
            print(f"[SKIPPED] {issue['title']} - No clear agent match")

    if not pending_updates:
        print("No new assignments to make.")
        return

    if args.execute:
        print(f"\nApplying {len(pending_updates)} assignments...")
        for item in pending_updates:
            issue = item['issue']
            agent_key = item['agent']
            label_id = item['label_id']
            
            # Get existing label IDs to preserve them
            existing_ids = [l['id'] for l in get_team_labels(LINEAR_TEAM_ID)['data']['team']['labels']['nodes'] 
                           if l['name'] in [x['name'] for x in issue['labels']['nodes']]]
            
            new_label_ids = list(set(existing_ids + [label_id]))
            
            print(f"Updating {issue['identifier']}...")
            update_issue(issue['id'], label_ids=new_label_ids)
            # Potentially comment?
            # Creating a comment requires a different mutation not yet in linear_integration.py
            # But specific assignment is done via label.
            
        print("Done.")
    else:
        print(f"\n{len(pending_updates)} tax execution instructions found. Run with --execute to apply.")

if __name__ == "__main__":
    main()
