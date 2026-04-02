#!/usr/bin/env python3
"""
Perplexity AI Client for Academic Research
Handles Deep Research mode, literature synthesis, and citation management
"""

import os
import json
import logging
import requests
from typing import List, Dict, Optional
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerplexityResearchClient:
    """Client for Perplexity AI's research capabilities"""
    
    BASE_URL = "https://api.perplexity.ai/chat/completions"
    MODELS = {
        # Updated model names based on Perplexity API documentation
        "sonar_huge": "llama-3.1-sonar-huge-128k-online",  # Best for deep research
        "sonar_large": "llama-3.1-sonar-large-128k-online", # Balanced
        "sonar_small": "llama-3.1-sonar-small-128k-online"  # Fast
    }

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            logger.warning("PERPLEXITY_API_KEY not found. Research capabilities will be limited.")

    def deep_research(self, topic: str, depth: str = "detailed", focus: str = "academic") -> Dict:
        """
        Perform deep research on a topic with citation extraction
        
        Args:
            topic: Research question or topic
            depth: 'quick' or 'detailed'
            focus: 'academic', 'writing', 'math', etc.
            
        Returns:
            Dict containing synthesis, citations, and follow-up questions
        """
        if not self.api_key:
            return {"error": "API key missing", "synthesis": "Perplexity API key valid required for deep research."}

        model = self.MODELS["sonar_huge"] if depth == "detailed" else self.MODELS["sonar_large"]
        
        # Construct academic research system prompt
        system_prompt = """You are an expert academic research assistant. 
        Your goal is to provide comprehensive, well-cited literature synthesis.
        - Use academic tone.
        - Cite sources inline [1].
        - Provide a 'References' section at the end with URLs.
        - Highlight key methodologies and findings.
        - Identify gaps in current research.
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Conduct a comprehensive literature review on: {topic}. Focus on recent developments (2020-2025)."}
        ]

        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.2, # Low temperature for factual accuracy
                "max_tokens": 4096 if depth == "detailed" else 2048,
                "return_citations": True
            }

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            response = requests.post(self.BASE_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            content = data['choices'][0]['message']['content']
            citations = data.get('citations', [])
            
            return {
                "topic": topic,
                "synthesis": content,
                "citations": citations,
                "model_used": model,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Perplexity Deep Research failed: {e}")
            return {"error": str(e)}

    def quick_lookup(self, query: str) -> Dict:
        """Fast lookup for specific concepts or methodologies (Pro Search equivalent)"""
        # Similar to deep_research but optimized for speed with smaller model
        return self.deep_research(query, depth="quick")

    def format_as_markdown(self, research_data: Dict) -> str:
        """Convert research result to beautifully formatted Markdown"""
        if "error" in research_data:
            return f"Error: {research_data['error']}"

        citations = research_data.get('citations', [])
        
        md = f"# Research Synthesis: {research_data.get('topic', 'Untitled')}\n\n"
        md += f"*Generated: {research_data.get('timestamp')}*\n\n"
        md += "---\n\n"
        md += research_data.get('synthesis', '')
        md += "\n\n## References\n"
        
        for i, url in enumerate(citations, 1):
            md += f"{i}. [{url}]({url})\n"
            
        return md

if __name__ == "__main__":
    # Test block
    client = PerplexityResearchClient()
    print("Perplexity Research Client initialized.")
    # Example usage:
    # result = client.deep_research("Impact of sleep on neuroplasticity")
    # print(client.format_as_markdown(result))
