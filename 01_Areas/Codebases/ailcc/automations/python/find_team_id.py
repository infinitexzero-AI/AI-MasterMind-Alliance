#!/usr/bin/env python3
"""
Find Linear Team ID
Queries Linear API to list all teams you have access to
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_API_URL = "https://api.linear.app/graphql"

print("🔍 Fetching your Linear teams...\n")

query = """
{
    viewer {
        name
        teams {
            nodes {
                id
                name
                key
                description
            }
        }
    }
}
"""

headers = {
    "Content-Type": "application/json",
    "Authorization": LINEAR_API_KEY
}

response = requests.post(LINEAR_API_URL, json={"query": query}, headers=headers)

if response.status_code == 200:
    data = response.json()
    
    if 'errors' in data:
        print("❌ Error:", data['errors'])
    else:
        viewer = data['data']['viewer']
        teams = viewer['teams']['nodes']
        
        print(f"User: {viewer['name']}")
        print(f"\nYour Teams ({len(teams)} found):\n")
        print("-" * 80)
        
        for team in teams:
            print(f"Team Name: {team['name']}")
            print(f"Team Key:  {team['key']}")
            print(f"Team ID:   {team['id']}")
            if team.get('description'):
                print(f"Description: {team['description']}")
            print("-" * 80)
        
        if teams:
            print(f"\n✅ Copy the Team ID above and update your .env file:")
            print(f"   LINEAR_TEAM_ID={teams[0]['id']}")
else:
    print(f"❌ HTTP Error: {response.status_code}")
    print(response.text)
