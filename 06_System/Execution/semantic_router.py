import json
import logging
from datetime import datetime

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [SEMANTIC_ROUTER] %(message)s")

class SemanticRouter:
    """
    Epoch 50 Load Balancer:
    Evaluates query complexity from 1 to 10 using a fast local model.
    Complexity 1-4: Routed to local 'ollama'
    Complexity 5-10: Routed to 'claude' or 'gpt-4o'
    """
    
    def __init__(self, fast_model="llama3"):
        self.fast_model = fast_model
        
    def evaluate_task(self, topic: str, context: str) -> dict:
        """
        Calculates complexity and returns the optimal routing model.
        """
        if not OLLAMA_AVAILABLE:
            logging.warning("Ollama not found. Falling back to complex route.")
            return {"complexity": 8, "agent": "claude", "reason": "ollama_offline"}
            
        prompt = f"""You are the AILCC Semantic Router.
Analyze the following task and assign a complexity score from 1 to 10.
1-4: Simple formatting, sorting, basic Q&A.
5-7: Moderate logic, coding, or synthesis.
8-10: Extreme architectural design, massive context reasoning.

Topic: {topic}
Context: {context}

Return ONLY a valid JSON object with the following keys:
- "complexity": an integer from 1 to 10
- "reasoning": a short 1-sentence justification

JSON:"""
        
        try:
            response = ollama.generate(
                model=self.fast_model,
                prompt=prompt,
                format="json"
            )
            result = json.loads(response['response'])
            complexity = int(result.get("complexity", 10))
            
            # Gating Logic
            agent = "ollama" if complexity <= 4 else "claude"
            
            logging.info(f"Routed to '{agent}' | Complexity: {complexity}/10 | Reason: {result.get('reasoning', '')}")
            return {
                "complexity": complexity,
                "agent": agent,
                "reason": result.get("reasoning", "")
            }
            
        except Exception as e:
            logging.error(f"Routing evaluation failed: {e}")
            return {"complexity": 10, "agent": "claude", "reason": "evaluation_error"}

if __name__ == "__main__":
    router = SemanticRouter()
    res = router.evaluate_task("Sort CSV", "Sort the attached CSV file by the date column.")
    print(res)
