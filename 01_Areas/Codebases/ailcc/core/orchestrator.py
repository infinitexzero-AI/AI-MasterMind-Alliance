
import json
import logging
import sys
import os
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.llm_clients import GrokClient, ClaudeClient, MockClient, PerplexityClient
from scripts.credentials_manager import CredentialsManager
from core.tool_manager import tool_manager
from core.memory_manager import MemoryManager
import core.tools.logic_bridge # Register the sandbox bridge

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MissionResult:
    success: bool
    output: str
    history: List[Dict[str, str]]

class Orchestrator:
    def __init__(self, use_mock: bool = False):
        self.use_mock = use_mock
        self.creds_manager = CredentialsManager()
        self.clients = {}
        self.memory = MemoryManager()
        
        # Initialize Core Components
        self._initialize_clients()
        
        # Load Tools (System + Web)
        # Import here to register them
        import core.tools.system_tools # pylint: disable=unused-import
        import core.tools.web_tools    # pylint: disable=unused-import

    def _initialize_clients(self):
        """Initialize LLM clients with credentials."""
        if self.use_mock:
            self.clients['grok'] = MockClient("Grok")
            self.clients['claude'] = MockClient("Claude")
            logger.info("Initialized MOCK clients.")
            return

        # Initialize Grok (Orchestrator)
        grok_key = self.creds_manager.get_credential('grok')
        if grok_key:
            try:
                self.clients['grok'] = GrokClient(api_key=grok_key)
                logger.info("Initialized Grok client.")
            except ImportError as e:
                logger.error(f"Failed to initialize Grok client: {e}")

        # Initialize Perplexity (Fallback Orchestrator / Capability)
        pplx_key = self.creds_manager.get_credential('perplexity')
        if pplx_key:
            try:
                self.clients['perplexity'] = PerplexityClient(api_key=pplx_key)
                logger.info("Initialized Perplexity client.")
            except ImportError as e:
                logger.error(f"Failed to initialize Perplexity client: {e}")

        # Initialize Claude (Worker)
        claude_key = self.creds_manager.get_credential('anthropic')
        if claude_key:
            try:
                self.clients['claude'] = ClaudeClient(api_key=claude_key)
                logger.info("Initialized Claude client.")
            except ImportError as e:
                logger.error(f"Failed to initialize Claude client: {e}")

    def run_mission(self, objective: str, domain: str = "General", max_turns: int = 10) -> MissionResult:
        """
        Execute a mission with full agentic capabilities (Tools, Memory, Delegation).
        """
        logger.info(f"Starting Mission: {objective} [{domain}]")
        
        # 1. Retrieve Context from Memory
        recent_missions = self.memory.get_recent_missions(limit=3, domain=domain)
        memory_context = ""
        if recent_missions:
            memory_context = "\nRecent Related Missions:\n" + "\n".join(
                [f"- {m['timestamp']}: {m['objective']} -> {m['outcome']}" for m in recent_missions]
            )

        # 2. Prepare Tools
        tool_schemas = tool_manager.get_tool_schemas()
        tools_desc = json.dumps(tool_schemas, indent=2)

        history = []
        context = (
            f"Mission Objective: {objective}\n"
            f"Domain: {domain}\n"
            f"{memory_context}\n\n"
            "You are the Orchestrator (SuperGrok). You have a team (Claude) and a set of tools.\n"
            "AVAILABLE TOOLS:\n" + tools_desc + "\n\n"
            "PROTOCOL:\n"
            "1. To use a tool, reply with: { \"action\": \"tool\", \"tool_name\": \"...\", \"arguments\": { ... } }\n"
            "   - Use 'logic_bridge' to generate, test, or execute Python utility scripts in the secure sandbox (The Forge).\n"
            "2. To delegate to Claude, reply with: { \"action\": \"delegate\", \"agent\": \"claude\", \"instruction\": \"...\" }\n"
            "3. To finish, reply with: { \"action\": \"finish\", \"final_answer\": \"...\" }\n"
        )
        
        grok = self.clients.get('grok') or self.clients.get('perplexity') or MockClient("Grok") # Fallback chain
        claude = self.clients.get('claude')

        for turn in range(max_turns):
            logger.info(f"--- Turn {turn + 1} ---")
            
            # Using Perplexity as Orchestrator requires different prompting sometimes, but standard ReAct should work.
            system_prompt = "You are a rigid JSON-speaking orchestration manager. Respond ONLY with valid JSON."
            if not self.clients.get('grok') and self.clients.get('perplexity'):
                 logger.info("Using Perplexity as Acting Orchestrator")
            
            # --- PLANNING STEP ---
            decision_raw = grok.generate(context, system_prompt=system_prompt)
            logger.info(f"Grok Thought: {decision_raw}") # Verbose
            
            try:
                # Robust extraction using regex
                import re
                json_match = re.search(r'\{.*\}', decision_raw, re.DOTALL)
                if json_match:
                    clean_json = json_match.group(0)
                    decision = json.loads(clean_json)
                else:
                    # Fallback to simple cleanup
                    clean_json = decision_raw.strip().replace("```json", "").replace("```", "")
                    decision = json.loads(clean_json)
            except json.JSONDecodeError:
                logger.error("Grok returned invalid JSON.")
                context += f"\n[System Error]: Invalid JSON. Please output STRICT JSON.\n"
                continue

            action = decision.get("action")
            logger.info(f"Action: {action}")

            # --- EXECUTION STEP ---
            if action == "finish":
                final_answer = decision.get("final_answer")
                self.memory.save_mission(objective, final_answer, domain, history)
                return MissionResult(True, final_answer, history)
            
            elif action == "tool":
                t_name = decision.get("tool_name")
                t_args = decision.get("arguments", {})
                
                result = tool_manager.execute_tool(t_name, t_args)
                logger.info(f"Tool Result ({t_name}): {result[:100]}...")
                
                context += f"\n[Tool Execution]: {t_name}({t_args})\n[Result]: {result}\n"
                history.append({"role": "tool", "name": t_name, "result": result})

            elif action == "delegate":
                instruction = decision.get("instruction")
                target_agent = decision.get("agent")
                
                if target_agent == "claude" and claude:
                    logger.info(f"Delegating to Claude: {instruction}")
                    claude_response = claude.generate(instruction)
                    
                    context += f"\n[Delegation]: Claude, {instruction}\n[Response]: {claude_response}\n"
                    history.append({"role": "claude", "instruction": instruction, "response": claude_response})
                elif target_agent == "claude" and not claude:
                     context += f"\n[System Error]: Agent 'claude' is initialized but not responding or key is missing.\n"
                else:
                    context += f"\n[System Error]: Agent '{target_agent}' unavailable.\n"

        return MissionResult(False, "Max turns reached.", history)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Multi-Agent Orchestrator CLI")
    parser.add_argument("--mission", type=str, help="Mission objective", required=True)
    parser.add_argument("--domain", type=str, help="Mission domain", default="General")
    parser.add_argument("--mock", action="store_true", help="Use mock agents")
    args = parser.parse_args()
    
    orchestrator = Orchestrator(use_mock=args.mock)
    result = orchestrator.run_mission(args.mission, domain=args.domain)
    print("\n=== FINAL RESULT ===")
    print(result.output)
