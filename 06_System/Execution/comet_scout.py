import requests
import json
import time
import sys

RELAY_URL = "http://localhost:3001/api/comet/ingest"

def simulate_research(topic="quantum_computing"):
    print(f"🌠 COMET: Scouting research for topic: {topic}...")
    time.sleep(2)
    
    # Mock research data
    research_results = [
        {"title": "Latest news in " + topic, "url": "https://example.com/1", "snippet": "A breakthrough was made today..."},
        {"title": "Deep dive into " + topic, "url": "https://example.com/2", "snippet": "Analysis of current trends..."}
    ]
    
    payload = {
        "source": "perplexity_scout",
        "topic": topic,
        "data": research_results
    }
    
    try:
        response = requests.post(RELAY_URL, json=payload)
        if response.status_code == 201:
            print(f"✅ COMET: Research successfully handed off to Vault.")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ COMET: Failed to ingest research. Status: {response.status_code}")
    except Exception as e:
        print(f"❌ COMET: Connection to Relay failed. {e}")

if __name__ == "__main__":
    topic_input = sys.argv[1] if len(sys.argv) > 1 else "general_mission"
    simulate_research(topic_input)
