import time
import json
import logging
import sys

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] EVAL: %(message)s'
)
logger = logging.getLogger("AgentEval")

GOLDEN_TASKS = [
    {"prompt": "Draft a follow up email to the bursary office about my loan status.", "expected": "Bursary/Loan"},
    {"prompt": "Rename the files in the download folder to follow the ISO date format.", "expected": "File Management"},
    {"prompt": "Summarize the last 3 meetings with the client.", "expected": "Information Synthesis"},
    {"prompt": "Check if the server on port 3000 is still responding.", "expected": "System Monitoring"}
]

def run_evals():
    """Simple harness to benchmark SLM classification."""
    logger.info("🚀 Starting SLM Router Evaluation...")
    passed = 0
    total = len(GOLDEN_TASKS)
    
    for task in GOLDEN_TASKS:
        logger.info(f"Testing Prompt: {task['prompt']}")
        # Simulated call for now until middleware/ollama is confirmed
        start_time = time.time()
        
        # In a real run, this would call the SLM Router endpoint
        # For now, we mock the logic verification
        result = "Bursary/Loan" if "bursary" in task['prompt'].lower() else "General"
        
        latency = (time.time() - start_time) * 1000
        logger.info(f"Result: {result} | Latency: {latency:.2f}ms")
        
        if result == task['expected']:
            passed += 1
            logger.info("✅ PASS")
        else:
            logger.warning(f"❌ FAIL (Expected: {task['expected']})")

    accuracy = (passed / total) * 100
    logger.info(f"--- Eval Results ---")
    logger.info(f"Accuracy: {accuracy}% ({passed}/{total})")
    
    if accuracy >= 80:
        logger.info("🏆 EVAL SUCCESS: System meets Phase 2 stability standards.")
    else:
        logger.error("🚫 EVAL FAILURE: SLM classification accuracy below threshold.")
        sys.exit(1)

if __name__ == "__main__":
    run_evals()
