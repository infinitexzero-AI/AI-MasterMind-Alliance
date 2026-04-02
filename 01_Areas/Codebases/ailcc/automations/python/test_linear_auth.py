#!/usr/bin/env python3
"""
Test Linear API Authentication
Run this to verify your Linear API key is working correctly
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_API_URL = "https://api.linear.app/graphql"

print("=" * 60)
print("LINEAR API AUTHENTICATION TEST")
print("=" * 60)

# Check if API key is set
if not LINEAR_API_KEY:
    print("❌ ERROR: LINEAR_API_KEY environment variable is not set")
    print("\n📝 To fix this:")
    print("1. Get your Linear API key from: https://linear.app/settings/api")
    print("2. Add it to your .env file as: LINEAR_API_KEY=lin_api_YOUR_ACTUAL_KEY")
    exit(1)

# Check if it looks valid (Linear keys start with 'lin_api_')
if not LINEAR_API_KEY.startswith('lin_api_'):
    print(f"⚠️  WARNING: Your API key doesn't look like a valid Linear API key")
    print(f"   Current value: {LINEAR_API_KEY[:20]}...")
    print(f"   Linear API keys should start with 'lin_api_'")

print(f"✅ API Key found: {LINEAR_API_KEY[:15]}...")

# Test the API with a simple query
print("\n🔍 Testing API connection...")

query = """
{
    viewer {
        id
        name
        email
    }
}
"""

headers = {
    "Content-Type": "application/json",
    "Authorization": LINEAR_API_KEY
}

try:
    response = requests.post(LINEAR_API_URL, json={"query": query}, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if 'errors' in data:
            print("\n❌ GraphQL Errors:")
            for error in data['errors']:
                print(f"   - {error.get('message', 'Unknown error')}")
        elif 'data' in data and data['data'].get('viewer'):
            viewer = data['data']['viewer']
            print("\n✅ SUCCESS! Connected to Linear API")
            print(f"   Name: {viewer.get('name', 'N/A')}")
            print(f"   Email: {viewer.get('email', 'N/A')}")
            print(f"   ID: {viewer.get('id', 'N/A')}")
        else:
            print("\n⚠️  Unexpected response format:")
            print(data)
    else:
        print(f"\n❌ HTTP Error: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("\n🔧 AUTHENTICATION FAILED - Your API key is invalid")
            print("Please check:")
            print("1. Get a NEW API key from: https://linear.app/settings/api")
            print("2. Update your .env file with: LINEAR_API_KEY=lin_api_YOUR_NEW_KEY")
            print("3. The key should start with 'lin_api_' and be about 40 characters")
            
except Exception as e:
    print(f"\n❌ Exception: {e}")

print("\n" + "=" * 60)
