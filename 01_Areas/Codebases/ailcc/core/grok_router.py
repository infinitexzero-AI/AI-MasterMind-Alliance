"""
GrokRouter — Intelligent Auto-Switch for Grok 4.20 Experimental Beta
=======================================================================
Automatically selects the optimal Grok 4.20 model variant based on task
complexity, keyword analysis, and configured thresholds.

Model Variants:
  - grok-4.20-experimental-beta-0304-non-reasoning   → fast, direct answers
  - grok-4.20-experimental-beta-0304-reasoning        → chain-of-thought, default
  - grok-4.20-multi-agent-experimental-beta-0304      → 4–16 parallel agents for deep research

Usage:
    from core.grok_router import GrokRouter
    router = GrokRouter(api_key=XAI_API_KEY)
    result = router.dispatch("Analyze the latest nootropic research for cognitive compounding")
"""

import os
import re
import logging
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/.env")

logger = logging.getLogger(__name__)

# ─── Model Slugs ──────────────────────────────────────────────────────────────
GROK_NON_REASONING = "grok-4.20-experimental-beta-0304-non-reasoning"
GROK_REASONING     = "grok-4.20-experimental-beta-0304-reasoning"
GROK_MULTI_AGENT   = "grok-4.20-multi-agent-experimental-beta-0304"
# SuperGrok free tier fallback (rate-limited but no credits required)
GROK_FREE_FALLBACK = "grok-2-mini"
# Local-First Hybrid: Ollama
OLLAMA_MODEL = "gemma3:4b"

# ─── Deep Research Keywords that trigger Multi-Agent ─────────────────────────
DEEP_RESEARCH_TRIGGERS = [
    # SuperGrok Data Center recommended (2026-03-05 patch)
    "complex", "deep-reasoning", "multi-agent", "heavy mode",
    # Nexus UI + Biometric routing (2026-03-05 patch v2)
    "biometric", "omni-tracker", "omnitracker", "authorize", "face id", "consent",
    # original triggers
    "comprehensive analysis", "deep research", "multi-faceted", "regulatory analysis",
    "literature review", "compare", "latest breakthroughs", "synthesize",
    "supply chain", "market analysis", "nootropic research", "neuroscience",
    "competitive intelligence", "due diligence", "landscape analysis",
    "compare and contrast", "global overview", "strategic analysis",
    "coordinate swarm", "vanguard", "centurion sprint", "life os",
]

# ─── Quick/Direct Answer Keywords that trigger Non-Reasoning ─────────────────
QUICK_ANSWER_TRIGGERS = [
    "what is", "define", "quick", "how to", "explain briefly", "summarize",
    "list", "give me", "short answer", "tldr", "one line",
]

# ─── Local-First Triggers that trigger Ollama ─────────────────────────────────
OLLAMA_TRIGGERS = [
    "local", "offline", "private", "fast", "routine", "simple", "internal",
    "personal", "sensitive", "localhost", "gemma", "llama",
]

@dataclass
class RouterDecision:
    model: str
    agent_count: int
    rationale: str
    prompt: str


class GrokRouter:
    """
    Auto-switch router for Grok 4.20 Experimental Beta models.
    Analyzes task prompt and routes to the best model variant.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        default_agent_count: int = 4,
        deep_research_agent_count: int = 16,
    ):
        self.api_key = api_key or os.getenv("XAI_API_KEY")
        self.default_agent_count = default_agent_count
        self.deep_research_agent_count = deep_research_agent_count

        if not self.api_key or self.api_key.startswith("PASTE_"):
            logger.warning(
                "⚠️  [GrokRouter] XAI_API_KEY not configured. "
                "Open .env and set XAI_API_KEY to your key from console.x.ai"
            )

    def classify(self, prompt: str) -> RouterDecision:
        """
        Classify a prompt and return the optimal model + configuration.
        
        Priority: deep_research > reasoning > non_reasoning
        """
        p = prompt.lower()
        prompt_length = len(prompt.split())

        # 1. Deep research threshold: explicit triggers OR long/complex prompt
        deep_triggers_found = [kw for kw in DEEP_RESEARCH_TRIGGERS if kw in p]
        is_deep = bool(deep_triggers_found) or prompt_length > 120

        if is_deep:
            agent_count = self.deep_research_agent_count if len(deep_triggers_found) >= 2 or prompt_length > 200 else self.default_agent_count
            return RouterDecision(
                model=GROK_MULTI_AGENT,
                agent_count=agent_count,
                rationale=f"Deep research detected (triggers: {deep_triggers_found or ['long prompt']}, agents: {agent_count})",
                prompt=prompt,
            )

        # 2. Quick answer threshold: explicit simple triggers
        quick_triggers_found = [kw for kw in QUICK_ANSWER_TRIGGERS if kw in p]
        is_quick = bool(quick_triggers_found) and prompt_length < 30

        if is_quick:
            return RouterDecision(
                model=GROK_NON_REASONING,
                agent_count=1,
                rationale=f"Quick/direct answer detected (triggers: {quick_triggers_found})",
                prompt=prompt,
            )

        # 3. Default: single-agent reasoning for everything else
        return RouterDecision(
            model=GROK_REASONING,
            agent_count=1,
            rationale="Standard reasoning task — single agent chain-of-thought.",
            prompt=prompt,
        )

    def dispatch(self, prompt: str, system_prompt: Optional[str] = None, force_model: Optional[str] = None) -> str:
        """
        Main entry point. Auto-classifies and dispatches to the correct Grok 4.20 model.
        """
        if not self.api_key or self.api_key.startswith("PASTE_"):
            return (
                "[GrokRouter] ❌ API key not configured.\n"
                "→ Open /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/.env\n"
                "→ Set XAI_API_KEY to your key from https://console.x.ai\n"
                "→ Then run again!"
            )

        decision = self.classify(prompt)

        # 1. Local-First Check: If Ollama triggers found or forced
        if any(kw in prompt.lower() for kw in OLLAMA_TRIGGERS) or force_model == "ollama":
            logger.info(f"🚀 [GrokRouter] Routing to Local Ollama ({OLLAMA_MODEL})")
            from core.llm_clients import OllamaClient
            try:
                client = OllamaClient(model=OLLAMA_MODEL)
                return client.generate(prompt, system_prompt=system_prompt)
            except Exception as e:
                logger.warning(f"⚠️ [GrokRouter] Local Ollama failed: {e}. Falling back to reasoning.")
        
        # Allow manual override
        if force_model:
            decision.model = force_model

        logger.info(f"🧭 [GrokRouter] Routing to {decision.model} | {decision.rationale}")
        print(f"\n🧭 GrokRouter Decision:")
        print(f"   Model     : {decision.model}")
        print(f"   Agents    : {decision.agent_count}")
        print(f"   Rationale : {decision.rationale}\n")

        try:
            from xai_sdk import Client
            from xai_sdk.chat import user as xai_user, system as xai_system

            client = Client(api_key=self.api_key)

            if GROK_MULTI_AGENT in decision.model:
                chat = client.chat.create(
                    model=decision.model,
                    agent_count=decision.agent_count,
                )
            else:
                chat = client.chat.create(model=decision.model)

            if system_prompt:
                chat.append(xai_system(system_prompt))

            chat.append(xai_user(prompt))

            output_parts = []
            is_thinking = True

            for response, chunk in chat.stream():
                if chunk.content and is_thinking:
                    print("\n💬 Response streaming...\n")
                    is_thinking = False
                if chunk.content:
                    print(chunk.content, end="", flush=True)
                    output_parts.append(chunk.content)

            print()
            return "".join(output_parts)

        except ImportError:
            return "[GrokRouter] ❌ xai-sdk not installed. Run: pip3 install 'xai-sdk>=1.8.0'"
        except Exception as e:
            err_str = str(e).lower()
            # ─── Auto-Fallback: Credit / Billing Error → Free SuperGrok Tier ────
            is_credit_error = any(kw in err_str for kw in [
                "credits", "license", "billing", "payment", "quota", "permission"
            ])
            if is_credit_error and decision.model != GROK_FREE_FALLBACK:
                print(f"\n⚡ [GrokRouter] Credit limit hit on {decision.model}.")
                print(f"   → Auto-switching to Local Ollama fallback\n")
                return self.dispatch(prompt, system_prompt=system_prompt, force_model="ollama")

            logger.error(f"[GrokRouter] Dispatch failed: {e}")
            return f"[GrokRouter] Error: {e}"


# ─── CLI Test Harness ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    router = GrokRouter()

    # Dry-run classification (no API call needed)
    print("=" * 60)
    print("GrokRouter Auto-Switch Classification Test")
    print("=" * 60)

    test_prompts = [
        "What is neuroplasticity?",
        "Think step by step through the problem of scheduling a sprint",
        "Conduct a comprehensive analysis of the latest breakthroughs in neuroscience for peak executive vitality and cognitive compounding. Include nootropic research, regulatory analysis, and actionable protocols.",
    ]

    for p in test_prompts:
        d = router.classify(p)
        print(f"\nPrompt  : {p[:70]}...")
        print(f"→ Model : {d.model}")
        print(f"→ Agents: {d.agent_count}")
        print(f"→ Why   : {d.rationale}")

    print("\n" + "=" * 60)
    print("To run a live request, call router.dispatch(<your_prompt>)")
    print("Make sure XAI_API_KEY is set in your .env first.")
    print("=" * 60)
