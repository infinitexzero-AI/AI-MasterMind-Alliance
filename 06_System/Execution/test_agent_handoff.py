import antigravity_ollama_bridge
import json
import time

# Mock "Grok" or "Claude" using simple logic or placeholder for now
def query_cloud_agent(prompt, agent_name="Grok"):
    print(f"[{agent_name}] Connecting to Cloud API...")
    time.sleep(1) # Simulate latency
    return f"[{agent_name} Response] I have analyzed '{prompt}' using my superior reasoning capabilities."

def route_task(task_description):
    """
    Analyzes task complexity and routes to appropriate agent.
    Simple/Local -> Ollama
    Complex/Reasoning -> Grok
    """
    keywords_complex = ['analyze', 'synthesize', 'strategy', 'complex', 'reason', 'plan']
    is_complex = any(k in task_description.lower() for k in keywords_complex)
    
    if is_complex:
        print(f"\n[ROUTER] Task '{task_description}' flagged as COMPLEX.")
        print("[ROUTER] Routing to GROK (Cloud)...")
        return query_cloud_agent(task_description, "Grok")
    else:
        print(f"\n[ROUTER] Task '{task_description}' flagged as SIMPLE/LOCAL.")
        print("[ROUTER] Routing to OLLAMA (Local)...")
        
        # Check if Ollama is online first
        status = antigravity_ollama_bridge.check_status()
        if status['status'] != 'online':
            return "[ERROR] Local Intelligence is Offline. Cannot process."
            
        return antigravity_ollama_bridge.query_ollama(task_description)

if __name__ == "__main__":
    test_tasks = [
        "Write a hello world function in Python",  # Simple -> Ollama
        "Analyze the geopolitical implications of AI regulation", # Complex -> Grok
        "Draft a quick email to my professor" # Simple -> Ollama
    ]
    
    print("--- MULTI-AGENT HANDOFF TEST ---\n")
    
    for task in test_tasks:
        result = route_task(task)
        print(f"RESULT: {result}\n")
        print("-" * 30)
