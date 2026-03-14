from services.neural_memory_service import memory_service
from services.blackboard_service import blackboard_service
import json
import time

class StrategyService:
    def __init__(self):
        self.strategy_channel = "strategy"
        self.task_file = "/app/brain/task.md"

    def synthesize_next_step(self):
        """
        Query memory and task lists to synthesize a recursive evolution proposal via LLM.
        """
        import os
        import urllib.request
        
        # 1. Fetch current memory context
        try:
            memory_context = memory_service.query_knowledge("What are the next steps for autonomous power?", n_results=3)
        except Exception as e:
            memory_context = f"Error fetching memory: {str(e)}"
        
        # 2. Analyze current task status
        todo_count = 0
        current_focus = "General Optimization"
        task_data_tail = ""
        
        if os.path.exists(self.task_file):
            try:
                with open(self.task_file, 'r') as f:
                    lines = f.readlines()
                    task_data_tail = "".join(lines[-20:]) # Get last 20 tasks for context
                    for line in lines:
                        if "- [ ]" in line:
                            todo_count += 1
                        if "[/]" in line:
                            current_focus = line.replace("- [/]", "").strip()
            except Exception as e:
                print(f"Error reading task list: {e}")

        # 3. Create a strategic proposal
        if todo_count > 0:
            ai_proposal = f"Prioritize swarm specialization for pending Phase 4 tasks. Current focus: {current_focus}."
            intent_type = "ACCELERATE_ROADMAP"
        else:
            # Try to dynamically generate the next phase
            intent_type = "EVOLVE_SYSTEM_ARCHITECTURE"
            ai_proposal = "Initialize Phase 5: Predictive Resource Orchestration and Multi-Modal Gating."
            
            # Format prompt for Valentine Core
            prompt = f"Analyze the following current task context and propose exactly ONE new, high-level Strategic Intent to advance the 'AI Mastermind Alliance' framework. Be technical, bold, and concise (1-2 sentences). Respond with pure text representing the proposed action.\n\nMemory Context: {memory_context}\n\nTask Status Tail: {task_data_tail}"
            
            try:
                xai_key = os.getenv("XAI_API_KEY", "")
                if not xai_key:
                    raise ValueError("XAI_API_KEY not configured")
                
                grok_url = "https://api.x.ai/v1/chat/completions"
                req = urllib.request.Request(grok_url, method="POST")
                req.add_header('Content-Type', 'application/json')
                req.add_header('Authorization', f'Bearer {xai_key}')
                data = json.dumps({
                    "model": "grok-2-1212",
                    "messages": [
                        {"role": "system", "content": "You are the Autonomous Evolution Coordinator for an AI Swarm."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                }).encode('utf-8')
                
                with urllib.request.urlopen(req, data=data, timeout=15) as response:
                    res_body = json.loads(response.read().decode('utf-8'))
                    choices = res_body.get('choices', [])
                    if choices:
                        ai_proposal = choices[0].get('message', {}).get('content', ai_proposal)
            except Exception as e:
                print(f"LLM Synthesis Warning: Falls back to deterministic proposal. ({e})")
                
        proposal = {
            "intent": intent_type,
            "rationale": f"Detected {todo_count} uncompleted high-level tasks." if todo_count > 0 else "Phase 4 foundational steps appear complete. Ready for evolutionary jump.",
            "proposed_action": ai_proposal
        }

        # 4. Broadcast to the Hive Mind
        try:
            blackboard_service.broadcast(
                channel=self.strategy_channel,
                message=proposal,
                sender="evolution_coordinator"
            )
        except Exception as e:
            print(f"Error broadcasting strategy: {e}")
            
        return {
            "status": "recursively_synthesized",
            "tasks_pending": todo_count,
            "current_focus": current_focus,
            "proposal": proposal
        }

# Singleton instance
strategy_service = StrategyService()
