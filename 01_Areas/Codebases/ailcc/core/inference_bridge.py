import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from core.llm_clients import (
    ClaudeClient, GrokClient, PerplexityClient, 
    ChatGPTClient, OllamaClient, GeminiClient, MockClient
)
from scripts.credentials_manager import CredentialsManager

logger = logging.getLogger(__name__)

class InferenceStrategy:
    PERFORMANCE = "performance"    # Top tier (Claude 3.5 Sonnet / Grok 4.20)
    LOCAL_FIRST = "local_first"    # Use Ollama if available, fallback to cloud
    COST_OPTIMIZED = "cost"        # Use Gemini Flash or Mini models
    PRIVACY_FIRST = "privacy"      # Strictly Ollama

class InferenceBridge:
    def __init__(self):
        self.creds = CredentialsManager()
        self.clients = {}
        self.status = {}
        self._initialize_pool()

    def _initialize_pool(self):
        """Initialize all possible clients based on credentials."""
        # 1. Ollama (Local & Cloud)
        self.clients['ollama'] = OllamaClient(model="gemma3:4b")
        self.clients['ollama_cloud'] = OllamaClient(model="kimi-k2.5:cloud")
        
        # 2. Cloud Providers
        providers = {
            'anthropic': ('claude', ClaudeClient),
            'grok': ('grok', GrokClient),
            'perplexity': ('perplexity', PerplexityClient),
            'openai': ('chatgpt', ChatGPTClient),
            'gemini': ('gemini', GeminiClient)
        }

        for cred_key, (client_key, client_class) in providers.items():
            key = self.creds.get_credential(cred_key) or os.getenv(f"{cred_key.upper()}_API_KEY")
            if not key and cred_key == 'gemini':
                key = os.getenv("GOOGLE_API_KEY")
            if not key and cred_key == 'grok':
                key = os.getenv("XAI_API_KEY")
            if key:
                try:
                    self.clients[client_key] = client_class(api_key=key)
                    self.status[client_key] = "ready"
                except Exception as e:
                    logger.warning(f"Failed to initialize {client_key}: {e}")
                    self.status[client_key] = "err"
            else:
                self.status[client_key] = "missing_key"

    async def get_health(self) -> Dict[str, str]:
        """Perform a basic health check on all initialized clients."""
        health = {}
        for name, client in self.clients.items():
            if name in ['ollama', 'ollama_cloud']:
                # Quick check if Ollama is listening
                import socket
                try:
                    with socket.create_connection(("localhost", 11434), timeout=1):
                        health[name] = "online"
                except:
                    health[name] = "offline"
            else:
                health[name] = self.status.get(name, "unknown")
        return health

    async def dispatch(self, prompt: str, strategy: str = InferenceStrategy.PERFORMANCE, system_prompt: Optional[str] = None) -> str:
        """Dispatches an inference request based on the selected strategy."""
        health = await self.get_health()
        
        if strategy == InferenceStrategy.PRIVACY_FIRST:
            if health.get('ollama') == "online":
                return self.clients['ollama'].generate(prompt, system_prompt)
            return "[Error] Privacy-First requested but local Ollama is offline."

        if strategy == InferenceStrategy.LOCAL_FIRST:
            if health.get('ollama') == "online":
                return self.clients['ollama'].generate(prompt, system_prompt)
            # Fallback to performance if local is down
            strategy = InferenceStrategy.PERFORMANCE

        # Preference Order based on tier
        tier_list = []
        if strategy == InferenceStrategy.PERFORMANCE:
            tier_list = ['gemini', 'grok', 'claude', 'perplexity', 'chatgpt', 'ollama']
        else:
            tier_list = ['gemini', 'chatgpt', 'claude', 'grok']

        for provider in tier_list:
            if health.get(provider) == "ready":
                try:
                    res = self.clients[provider].generate(prompt, system_prompt)
                    if res and not res.startswith("[Error]"):
                        return res
                except Exception as e:
                    logger.warning(f"Provider {provider} failed: {e}")
                    continue

        return "[Error] All inference endpoints failed or are unavailable."

    async def dispatch_stateful(self, prompt: str, conversation_history: list, strategy: str = InferenceStrategy.PERFORMANCE, system_prompt: Optional[str] = None) -> Tuple[str, list]:
        """
        Phase 60: Stateful Dispatch.
        Executes a prompt while providing the continuous context of the autonomous thought loop.
        Appends the new prompt and response to the history and returns the updated chain.
        """
        # Append the new user prompt to history
        conversation_history.append({"role": "user", "content": prompt})
        
        # Flatted history into a massive prompt string for the foundational wrapper
        # In a fully realized state, this passes actual role arrays to the core LLM SDK.
        context_string = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation_history[-10:]]) # Keep last 10 turns to avoid blowing up context window
        
        full_prompt = f"PRIOR THOUGHT LOOP CONTEXT:\n{context_string}\n\nCURRENT OBJECTIVE:\n{prompt}"
        
        response_text = await self.dispatch(full_prompt, strategy=strategy, system_prompt=system_prompt)
        
        # Append the AI response to history
        conversation_history.append({"role": "assistant", "content": response_text})
        
        return response_text, conversation_history

# Global Bridge Instance
inference_bridge = InferenceBridge()
