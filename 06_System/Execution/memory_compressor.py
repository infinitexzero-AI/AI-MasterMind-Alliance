import json
import logging
from typing import List, Dict
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [CONTEXT_PRUNING] %(message)s")

class MemoryCompressor:
    """
    Epoch 50 Context Pruning Engine
    Monitors a conversation history array. If the raw character/token length
    exceeds the ceiling, it pauses the agent, runs a local compression algorithm,
    and returns a densely summarized single-object history.
    """
    
    def __init__(self, max_tokens=8000, model="llama3"):
        self.max_tokens = max_tokens
        self.model = model
        # Approximation: 1 token ~= 4 characters in English
        self.char_ceiling = self.max_tokens * 4

    def _estimate_size(self, history: List[Dict]) -> int:
        raw_text = json.dumps(history)
        return len(raw_text)

    def compress(self, history: List[Dict]) -> List[Dict]:
        """
        Takes raw chat history. Returns summarized history if it exceeds thresholds.
        """
        if not history:
            return history
            
        current_size = self._estimate_size(history)
        if current_size < self.char_ceiling:
            return history
            
        logging.warning(f"Memory threshold breached! ({current_size} chars > {self.char_ceiling} ceiling). Initiating Neural Compression...")
        
        if not OLLAMA_AVAILABLE:
            logging.error("Ollama not found. Cannot compress memory natively. Truncating array instead.")
            return history[-5:] # Crude fallback: keep last 5 messages
            
        raw_context = json.dumps(history, indent=2)
        prompt = f"""You are the AILCC Memory Pruning Engine.
The following JSON array contains a massive conversation history between an AI agent and the system.
Your task is to comprehensively summarize the entire context into a single dense summary paragraph.
Keep all critical entities, ongoing goals, bugs found, and the current state of execution.

HISTORY TO COMPRESS:
{raw_context}

Return ONLY the condensed summary text. Do not include introductory phrases.
SUMMARY:"""

        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt
            )
            compressed_text = response['response'].strip()
            
            logging.info(f"Compression Complete! New context length: {len(compressed_text)} chars. Original: {current_size} chars.")
            
            # Flush history and return a new initialized state with the injected memory
            return [
                {"role": "system", "content": f"Previous Context Summary: {compressed_text}"}
            ]
        except Exception as e:
            logging.error(f"Compression failed: {e}. Truncating safely.")
            return history[-5:]

if __name__ == "__main__":
    # Test execution
    compressor = MemoryCompressor(max_tokens=100)
    test_history = [
        {"role": "user", "content": "I need you to scan the disk for large files."},
        {"role": "assistant", "content": "Scanning the disk... found 5 items."},
        {"role": "user", "content": "Excellent. Now compress them into a tar.gz."},
        {"role": "assistant", "content": "Compressing into archive.tar.gz..."}
    ]
    # Multiply to artificially bloat size
    test_history = test_history * 5
    new_mem = compressor.compress(test_history)
    print(json.dumps(new_mem, indent=2))
