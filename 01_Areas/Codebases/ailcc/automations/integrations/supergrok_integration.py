#!/usr/bin/env python3
"""
SuperGrok Client for Advanced Analysis
Handles Think Mode (reasoning) and DeepSearch functionality
Uses X.AI API compatible client
"""

import os
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime

# Try using the shared LLM client if available, else fallback
try:
    from ...core.llm_clients import GrokClient as BaseGrokClient
except ImportError:
    # Fallback implementation if specific import fails (e.g. running as script)
    import requests
    class BaseGrokClient:
        def __init__(self, api_key): 
            self.api_key = api_key
            self.base_url = "https://api.x.ai/v1"
        def generate(self, prompt, system_prompt=None):
            # Basic implementation for fallback
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            messages = []
            if system_prompt: messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            try:
                r = requests.post(f"{self.base_url}/chat/completions", 
                                json={"model": "grok-beta", "messages": messages}, headers=headers)
                return r.json()['choices'][0]['message']['content']
            except Exception as e: return str(e)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SuperGrokClient:
    """Enhanced Grok client for academic analysis"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("XAI_API_KEY")
        if not self.api_key:
            logger.warning("XAI_API_KEY not found. SuperGrok capabilities will be unavailable.")
        
        # Use existing client or fallback
        self.client = BaseGrokClient(api_key=self.api_key) if self.api_key else None

    def think_mode_analysis(self, data_context: str, question: str) -> Dict:
        """
        Analyze complex data with step-by-step reasoning (Think Mode simulation)
        Useful for interpreting datasets, graphs, or complex methodology.
        """
        if not self.client:
            return {"error": "API Key missing"}

        system_prompt = """You are SuperGrok, an advanced AI analyst.
        Use 'Think Mode' to solve this problem:
        1. Break down the problem step-by-step.
        2. Analyze the provided data context.
        3. Challenge your own assumptions.
        4. Provide a synthesized conclusion.
        
        Format output with headings: ## Analysis, ## Reasoning, ## Conclusion.
        """
        
        full_prompt = f"Data Context: {data_context}\n\nQuestion: {question}"
        
        try:
            response = self.client.generate(prompt=full_prompt, system_prompt=system_prompt)
            return {
                "type": "think_mode",
                "analysis": response,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"SuperGrok Analysis failed: {e}")
            return {"error": str(e)}

    def code_generation(self, task: str, language: str = "python") -> Dict:
        """Generate analysis code (R/Python) for research data"""
        if not self.client:
            return {"error": "API Key missing"}
            
        system_prompt = f"You are an expert scientific programmer. Write efficient, documented {language} code."
        response = self.client.generate(prompt=task, system_prompt=system_prompt)
        
        return {
            "type": "code_gen",
            "language": language,
            "code": response,
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    client = SuperGrokClient()
    print("SuperGrok Client initialized.")
