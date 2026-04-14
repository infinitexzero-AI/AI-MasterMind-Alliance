import os
import json
import logging
import asyncio
import urllib.request
import urllib.error

logger = logging.getLogger("LLMGateway")

class LLMGateway:
    """
    Zero-dependency gateway for calling LLM APIs (OpenAI, Anthropic, xAI)
    using standard urllib library wrapped in asyncio.
    """
    
    @staticmethod
    async def get_global_context():
        """Retrieve the realtime AILCC Global Context array from Redis."""
        try:
            import redis.asyncio as redis
            r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
            ctx = await r.get("AILCC_GLOBAL_CONTEXT")
            await r.aclose()
            if ctx:
                return json.loads(ctx)
        except Exception as e:
            logger.debug(f"Could not load global context: {e}")
        return None

    @staticmethod
    async def ask_agent(provider, api_key, model, system_prompt, user_prompt, skip_context=False):
        """
        Generic async wrapper for LLM calls.
        """
        if not api_key:
            return f"Error: No API Key provided for {provider}"

        if not skip_context:
            try:
                global_ctx = await LLMGateway.get_global_context()
                if global_ctx:
                    context_injection = f"\n\n[SYSTEM INTELLIGENCE: AILCC GLOBAL CONTEXT]\nCommander's Current State: {json.dumps(global_ctx)}\nYou MUST implicitly consider this context if it relates to the user prompt.\n"
                    system_prompt = system_prompt + context_injection
            except Exception as e:
                pass

        try:
            return await asyncio.to_thread(
                LLMGateway._sync_request, 
                provider, api_key, model, system_prompt, user_prompt
            )
        except Exception as e:
            logger.error(f"LLM Call Failed ({provider}): {e}")
            return f"Error connecting to {provider}: {str(e)}"

    @staticmethod
    def _sync_request(provider, api_key, model, system_prompt, user_prompt):
        """
        Synchronous request implementation.
        """
        if provider == "anthropic":
            return LLMGateway._call_anthropic(api_key, model, system_prompt, user_prompt)
        elif provider == "openai" or provider == "grok":
            base_url = "https://api.openai.com/v1/chat/completions"
            if provider == "grok":
                base_url = "https://api.x.ai/v1/chat/completions"
            return LLMGateway._call_openai_compatible(base_url, api_key, model, system_prompt, user_prompt)
        elif provider == "gemini":
            return LLMGateway._call_gemini(api_key, model, system_prompt, user_prompt)
        elif provider == "ollama":
            # Performance Routing: Use Vanguard URL if specified, otherwise local
            vanguard_url = os.getenv("VANGUARD_OLLAMA_URL")
            url = vanguard_url if vanguard_url else "http://localhost:11434/api/chat"
            return LLMGateway._call_ollama(url, model, system_prompt, user_prompt)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    @staticmethod
    def _call_ollama(url, model, system_prompt, user_prompt):
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers)
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["message"]["content"]
        except Exception as e:
            return f"Error: Ollama local service unreachable ({e})"

    @staticmethod
    def _call_gemini(api_key, model, system_prompt, user_prompt):
        # Gemini Pro REST API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        
        # Merge system/user prompt for simple API usage or use specific structure
        full_prompt = f"{system_prompt}\n\nUser: {user_prompt}"
        
        payload = {
            "contents": [{
                "parts": [{"text": full_prompt}]
            }]
        }
        
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers)
        
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode("utf-8"))
            # Safety checks for candidates
            try:
                return result["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                return "Error: No content returned from Gemini."

    @staticmethod
    def _call_openai_compatible(url, api_key, model, system_prompt, user_prompt):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7
        }
        
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers)
        
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]

    @staticmethod
    def _call_anthropic(api_key, model, system_prompt, user_prompt):
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "content-type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": model,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 1024
        }
        
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers)
        
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result["content"][0]["text"]
