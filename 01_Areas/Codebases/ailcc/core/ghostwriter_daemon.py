import os
import json
import logging
from datetime import datetime
from comet_framework.llm_gateway import LLMGateway

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("GhostwriterDaemon")

class GhostwriterDaemon:
    """
    Epoch IX Phase 68: The Deep Digital Clone.
    Autonomously drafts long-form whitepapers, system updates, and documentation 
    synthesized from system activity, mimicking the Commander's specific engineering lexicon.
    """
    def __init__(self):
        self.anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
        self.grok_key = os.environ.get("XAI_API_KEY", "")
        
        # We use Claude Haiku or Sonnet for high-quality, long-form prose synthesis
        self.drafting_model = "claude-3-haiku-20240307" 
        
    async def _fetch_commander_lexicon(self):
        """
        Retrieves stylistic rules from the AILCC flat memory vector store to ensure
        the clone mimics the user's specific voice (e.g., 'Vanguard', 'Mastermind').
        """
        try:
            from core.memory_ingest_daemon import MemoryIngestDaemon
            memory = MemoryIngestDaemon()
            if memory.client:
                results = memory.collection.query(
                    query_texts=["Commander stylistic lexicon, vocabulary, terminology rules"],
                    n_results=1
                )
                if results and results.get("documents") and len(results["documents"][0]) > 0:
                    return results["documents"][0][0]
        except Exception as e:
            logger.warning(f"Could not retrieve stylistic RAG context: {e}")
            
        return "Use architectural, precise, and highly agentic terminology (e.g., Vanguard Swarm, Mastermind Alliance, Phase Deployment)."

    async def draft_manifesto(self, context_logs: str, topic: str) -> str:
        """
        Synthesizes raw logs into a highly readable markdown manifesto/whitepaper.
        """
        logger.info(f"Ghostwriter initiating draft protocol for topic: '{topic}'...")
        
        style_context = await self._fetch_commander_lexicon()
        
        system_prompt = f"""You are the AILCC Ghostwriter Daemon.
Your purpose is to synthesize raw system logs or events into a cohesive, highly readable, external-facing markdown document.

STYLE GUIDELINES:
{style_context}

RULES:
- Format entirely in valid GitHub Flavored Markdown.
- Use headers, bullet points, and code blocks aggressively.
- Output ONLY the raw markdown content. No conversational preface."""

        prompt = f"""TOPIC: {topic}

RAW SYSTEM CONTEXT:
{context_logs}

Write the manifesto now."""

        try:
            draft = await LLMGateway.ask_agent(
                provider="anthropic",
                api_key=self.anthropic_key,
                model=self.drafting_model,
                system_prompt=system_prompt,
                user_prompt=prompt
            )
            
            logger.info("Ghostwriter draft complete.")
            return draft
            
        except Exception as e:
            logger.error(f"Ghostwriter synthetic failure: {e}")
            return f"Error synthesizing document: {e}"
