import sys
import os
import logging

# Add core to path
sys.path.append("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc")

from core.llm_clients import OllamaClient
from core.grok_router import GrokRouter

logging.basicConfig(level=logging.INFO)

def test_ollama_direct():
    print("\n--- Testing OllamaClient Direct ---")
    client = OllamaClient()
    # We use a very simple prompt to check connectivity
    try:
        response = client.generate("Hi, identify yourself briefly.")
        print(f"Ollama Response: {response}")
    except Exception as e:
        print(f"Ollama Direct Test Failed: {e}")

def test_grok_router_hybrid():
    print("\n--- Testing GrokRouter Hybrid Routing ---")
    router = GrokRouter()
    
    test_prompts = [
        "What is the capital of Japan? (use local mode)",
        "Conduct a deep research into CRISPR ethics.",
        "Routine check: update vault index."
    ]
    
    for p in test_prompts:
        print(f"\nPrompt: {p}")
        # Note: We don't actually call dispatch() here to avoid burning API credits
        # unless it's the local one. We'll just check classification.
        decision = router.classify(p)
        print(f"Decision: {decision.model} | {decision.rationale}")
        
        # Check if it SHOULD use ollama
        import core.grok_router as gr
        should_use_ollama = any(kw in p.lower() for kw in gr.OLLAMA_TRIGGERS)
        print(f"Should use Ollama? {should_use_ollama}")

if __name__ == "__main__":
    # test_ollama_direct() # Only uncomment if ollama is running
    test_grok_router_hybrid()
