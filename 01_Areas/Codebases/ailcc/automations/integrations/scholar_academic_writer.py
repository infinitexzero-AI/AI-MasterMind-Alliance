import os
import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime
from openai import AsyncOpenAI
from dotenv import load_dotenv

import sys
AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(AILCC_ROOT))

# Local imports
from automations.integrations.academic_defense import apply_defense_array

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [AcademicWriter] - %(message)s')
logger = logging.getLogger("AcademicWriter")

HIPPOCAMPUS = AILCC_ROOT / "hippocampus_storage"
NOTES_DIR = HIPPOCAMPUS / "scholar_notes"
REVIEWS_DIR = HIPPOCAMPUS / "literature_reviews"
REVIEWS_DIR.mkdir(parents=True, exist_ok=True)

class ScholarAcademicWriter:
    """
    Epoch 31 Core Phase: Aggregates N targeted scholar nodes, mathematically formats them
    into an absolute context window, and engages the LLM to structurally draft 
    a flawless Academic Literature Review.
    """
    def __init__(self, topic_query: str, paper_limit: int = 10):
        self.topic_query = topic_query.lower()
        self.paper_limit = paper_limit
        load_dotenv(os.path.expanduser("~/.ailcc/credentials.env"))
        
        # Use OpenAI primarily, but fall back to local Grok/Ollama if specified
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OPENAI_API_KEY missing. Cannot execute synthesis.")
        self.client = AsyncOpenAI(api_key=api_key)

    def select_targets(self) -> list:
        """Rigorously filters Hippocampus markdown files based on mathematical keyword intersection."""
        logger.info(f"🔍 Scanning Scholar Array for topic: '{self.topic_query}'")
        if not NOTES_DIR.exists():
            return []
            
        targets = []
        md_files = list(NOTES_DIR.glob("*.md"))
        
        # Sort by most recently modified to grab the freshest research
        md_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        
        for md_path in md_files:
            text = md_path.read_text(encoding='utf-8')
            # Check if keywords match title or explicitly inside tags
            if self.topic_query in text.lower() or self.topic_query in md_path.name.lower():
                targets.append({"path": md_path, "content": text[:3000]}) # Strict 3000 char abstraction limit per paper
                if len(targets) >= self.paper_limit:
                    break
                    
        return targets

    async def execute_synthesis(self):
        targets = self.select_targets()
        if len(targets) < 2:
            logger.warning("⚠️ Insufficient context nodes found. At least 2 papers required for a comparative synthesis.")
            return

        logger.info(f"📚 Synthesizing Context Engine with {len(targets)} Academic Nodes...")
        
        # Construct the absolute Context String
        compiled_context = "\\n\\n--- [NEW SCHOLAR NOTE] ---\\n\\n".join([t['content'] for t in targets])
        
        system_prompt = (
            "You are the Sovereign OS Academic Synthesizer. You will receive multiple raw Zotero research notes. "
            "Your objective is to output a highly rigorous, deeply structured academic Literature Review. "
            "Use strict markdown formatting. Group the concepts thematically, not chronologically. "
            "You MUST synthesize the agreements and contradictions between the authors. Do not just summarize papers sequentially."
        )

        try:
            logger.info("🧠 Engaging Neural Execution Array. Drafting Literature Review...")
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Synthesize a Literature Review on '{self.topic_query}' using ONLY the following context:\\n\\n{compiled_context}"}
                ],
                temperature=0.3
            )
            raw_draft = response.choices[0].message.content
            
            # Epoch 31 Task 19: Execute Academic Defense Pipeline to strip LLM patterns
            final_draft = apply_defense_array(raw_draft)
            
            # Deposit File
            timestamp = datetime.now().strftime("%Y%m%d_%H%M")
            safe_topic = self.topic_query.replace(" ", "_").upper()
            file_name = f"LIT_REVIEW_{safe_topic}_{timestamp}.md"
            out_path = REVIEWS_DIR / file_name
            
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(f"---\\ntopic: {self.topic_query}\\npapers_synthesized: {len(targets)}\\nstatus: DRAFT\\ndaemon: scholar_academic_writer\\n---\\n\\n")
                f.write(final_draft)
                
            logger.info(f"✅ Literature Review mathematically constructed and sealed at: {out_path.name}")
            
        except Exception as e:
            logger.error(f"Synthesis Sequence Failed: {e}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Autonomous Academic Writer")
    parser.add_argument("--query", type=str, required=True, help="The conceptual topic to synthesize")
    parser.add_argument("--limit", type=int, default=10, help="Max number of Scholar nodes to pull")
    args = parser.parse_args()
    
    writer = ScholarAcademicWriter(topic_query=args.query, paper_limit=args.limit)
    asyncio.run(writer.execute_synthesis())
