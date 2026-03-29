# AILCC BLACKBOARD CONSENSUS — Multi-Agent Agreement Protocol
# Phase 16 Step 3 | Epoch 90+ | infinitexzero-AI/ailcc-framework
#
# Implements a Redis-backed consensus mechanism for high-risk operations.
# Agents propose, vote, and resolve decisions through a shared blackboard.

import os
import sys
import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unified_event_bus import UnifiedEventBus

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# ─── Configuration ────────────────────────────────────────────────────────────

BASE_PATH = "/Users/infinite27/AILCC_PRIME"
LOG_PATH = os.path.join(BASE_PATH, "06_System/Logs/consensus.log")
FALLBACK_STORE = os.path.join(BASE_PATH, "06_System/State/consensus_store.json")

# Consensus thresholds
QUORUM_RATIO = 0.67        # 2/3 of registered agents must vote
APPROVAL_RATIO = 0.67      # 2/3 of votes must be FOR
PROPOSAL_TTL = 3600        # Proposals expire after 1 hour

# Registered agents for the Blackboard
REGISTERED_AGENTS = [
    "ANTIGRAVITY",
    "COMET",
    "GROK",
    "CLAUDE",
    "VALENTINE",
]

# Risk levels
RISK_LEVELS = {
    "LOW": {"quorum": 0.5, "approval": 0.5, "auto_resolve": True},
    "MEDIUM": {"quorum": 0.67, "approval": 0.67, "auto_resolve": True},
    "HIGH": {"quorum": 0.75, "approval": 0.75, "auto_resolve": False},
    "CRITICAL": {"quorum": 1.0, "approval": 1.0, "auto_resolve": False},
}

# ─── Logger ───────────────────────────────────────────────────────────────────

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
os.makedirs(os.path.dirname(FALLBACK_STORE), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [BLACKBOARD] - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("BlackboardConsensus")


class BlackboardConsensus:
    """
    Multi-agent consensus protocol using a shared Blackboard pattern.
    
    Flow:
    1. Agent calls propose() with an action description and risk level
    2. Other agents call vote() to approve or reject
    3. resolve() checks if quorum/approval thresholds are met
    4. Results are emitted to the UnifiedEventBus
    """

    def __init__(self):
        self.bus = UnifiedEventBus()
        self.redis_client = None
        
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True)
                self.redis_client.ping()
                logger.info("🔗 Connected to Redis for consensus store.")
            except redis.ConnectionError:
                logger.warning("⚠️  Redis unavailable. Falling back to file-based store.")
                self.redis_client = None
        
        if not self.redis_client:
            self.file_store = self._load_file_store()
        
        logger.info("🏛️  Blackboard Consensus initialized. Agents: %s", REGISTERED_AGENTS)

    # ─── File-based fallback store ────────────────────────────────────────────

    def _load_file_store(self):
        if os.path.exists(FALLBACK_STORE):
            with open(FALLBACK_STORE, "r") as f:
                return json.load(f)
        return {"proposals": {}}

    def _save_file_store(self):
        if not self.redis_client:
            with open(FALLBACK_STORE, "w") as f:
                json.dump(self.file_store, f, indent=2)

    # ─── Core Operations ─────────────────────────────────────────────────────

    def propose(self, agent: str, action: str, risk_level: str = "MEDIUM",
                description: str = "", affected_files: List[str] = None) -> str:
        """
        Submit a new proposal to the Blackboard.
        
        Returns the proposal_id for tracking.
        """
        if agent not in REGISTERED_AGENTS:
            raise ValueError(f"Agent '{agent}' is not registered for consensus.")
        
        if risk_level not in RISK_LEVELS:
            risk_level = "MEDIUM"

        proposal_id = f"BCP-{uuid.uuid4().hex[:8].upper()}"
        
        proposal = {
            "id": proposal_id,
            "proposer": agent,
            "action": action,
            "description": description,
            "risk_level": risk_level,
            "affected_files": affected_files or [],
            "votes": {},
            "status": "OPEN",
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(seconds=PROPOSAL_TTL)).isoformat(),
            "resolved_at": None,
            "result": None,
        }

        # Store the proposal
        key = f"ailcc:blackboard:{proposal_id}"
        if self.redis_client:
            self.redis_client.setex(key, PROPOSAL_TTL, json.dumps(proposal))
        else:
            self.file_store["proposals"][proposal_id] = proposal
            self._save_file_store()

        logger.info("📋 Proposal %s created by %s: '%s' [Risk: %s]", 
                     proposal_id, agent, action, risk_level)

        self.bus.emit(
            event_type="CONSENSUS_PROPOSED",
            source=agent,
            message=f"New proposal: {action}",
            payload={"proposal_id": proposal_id, "risk": risk_level, "action": action},
            priority=2 if risk_level in ("HIGH", "CRITICAL") else 3
        )

        return proposal_id

    def vote(self, proposal_id: str, agent: str, approve: bool, reason: str = "") -> Dict[str, Any]:
        """
        Cast a vote on an open proposal.
        """
        if agent not in REGISTERED_AGENTS:
            raise ValueError(f"Agent '{agent}' is not registered for consensus.")

        proposal = self._get_proposal(proposal_id)
        if not proposal:
            return {"error": f"Proposal {proposal_id} not found or expired."}
        
        if proposal["status"] != "OPEN":
            return {"error": f"Proposal {proposal_id} is already {proposal['status']}."}
        
        if agent == proposal["proposer"]:
            # Proposer's implicit FOR vote
            pass

        proposal["votes"][agent] = {
            "approve": approve,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }

        # Save updated proposal
        self._save_proposal(proposal_id, proposal)

        vote_str = "FOR" if approve else "AGAINST"
        logger.info("🗳️  %s voted %s on %s%s", agent, vote_str, proposal_id,
                     f" — {reason}" if reason else "")

        self.bus.emit(
            event_type="CONSENSUS_VOTE",
            source=agent,
            message=f"{agent} voted {vote_str} on {proposal_id}",
            payload={"proposal_id": proposal_id, "agent": agent, "approve": approve},
            priority=4
        )

        # Check if we should auto-resolve
        risk_config = RISK_LEVELS[proposal["risk_level"]]
        if risk_config["auto_resolve"]:
            return self.resolve(proposal_id)

        return {"status": "VOTED", "proposal_id": proposal_id, "total_votes": len(proposal["votes"])}

    def resolve(self, proposal_id: str) -> Dict[str, Any]:
        """
        Attempt to resolve a proposal based on quorum and approval thresholds.
        """
        proposal = self._get_proposal(proposal_id)
        if not proposal:
            return {"error": f"Proposal {proposal_id} not found."}

        if proposal["status"] != "OPEN":
            return {"status": proposal["status"], "result": proposal["result"]}

        risk_config = RISK_LEVELS[proposal["risk_level"]]
        total_agents = len(REGISTERED_AGENTS)
        total_votes = len(proposal["votes"])
        quorum_needed = int(total_agents * risk_config["quorum"])
        
        # Check quorum
        if total_votes < quorum_needed:
            return {
                "status": "PENDING_QUORUM",
                "votes": total_votes,
                "quorum_needed": quorum_needed,
                "proposal_id": proposal_id
            }

        # Count approval
        approvals = sum(1 for v in proposal["votes"].values() if v["approve"])
        approval_pct = approvals / total_votes if total_votes > 0 else 0
        approved = approval_pct >= risk_config["approval"]

        proposal["status"] = "APPROVED" if approved else "REJECTED"
        proposal["result"] = {
            "approved": approved,
            "votes_for": approvals,
            "votes_against": total_votes - approvals,
            "approval_pct": round(approval_pct * 100, 1),
            "quorum_met": True
        }
        proposal["resolved_at"] = datetime.now().isoformat()

        self._save_proposal(proposal_id, proposal)

        result_str = "APPROVED ✅" if approved else "REJECTED ❌"
        logger.info("⚖️  Proposal %s %s (%d/%d, %.0f%%)", 
                     proposal_id, result_str, approvals, total_votes, approval_pct * 100)

        self.bus.emit(
            event_type="CONSENSUS_RESOLVED",
            source="Blackboard",
            message=f"Proposal {proposal_id}: {result_str}",
            payload={
                "proposal_id": proposal_id,
                "result": proposal["result"],
                "action": proposal["action"]
            },
            priority=2
        )

        return {"status": proposal["status"], "result": proposal["result"], "proposal_id": proposal_id}

    def list_open(self) -> List[Dict[str, Any]]:
        """List all open proposals."""
        if self.redis_client:
            keys = self.redis_client.keys("ailcc:blackboard:BCP-*")
            proposals = []
            for key in keys:
                data = self.redis_client.get(key)
                if data:
                    p = json.loads(data)
                    if p["status"] == "OPEN":
                        proposals.append(p)
            return proposals
        else:
            return [p for p in self.file_store["proposals"].values() if p["status"] == "OPEN"]

    # ─── Internal Helpers ─────────────────────────────────────────────────────

    def _get_proposal(self, proposal_id: str) -> Optional[Dict]:
        key = f"ailcc:blackboard:{proposal_id}"
        if self.redis_client:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        else:
            return self.file_store["proposals"].get(proposal_id)

    def _save_proposal(self, proposal_id: str, proposal: Dict):
        key = f"ailcc:blackboard:{proposal_id}"
        if self.redis_client:
            self.redis_client.setex(key, PROPOSAL_TTL, json.dumps(proposal))
        else:
            self.file_store["proposals"][proposal_id] = proposal
            self._save_file_store()


# ─── Standalone Test ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    bb = BlackboardConsensus()

    # Simulate a consensus flow
    pid = bb.propose(
        agent="ANTIGRAVITY",
        action="Migrate Hippocampus to Qdrant",
        risk_level="HIGH",
        description="Replace ChromaDB with Qdrant for multi-tenant vector storage.",
        affected_files=["06_System/Hippocampus/", "06_System/Execution/vault_rag.py"]
    )

    # Simulate votes
    bb.vote(pid, "COMET", approve=True, reason="Qdrant supports multi-tenancy natively.")
    bb.vote(pid, "GROK", approve=True, reason="Agreed. ChromaDB scaling limits observed.")
    bb.vote(pid, "CLAUDE", approve=True, reason="Architecture review confirms benefits.")

    # Resolve
    result = bb.resolve(pid)
    print(f"\n🏛️  Final Result: {json.dumps(result, indent=2)}")
