
import os
import sys
import logging

# Ensure the core module is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.llm_clients import GrokClient, ClaudeClient, PerplexityClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SSL_Verify_Test")

def test_connectivity():
    # We'll use mock responses if API keys aren't set, 
    # but the primary goal is checking if the SSL bypass logic runs without error.
    print("Testing SSL Bypass Configuration...")
    
    try:
        # Mocking or using dummy keys just to check initialization
        grok = GrokClient(api_key="dummy_key")
        claude = ClaudeClient(api_key="dummy_key")
        perp = PerplexityClient(api_key="dummy_key")
        
        print("Successfully initialized clients with SSL bypass.")
        return True
    except Exception as e:
        print(f"Failed to initialize clients: {e}")
        return False

if __name__ == "__main__":
    if test_connectivity():
        sys.exit(0)
    else:
        sys.exit(1)
