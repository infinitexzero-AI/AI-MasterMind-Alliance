import json
from datetime import datetime
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

class SLMRouter:
    """Tier 1: Fast Brain classification and routing (v2.0)"""
    
    def __init__(self, model="phi3:mini", confidence_threshold=0.85):
        self.model = model
        self.threshold = confidence_threshold
        self.stats = {"slm_handled": 0, "llm_escalated": 0}
        self.log_file = "/Users/infinite27/AILCC_PRIME/06_System/Logs/slm_router.log"

    def log(self, entry):
        with open(self.log_file, "a") as f:
            f.write(f"[{datetime.now()}] {entry}\n")

    def classify_task(self, task_description):
        """Classify task complexity and intent with Local Fallback support."""
        
        if OLLAMA_AVAILABLE:
            try:
                # User's specialized prompt logic
                prompt = f"""Analyze this task and provide:
1. Category: [TECH/STRATEGY/LOGISTICS/VAULT/HABITS/SYSTEM]
2. Complexity: [SIMPLE/MEDIUM/COMPLEX]
3. Confidence: [0.0-1.0]
4. Can_Handle_Locally: [true/false]

Task: {task_description}

Output JSON only:"""
                
                response = ollama.generate(
                    model=self.model,
                    prompt=prompt,
                    format="json"
                )
                result = json.loads(response['response'])
                self.log(f"Ollama classification success for: {task_description[:50]}...")
            except Exception as e:
                self.log(f"Ollama failed ({e}), falling back to Regex-SLM.")
                result = self.fallback_classification(task_description)
        else:
            result = self.fallback_classification(task_description)

        # Auto-escalation logic
        if result.get('confidence', 0) < self.threshold or result.get('complexity') == 'COMPLEX':
            result['route'] = 'LLM'
            self.stats['llm_escalated'] += 1
        else:
            result['route'] = 'SLM'
            self.stats['slm_handled'] += 1
        
        result['timestamp'] = datetime.now().isoformat()
        return result

    def fallback_classification(self, desc):
        """Regex-based SLM simulator for low-resource states."""
        desc = desc.lower()
        res = {"category": "SYSTEM", "complexity": "SIMPLE", "confidence": 0.90, "target": "valentine"}
        
        if any(k in desc for k in ["code", "script", "fix", "debug"]):
            res.update({"category": "TECH", "target": "antigravity", "complexity": "MEDIUM"})
        elif any(k in desc for k in ["search", "scrape", "web"]):
            res.update({"category": "LOGISTICS", "target": "comet"})
        elif any(k in desc for k in ["draft", "appeal", "email"]):
            res.update({"category": "STRATEGY", "target": "antigravity", "complexity": "COMPLEX", "confidence": 0.70})
            
        return res

    def get_savings(self):
        """Calculate hypothetical cost savings."""
        total = self.stats['slm_handled'] + self.stats['llm_escalated']
        if total == 0: return {"slm_percentage": 0, "dollars_saved": 0}
        slm_pct = (self.stats['slm_handled'] / total) * 100
        saved = self.stats['slm_handled'] * 0.03
        return {"slm_percentage": slm_pct, "dollars_saved": round(saved, 2)}

if __name__ == "__main__":
    router = SLMRouter()
    test = "Fix the race condition in the sync script"
    result = router.classify_task(test)
    print(json.dumps(result, indent=2))
