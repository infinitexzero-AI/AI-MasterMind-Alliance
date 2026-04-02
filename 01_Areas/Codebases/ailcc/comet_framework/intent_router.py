import logging
from enum import Enum

logger = logging.getLogger("IntentRouter")

class TaskType(Enum):
    BROWSER = "BROWSER"
    DESKTOP = "DESKTOP"
    HYBRID = "HYBRID"
    UNKNOWN = "UNKNOWN"

class ExecutionTier(Enum):
    EDGE = "EDGE"     # Target: Ollama Local Inference (Llama 3.1)
    CLOUD = "CLOUD"   # Target: External APIs (Grok, OpenAI, Claude)

class IntentRouter:
    """
    The 'Prefrontal Cortex' of the Life OS.
    Analyzes natural language prompts to determine the execution domain.
    """
    
    def __init__(self):
        self.browser_keywords = [
            "search", "find", "lookup", "google", "browse", "web", "url", 
            "linear", "github", "issue", "pr", "pull request", "dashboard",
            "verify", "check site", "monitor"
        ]
        self.desktop_keywords = [
            "git", "commit", "push", "pull", "clone", "repo", "code", 
            "terminal", "run", "execute", "file", "folder", "directory",
            "install", "pip", "npm", "node", "python", "script", "edit"
        ]
        
        self.edge_cognitive_keywords = [
            "format", "tag", "extract", "sort", "categorize", "list",
            "summarize", "standardize", "parse", "clean", "organize"
        ]
        
        self.cloud_cognitive_keywords = [
            "analyze", "write", "design", "evaluate", "architect",
            "create", "synthesize", "essay", "report", "solve", "debug"
        ]

    def route_intent(self, prompt, is_ai_generated=False):
        """
        Classifies the intent of the prompt.
        Returns: (TaskType, confidence_score, target_agent, ExecutionTier)
        """
        prompt_lower = prompt.lower()
        
        # 0. Cognitive Tiering (Phase 81 Edge Shunting)
        # Background system predictive tasks always default to free local Edge
        if is_ai_generated:
             execution_tier = ExecutionTier.EDGE
        else:
             edge_score = sum(1 for w in self.edge_cognitive_keywords if w in prompt_lower)
             cloud_score = sum(1 for w in self.cloud_cognitive_keywords if w in prompt_lower)
             if cloud_score > 0:
                 execution_tier = ExecutionTier.CLOUD
             elif edge_score > 0:
                 execution_tier = ExecutionTier.EDGE
             else:
                 # Default to Cloud for ambiguous un-tagged human requests
                 execution_tier = ExecutionTier.CLOUD
                 
        # 1. Desktop / Dev Signals
        desktop_score = sum(1 for w in self.desktop_keywords if w in prompt_lower)
        
        # 2. Browser / Research Signals
        browser_score = sum(1 for w in self.browser_keywords if w in prompt_lower)
        
        logger.info(f"Router Analysis | Desktop: {desktop_score} | Browser: {browser_score} | Tier: {execution_tier.value}")

        # Classification Logic
        if desktop_score > 0 and browser_score > 0:
            return TaskType.HYBRID, 0.8, "Sequencer", execution_tier
            
        elif desktop_score > browser_score:
            if "git" in prompt_lower:
                return TaskType.DESKTOP, 0.9, "Antigravity (Git)", execution_tier
            return TaskType.DESKTOP, 0.7, "Antigravity", execution_tier
            
        elif browser_score >= desktop_score and browser_score > 0:
            return TaskType.BROWSER, 0.7, "Comet", execution_tier
            
        else:
            return TaskType.UNKNOWN, 0.0, "Comet (Fallback)", execution_tier

    def get_action_plan(self, task_type, prompt):
        """Returns a structured plan based on type"""
        if task_type == TaskType.DESKTOP:
            return {
                "domain": "DESKTOP",
                "tool": "antigravity_bridge",
                "action": "execute_local"
            }
        elif task_type == TaskType.BROWSER:
             return {
                "domain": "BROWSER",
                "tool": "selenium/puppeteer",
                "action": "execute_remote"
            }
        return {"domain": "GENERAL", "action": "consult_llm"}
