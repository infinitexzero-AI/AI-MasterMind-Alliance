import os
import time
import json
import logging
import asyncio
import redis.asyncio as redis
import urllib.request
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [HN-Poller] - %(levelname)s - %(message)s')
logger = logging.getLogger("HNPoller")

AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent.parent
HIPPOCAMPUS_INTELLIGENCE_DIR = AILCC_PRIME_PATH / "hippocampus_storage" / "intelligence"

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"

# Strict Mathematical Filtering Array
TARGET_KEYWORDS = [" ai", "ai ", " llm", "llm ", " gpt", "gpt ", "neuroscience", "machine learning", " ml ", "claude", "anthropic", "openai", "sam altman", "agi"]

class HackerNewsPoller:
    def __init__(self):
        self.redis = None
        self.seen_stories = set()
        os.makedirs(HIPPOCAMPUS_INTELLIGENCE_DIR, exist_ok=True)
        self.log_file = HIPPOCAMPUS_INTELLIGENCE_DIR / f"hn_intelligence_{datetime.now().strftime('%Y%m%d')}.jsonl"

    async def connect(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        await self.redis.ping()
        logger.info("⚡ Connected to AILCC Redis Pub/Sub.")
        
        # Load persistent state if previously stored in Redis
        stored_seen = await self.redis.smembers('ailcc:vanguard:hn_seen_stories')
        if stored_seen:
            self.seen_stories.update(int(id) for id in stored_seen)
            logger.info(f"Loaded {len(self.seen_stories)} previously seen HN IDs.")

    def fetch_json(self, url: str) -> dict:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AILCC_Mastermind_Poller/1.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            logger.error(f"HTTP fetch failed for {url}: {e}")
            return None

    def matches_target_criteria(self, title: str) -> bool:
        lower_title = f" {title.lower()} " # Pad spaces for strict word boundaries
        return any(keyword.lower() in lower_title for keyword in TARGET_KEYWORDS)

    async def poll_cycle(self):
        logger.info("🔍 Initiating Firebase Hacker News extraction vector...")
        top_ids = self.fetch_json(HN_TOP_STORIES_URL)
        
        if not top_ids:
            return

        # Scan the absolute Top 50 algorithms to prevent noise
        scan_scope = top_ids[:50]
        new_discoveries = []

        for story_id in scan_scope:
            if story_id in self.seen_stories:
                continue
                
            story_data = self.fetch_json(HN_ITEM_URL.format(story_id))
            if not story_data or 'title' not in story_data:
                continue

            self.seen_stories.add(story_id)
            await self.redis.sadd('ailcc:vanguard:hn_seen_stories', story_id)

            if self.matches_target_criteria(story_data['title']):
                new_discoveries.append(story_data)

        if new_discoveries:
            logger.info(f"🚨 Extracted {len(new_discoveries)} high-signal strategic targets.")
            await self.broadcast_discoveries(new_discoveries)
        else:
            logger.info("📡 No new critical AI/Neuro targets in the Top 50.")

    async def broadcast_discoveries(self, items: list):
        with open(self.log_file, 'a') as f:
            for item in items:
                payload = {
                    "signal_id": f"hn-{item['id']}",
                    "source": "HACKER_NEWS",
                    "type": "GLOBAL_INTELLIGENCE",
                    "severity": "ROUTINE",
                    "classification": "LOCAL_ONLY", # Explicit constraint
                    "title": item['title'],
                    "url": item.get('url', f"https://news.ycombinator.com/item?id={item['id']}"),
                    "score": item.get('score', 0),
                    "timestamp": datetime.now().isoformat()
                }
                
                # 1. Fire into Redis Event Bus (Nexus Dashboard)
                await self.redis.publish("NEURAL_SYNAPSE", json.dumps(payload))
                
                # 2. Persist to Hippocampus (Cold Storage)
                f.write(json.dumps(payload) + "\\n")
                
                logger.info(f"Broadcasted: {payload['title']}")

    async def run(self):
        await self.connect()
        while True:
            await self.poll_cycle()
            # Enforce 30-minute interval to prevent rate limit blocks and throttle compute
            await asyncio.sleep(1800)

if __name__ == "__main__":
    load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
    daemon = HackerNewsPoller()
    try:
        asyncio.run(daemon.run())
    except KeyboardInterrupt:
        logger.info("Daemon gracefully terminated by Motor Cortex.")
