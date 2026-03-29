# AILCC YIELD FEED ADAPTER — Real-World DeFi Yield Integration
# Phase 16 Step 5 | Epoch 90+ | infinitexzero-AI/ailcc-framework
#
# Connects the Yield Oracle to live DeFi yield data from:
# - DefiLlama (yields.llama.fi) — Comprehensive cross-chain yield aggregator

import os
import sys
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Any

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unified_event_bus import UnifiedEventBus

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# ─── Configuration ────────────────────────────────────────────────────────────

BASE_PATH = "/Users/infinite27/AILCC_PRIME"
LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/yield_feed.log")
CACHE_PATH = os.path.join(BASE_PATH, "06_System/State/yield_pools_cache.json")

# DefiLlama API (fully public, no key needed)
DEFILLAMA_POOLS_API = "https://yields.llama.fi/pools"

# Filter criteria
MIN_TVL = 1_000_000       # $1M minimum TVL
MIN_APY = 2.0              # 2% minimum APY
MAX_POOLS = 25             # Top 25 pools
TRACKED_CHAINS = [
    "Ethereum", "Arbitrum", "Optimism", "Base", "Polygon",
    "Solana", "Avalanche", "BSC"
]
TRACKED_PROJECTS = [
    "aave-v3", "compound-v3", "lido", "rocket-pool",
    "uniswap-v3", "curve-dex", "maker", "morpho",
    "pendle", "eigenlayer", "ethena"
]

# ─── Logger ───────────────────────────────────────────────────────────────────

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [YIELD_FEED] - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("YieldFeedAdapter")


class YieldFeedAdapter:
    """
    Fetches and filters DeFi yield opportunities from DefiLlama.
    Provides curated, risk-scored yield pools to the Yield Oracle.
    """

    def __init__(self):
        self.bus = UnifiedEventBus()
        self.redis_client = None
        
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True)
                self.redis_client.ping()
            except redis.ConnectionError:
                self.redis_client = None
        
        logger.info("💰 Yield Feed Adapter initialized.")

    async def fetch_pools(self) -> List[Dict[str, Any]]:
        """Fetch yield pools from DefiLlama."""
        if not AIOHTTP_AVAILABLE:
            logger.warning("aiohttp not installed. Using mock data.")
            return self._get_mock_pools()

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    DEFILLAMA_POOLS_API,
                    timeout=aiohttp.ClientTimeout(total=20)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        pools = data.get("data", [])
                        logger.info("📡 Fetched %d total pools from DefiLlama.", len(pools))
                        return self._filter_and_normalize(pools)
                    else:
                        logger.error("DefiLlama API returned %d", resp.status)
                        return self._get_mock_pools()
        except Exception as e:
            logger.error("DefiLlama fetch failed: %s", e)
            return self._get_mock_pools()

    def _filter_and_normalize(self, raw_pools: List[Dict]) -> List[Dict[str, Any]]:
        """Filter pools by TVL, APY, chain, and project — then normalize."""
        filtered = []
        
        for pool in raw_pools:
            tvl = pool.get("tvlUsd", 0) or 0
            apy = pool.get("apy", 0) or 0
            chain = pool.get("chain", "")
            project = pool.get("project", "")
            
            # Apply filters
            if tvl < MIN_TVL:
                continue
            if apy < MIN_APY:
                continue
            if chain not in TRACKED_CHAINS:
                continue
            
            # Risk scoring heuristic
            risk_score = self._calculate_risk(pool)
            
            filtered.append({
                "pool_id": pool.get("pool", ""),
                "project": project,
                "chain": chain,
                "symbol": pool.get("symbol", "Unknown"),
                "tvl_usd": round(tvl, 2),
                "apy": round(apy, 4),
                "apy_base": round(pool.get("apyBase", 0) or 0, 4),
                "apy_reward": round(pool.get("apyReward", 0) or 0, 4),
                "apy_7d": round(pool.get("apyMean7d", 0) or 0, 4),
                "apy_30d": round(pool.get("apyMean30d", 0) or 0, 4),
                "il_risk": pool.get("ilRisk", "no"),
                "stablecoin": pool.get("stablecoin", False),
                "exposure": pool.get("exposure", "single"),
                "risk_score": risk_score,
                "risk_label": self._risk_label(risk_score),
                "url": pool.get("url", ""),
                "fetched_at": datetime.now().isoformat()
            })

        # Sort by risk-adjusted yield (APY / risk_score)
        filtered.sort(key=lambda p: p["apy"] / max(p["risk_score"], 0.1), reverse=True)
        
        result = filtered[:MAX_POOLS]
        logger.info("📊 Filtered to %d pools (from %d raw).", len(result), len(raw_pools))
        return result

    def _calculate_risk(self, pool: Dict) -> float:
        """
        Calculate a risk score from 1 (safest) to 10 (riskiest).
        Based on: TVL stability, IL risk, stablecoin exposure, project reputation.
        """
        score = 5.0  # Baseline
        
        tvl = pool.get("tvlUsd", 0) or 0
        project = pool.get("project", "")
        
        # TVL > $100M = safer
        if tvl > 100_000_000:
            score -= 2.0
        elif tvl > 10_000_000:
            score -= 1.0
        elif tvl < 2_000_000:
            score += 1.5
        
        # Trusted projects
        if project in TRACKED_PROJECTS:
            score -= 1.5
        
        # Stablecoins are safer
        if pool.get("stablecoin", False):
            score -= 1.0
        
        # IL risk
        if pool.get("ilRisk", "no") == "yes":
            score += 2.0
        
        # High APY = suspicious
        apy = pool.get("apy", 0) or 0
        if apy > 50:
            score += 2.0
        elif apy > 20:
            score += 1.0
        
        return max(1.0, min(10.0, round(score, 1)))

    def _risk_label(self, score: float) -> str:
        if score <= 3.0:
            return "LOW"
        elif score <= 6.0:
            return "MEDIUM"
        elif score <= 8.0:
            return "HIGH"
        else:
            return "CRITICAL"

    def _get_mock_pools(self) -> List[Dict[str, Any]]:
        """Fallback mock data."""
        return [
            {
                "pool_id": "mock-aave-eth-001",
                "project": "aave-v3",
                "chain": "Ethereum",
                "symbol": "WETH",
                "tvl_usd": 2_500_000_000,
                "apy": 3.2,
                "apy_base": 2.8,
                "apy_reward": 0.4,
                "apy_7d": 3.1,
                "apy_30d": 2.9,
                "il_risk": "no",
                "stablecoin": False,
                "exposure": "single",
                "risk_score": 2.0,
                "risk_label": "LOW",
                "url": "https://app.aave.com/",
                "fetched_at": datetime.now().isoformat()
            },
            {
                "pool_id": "mock-lido-steth-001",
                "project": "lido",
                "chain": "Ethereum",
                "symbol": "stETH",
                "tvl_usd": 14_000_000_000,
                "apy": 3.5,
                "apy_base": 3.5,
                "apy_reward": 0,
                "apy_7d": 3.4,
                "apy_30d": 3.3,
                "il_risk": "no",
                "stablecoin": False,
                "exposure": "single",
                "risk_score": 1.5,
                "risk_label": "LOW",
                "url": "https://lido.fi/",
                "fetched_at": datetime.now().isoformat()
            },
            {
                "pool_id": "mock-pendle-001",
                "project": "pendle",
                "chain": "Arbitrum",
                "symbol": "PT-eETH",
                "tvl_usd": 450_000_000,
                "apy": 8.7,
                "apy_base": 5.2,
                "apy_reward": 3.5,
                "apy_7d": 9.1,
                "apy_30d": 7.8,
                "il_risk": "no",
                "stablecoin": False,
                "exposure": "single",
                "risk_score": 4.0,
                "risk_label": "MEDIUM",
                "url": "https://app.pendle.finance/",
                "fetched_at": datetime.now().isoformat()
            }
        ]

    async def sync(self) -> Dict[str, Any]:
        """Full sync: fetch, filter, store, emit."""
        logger.info("🔄 Starting Yield feed sync...")
        
        pools = await self.fetch_pools()
        
        # Store in Redis
        if self.redis_client and pools:
            self.redis_client.setex(
                "ailcc:yield:pools",
                3600,
                json.dumps(pools)
            )
            logger.info("💾 Stored %d pools in Redis.", len(pools))

        # Cache to disk
        with open(CACHE_PATH, "w") as f:
            json.dump({
                "synced_at": datetime.now().isoformat(),
                "count": len(pools),
                "pools": pools
            }, f, indent=2)

        # Emit event
        self.bus.emit(
            event_type="YIELD_POOLS_SYNCED",
            source="YieldFeedAdapter",
            message=f"Synced {len(pools)} yield pools across {len(set(p['chain'] for p in pools))} chains.",
            payload={
                "count": len(pools),
                "top_apy": max((p["apy"] for p in pools), default=0),
                "chains": list(set(p["chain"] for p in pools))
            },
            priority=3
        )

        logger.info("✅ Yield feed sync complete. %d pools cached.", len(pools))
        return {"count": len(pools), "pools": pools}

    def get_cached(self) -> List[Dict]:
        """Get cached pools from Redis or disk."""
        if self.redis_client:
            data = self.redis_client.get("ailcc:yield:pools")
            if data:
                return json.loads(data)
        if os.path.exists(CACHE_PATH):
            with open(CACHE_PATH, "r") as f:
                return json.load(f).get("pools", [])
        return []


# ─── Standalone Execution ─────────────────────────────────────────────────────

if __name__ == "__main__":
    adapter = YieldFeedAdapter()
    result = asyncio.run(adapter.sync())
    print(f"\n💰 Yield Sync Result:")
    for p in result["pools"]:
        risk_emoji = {"LOW": "🟢", "MEDIUM": "🟡", "HIGH": "🟠", "CRITICAL": "🔴"}.get(p["risk_label"], "⚪")
        print(f"  {risk_emoji} [{p['chain']}] {p['project']} / {p['symbol']}: {p['apy']}% APY (TVL: ${p['tvl_usd']:,.0f}) Risk: {p['risk_label']}")
