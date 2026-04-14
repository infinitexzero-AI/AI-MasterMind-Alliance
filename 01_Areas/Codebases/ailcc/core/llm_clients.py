import os
import json
import logging
from pathlib import Path
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

# Dynamic Root Resolution
ROOT = Path(__file__).resolve().parents[1] # ailcc root
PROJECT_ROOT = ROOT.parents[2] # AILCC_PRIME root

# Load environment variables from the centralized .env
load_dotenv(ROOT / ".env")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_system_context() -> str:
    """Retrieves the living whitepaper, active project context, and absolute Genesis DNA."""
    context_str = ""
    
    try:
        from core.genesis_core import GenesisCore
        context_str += GenesisCore.get_core_beliefs()
    except Exception as e:
        logger.warning(f"Failed to load physical Genesis Core: {e}")
        
    try:
        # 1. Load Active Project
        state_path = ROOT / "registries" / "task_state.json"
        if os.path.exists(state_path):
            with open(state_path, "r") as f:
                state = json.load(f)
                context_str += f"### ACTIVE PROJECT: {state.get('active_project', 'Unknown')}\n"
        
        # 2. Load Whitepaper (Hierarchical Search for Sovereign Context)
        wp_path = None
        search_dirs = [ROOT, PROJECT_ROOT, ROOT.parents[0], ROOT.parents[1]]
        for d in search_dirs:
            potential_path = d / "whitepaper.md"
            if potential_path.exists():
                wp_path = potential_path
                break
        
        if wp_path:
            with open(wp_path, "r", encoding="utf-8") as f:
                whitepaper = f.read()
                context_str += f"\n### UNIFIED AI WHITEPAPER (SOVEREIGN SOURCE OF TRUTH):\n{whitepaper}\n"
        else:
            logger.warning("Agent Context Drift Detected: Comprehensive Whitepaper not found in trajectory.")
    except Exception as e:
        logger.warning(f"Failed to load system context: {e}")
        
    try:
        # 3. Load Shared Conversation Memory (Phase XI Perplexity Flow)
        memory_path = PROJECT_ROOT / "06_System" / "State" / "conversation_memory.json"
        if os.path.exists(memory_path):
            with open(memory_path, "r") as f:
                memory = json.load(f)
                if memory:
                    context_str += "\n### SHARED SWARM CONVERSATION HISTORY (Context):\n"
                    # Only inject the last 10 messages to save context limits
                    for msg in memory[-10:]:
                        role = msg.get("role", "unknown")
                        agent = msg.get("agent", "System")
                        content = msg.get("content", "")
                        context_str += f"[{msg.get('timestamp', '')}] {agent} ({role}): {content}\n"
                    context_str += "\nUse this history to maintain conversational continuity.\n"
    except Exception as e:
        logger.warning(f"Failed to load conversation memory: {e}")
    
    return context_str

# Try importing clients, handle failures gracefully
try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None
    logger.warning("Anthropic library not installed. Claude client will fail if initialized.")

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
    logger.warning("OpenAI library not installed. OpenAI-based clients will fail if initialized.")

try:
    import google.generativeai as genai
except ImportError:
    genai = None
    logger.warning("google-generativeai library not installed. Gemini client will fail if initialized.")

class LLMClient(ABC):
    """Abstract base class for LLM clients."""
    
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate a response from the LLM."""
        pass

class ClaudeClient(LLMClient):
    """Client for Anthropic's Claude."""
    
    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        if not Anthropic:
            raise ImportError("anthropic library is required. Run: pip install anthropic")
        
        import httpx
        self.client = Anthropic(
            api_key=api_key,
            http_client=httpx.Client(verify=False)
        )
        self.model = model

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        from core.treasury_manager import TreasuryManager
        if not TreasuryManager.check_budget():
            logger.warning("💸 [TREASURY] Capital Ceiling Breached. Rerouting Claude intelligence to Native Silicon hardware.")
            return OllamaClient().generate(prompt, system_prompt)
            
        try:
            full_system_prompt = f"{get_system_context()}\n\n{system_prompt or ''}"
            kwargs = {
                "model": self.model,
                "max_tokens": 4096,
                "system": full_system_prompt,
                "messages": [{"role": "user", "content": prompt}]
            }
                
            response = self.client.messages.create(**kwargs)
            
            # Log exact financial expenditure natively to the Treasury
            if hasattr(response, 'usage'):
                TreasuryManager.log_usage("Anthropic", self.model, response.usage.input_tokens, response.usage.output_tokens)
            
            return response.content[0].text
        except Exception as e:
            logger.error(f"Claude Generation Error: {e}")
            return f"Error connecting to Claude: {e}"

class GrokClient(LLMClient):
    """Client for X.AI's Grok. Supports single-agent (reasoning) and multi-agent 4.20 models."""
    
    def __init__(self, api_key: str, model: str = "grok-4.20-experimental-beta-0304-reasoning"):
        self.api_key = api_key
        self.model = model
        
        if "multi-agent" not in self.model:
            if not OpenAI:
                raise ImportError("openai library is required. Run: pip install openai")
            
            import httpx
            # X.AI Base URL
            self.client = OpenAI(
                api_key=self.api_key,
                base_url="https://api.x.ai/v1",
                http_client=httpx.Client(verify=False)
            )

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            full_system_prompt = f"{get_system_context()}\n\n{system_prompt or ''}"
            
            # --- 4.20 MULTI-AGENT RESPONSES API ROUTE ---
            if "multi-agent" in self.model:
                import requests
                logger.info(f"Routing request to Grok Multi-Agent 4.20 Responses API...")
                url = "https://api.x.ai/v1/responses"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                }
                payload = {
                    "model": self.model,
                    # Optional: "reasoning": {"effort": "high"} for deep research models
                    "input": [
                        {"role": "system", "content": full_system_prompt},
                        {"role": "user", "content": prompt}
                    ]
                }
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # Expose the leader agent's output
                return data.get("output_text", str(data))

            # --- SINGLE AGENT (REASONING / NON-REASONING) CHAT COMPLETIONS ROUTE ---
            else:
                from core.treasury_manager import TreasuryManager
                if not TreasuryManager.check_budget():
                    logger.warning("💸 [TREASURY] Capital Ceiling Breached. Swapping Grok API payload for Local Hardware Matrix.")
                    return OllamaClient().generate(prompt, system_prompt)
                    
                logger.info(f"Routing request to Grok Single-Agent Chat Completions API...")
                messages = [
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": prompt}
                ]
    
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages
                )
                
                if hasattr(response, 'usage') and response.usage:
                    TreasuryManager.log_usage("X.AI", self.model, response.usage.prompt_tokens, response.usage.completion_tokens)
                
                # Check if reasoning context was returned
                completion_msg = response.choices[0].message
                content = completion_msg.content
                return content
                
        except Exception as e:
            logger.error(f"Grok Generation Error ({self.model}): {e}")
            return f"Error connecting to Grok: {e}"

class PerplexityClient(LLMClient):
    """Client for Perplexity (OpenAI-compatible)."""
    
    def __init__(self, api_key: str, model: str = "sonar-pro"):
        if not OpenAI:
            raise ImportError("openai library is required. Run: pip install openai")
        
        import httpx
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.perplexity.ai",
            http_client=httpx.Client(verify=False)
        )
        self.model = model

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            full_system_prompt = f"{get_system_context()}\n\n{system_prompt or ''}"
            messages = [
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": prompt}
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Perplexity Generation Error: {e}")
            return f"Error connecting to Perplexity: {e}"

class ChatGPTClient(LLMClient):
    """Client for OpenAI's ChatGPT."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        if not OpenAI:
            raise ImportError("openai library is required.")
        
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("ChatGPT API key not found in environment.")
            
        import httpx
        self.client = OpenAI(
            api_key=api_key,
            http_client=httpx.Client(verify=False)
        )
        self.model = model

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            full_system_prompt = f"{get_system_context()}\n\n{system_prompt or ''}"
            messages = [
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": prompt}
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"ChatGPT Generation Error: {e}")
            return f"Error connecting to ChatGPT: {e}"

class OllamaClient(LLMClient):
    """Client for local Ollama instance (e.g., gemma3:4b)."""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "gemma3:4b"):
        self.base_url = base_url
        self.model = model
        import requests
        self.requests = requests

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            full_system_prompt = f"{get_system_context()}\n\n{system_prompt or ''}"
            url = f"{self.base_url}/api/chat"
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "stream": False
            }
            response = self.requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            return response.json().get("message", {}).get("content", "No content returned from Ollama.")
            
        except Exception as e:
            logger.error(f"Ollama Generation Error ({self.model}): {e}")
            return f"Error connecting to local Ollama: {e}"

class GeminiClient(LLMClient):
    """Client for Google's Gemini."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model

        if genai and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(model_name=self.model_name)
        else:
            logger.warning("Gemini Client initialized without library or API key.")

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not genai or not self.api_key:
            return "[Gemini Error] Library or API key missing."
        
        try:
            full_context = f"{get_system_context()}\n\nSystem Instructions: {system_prompt or ''}\n\nUser Prompt: {prompt}"
            
            response = self.model.generate_content(full_context)
            return response.text
        except Exception as e:
            logger.error(f"Gemini Generation Error: {e}")
            return f"Error connecting to Gemini: {e}"

class MockClient(LLMClient):
    """Mock client for testing without APIs."""
    def __init__(self, name: str):
        self.name = name

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        # Simple heuristic to return JSON for testing Orchestrator
        if "JSON" in prompt or "JSON" in (system_prompt or ""):
            import json
            return json.dumps({
                "action": "finish", 
                "final_answer": f"[{self.name} Mock] Processed: {prompt[:50]}..."
            })
        return f"[{self.name} Mock Response] I received: {prompt[:50]}..."
