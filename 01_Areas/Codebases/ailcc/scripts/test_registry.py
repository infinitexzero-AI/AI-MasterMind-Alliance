
import sys
import os

# Add parent directory to sys.path to allow importing from core
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.router import AgentRouter

def test_router():
    print("Initializing AgentRouter...")
    router = AgentRouter()
    
    test_tasks = [
        "Research painting contractor license requirements in New Jersey",
        "Create an automation chain to generate invoices from Linear tasks",
        "Deep analysis of neuro literature regarding encephalitis recovery",
        "Plan a strategy for the next quarter",
        "Find the best pizza in New York" # Ambiguous / General task
    ]
    
    print(f"\nRunning {len(test_tasks)} Test Cases...")
    print("=" * 60)
    
    for task in test_tasks:
        decision = router.route_task(task)
        agent = decision['selected_agent']
        score = decision['score']
        
        print(f"Task: '{task}'")
        if agent:
            print(f"✅ Delegated to: {agent['name']} ({agent['role']})")
            print(f"   Score: {score}")
            print(f"   Endpoint: {decision['endpoint']}")
        else:
             print("❌ Failed to route task")
        print("-" * 60)

if __name__ == "__main__":
    test_router()
