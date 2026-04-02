
import logging
from typing import Optional
from core.tool_manager import tool_manager
from core.llm_clients import PerplexityClient
from scripts.credentials_manager import CredentialsManager

logger = logging.getLogger(__name__)

@tool_manager.register_tool("search_web", "Search the web for a given query.")
def search_web(query: str) -> str:
    """
    Perform a web search using Perplexity if available, or fallback.
    """
    creds = CredentialsManager()
    pplx_key = creds.get_credential("perplexity")
    
    if pplx_key:
        try:
            client = PerplexityClient(api_key=pplx_key)
            # Use sonar-online model for searching
            return client.generate(f"Search result for: {query}", system_prompt="You are a search engine. Return concise results.")
        except Exception as e:
            logger.error(f"Perplexity Search failed: {e}")
            return f"Search failed: {e}"
    
    # Fallback (Mock or Warning)
    return "[System] No search provider configured. Add Perplexity key to enable web search."
