#!/usr/bin/env python3
"""
Hacker News Intel Poller
Fetches top HN stories and sends them to Cortex for processing
"""

import requests
import time
import json
import os
from datetime import datetime

# Configuration
CORTEX_API = "http://localhost:8000/inject/comet"
HN_API_BASE = "https://hacker-news.firebaseio.com/v0"
POLL_INTERVAL = 600  # 10 minutes
MAX_STORIES = 5
SEEN_STORIES_FILE = os.path.join(os.path.dirname(__file__), '.hn_seen.json')

# Keywords to filter for AI/tech/startup content
KEYWORDS = [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'llm',
    'startup', 'founder', 'tech', 'api', 'openai', 'anthropic', 
    'google', 'deepmind', 'gpt', 'claude', 'gemini', 'automation',
    'saas', 'venture', 'funding', 'software', 'platform'
]

def load_seen_stories():
    """Load previously seen story IDs"""
    if os.path.exists(SEEN_STORIES_FILE):
        try:
            with open(SEEN_STORIES_FILE, 'r') as f:
                return set(json.load(f))
        except:
            return set()
    return set()

def save_seen_stories(seen):
    """Save seen story IDs to file"""
    try:
        with open(SEEN_STORIES_FILE, 'w') as f:
            json.dump(list(seen), f)
    except Exception as e:
        print(f"⚠️ Could not save seen stories: {e}")

def is_relevant_story(story):
    """Check if story matches our interest keywords"""
    title = story.get('title', '').lower()
    text = story.get('text', '').lower()
    combined = f"{title} {text}"
    
    return any(keyword in combined for keyword in KEYWORDS)

def fetch_top_stories():
    """Fetch top stories from HN"""
    try:
        # Get top story IDs
        resp = requests.get(f"{HN_API_BASE}/topstories.json", timeout=10)
        if resp.status_code != 200:
            print(f"❌ HN API error: {resp.status_code}")
            return []
        
        story_ids = resp.json()[:30]  # Check top 30
        stories = []
        
        for story_id in story_ids:
            try:
                story_resp = requests.get(f"{HN_API_BASE}/item/{story_id}.json", timeout=5)
                if story_resp.status_code == 200:
                    story = story_resp.json()
                    if story and story.get('type') == 'story':
                        stories.append(story)
                        if len(stories) >= MAX_STORIES * 2:  # Get extras for filtering
                            break
            except Exception as e:
                print(f"⚠️ Error fetching story {story_id}: {e}")
                continue
        
        return stories
    except Exception as e:
        print(f"❌ Failed to fetch HN stories: {e}")
        return []

def send_to_cortex(story):
    """Send story intel to Cortex"""
    url = story.get('url', f"https://news.ycombinator.com/item?id={story['id']}")
    title = story.get('title', 'Untitled')
    score = story.get('score', 0)
    
    intel = {
        "summary": f"{title} (Score: {score}) - {url}",
        "source": "Hacker News"
    }
    
    try:
        resp = requests.post(CORTEX_API, json=intel, timeout=10)
        if resp.status_code == 200:
            print(f"✅ Sent to Cortex: {title[:50]}...")
            return True
        else:
            print(f"❌ Cortex API error: {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to send to Cortex: {e}")
        return False

def main():
    print("🔍 HACKER NEWS INTEL POLLER")
    print(f"📊 Polling every {POLL_INTERVAL}s")
    print(f"🎯 Looking for: {', '.join(KEYWORDS[:5])}...\n")
    
    seen = load_seen_stories()
    
    while True:
        try:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Fetching HN top stories...")
            stories = fetch_top_stories()
            
            if not stories:
                print("⚠️ No stories fetched, retrying next cycle")
                time.sleep(POLL_INTERVAL)
                continue
            
            # Filter for relevant and unseen stories
            new_relevant = []
            for story in stories:
                story_id = story.get('id')
                if story_id and story_id not in seen and is_relevant_story(story):
                    new_relevant.append(story)
            
            if new_relevant:
                print(f"📰 Found {len(new_relevant)} new relevant stories")
                
                # Send up to MAX_STORIES to Cortex
                sent_count = 0
                for story in new_relevant[:MAX_STORIES]:
                    if send_to_cortex(story):
                        seen.add(story['id'])
                        sent_count += 1
                        time.sleep(2)  # Rate limiting
                
                print(f"✅ Sent {sent_count}/{len(new_relevant)} stories to Cortex")
                save_seen_stories(seen)
            else:
                print("📭 No new relevant stories found")
            
            print(f"⏳ Waiting {POLL_INTERVAL}s until next poll...\n")
            time.sleep(POLL_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n🛑 Poller stopped by user")
            save_seen_stories(seen)
            break
        except Exception as e:
            print(f"❌ Error in main loop: {e}")
            time.sleep(60)  # Wait before retry

if __name__ == "__main__":
    main()
