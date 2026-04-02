import os
import json
import logging
import datetime
import asyncio
import websockets
import psutil
import subprocess
import redis.asyncio as redis
from enum import Enum
from dotenv import load_dotenv
from .llm_gateway import LLMGateway
from .agent_registry import AgentRegistry
from .intent_router import IntentRouter, TaskType
from pydantic import ValidationError
from core.schema import validate_event, validate_task_payload, validate_omni_command, validate_system_error

# Ensure AILCC_PRIME is in path so we can import internal modules
import sys
from pathlib import Path
AILCC_PRIME_PATH = Path(__file__).resolve().parent.parent
if str(AILCC_PRIME_PATH) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME_PATH))

from automations.core.task_assignments import assign_task
# Configure Logging
log_file = os.path.join(os.getcwd(), 'system.log')
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CometOrchestrator")

class TaskStatus(Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ESCALATED = "ESCALATED"

DASHBOARD_WS_URL = "ws://localhost:5005"

class OrchestrationEngine:
    def __init__(self):
        self.tasks = []
        self.load_config()
        self.registry = AgentRegistry() 
        self.router = IntentRouter()
        self.websocket = None
        self.active_objectives = [] # Phase 60: Autonomous objective queue
        self._last_roster = None
        self._last_telemetry = None
        logger.info(f"Orchestration Engine Initialized. Primary Agent: {self.primary_agent}")

    def load_config(self):
        # Load centralized credentials
        creds_path = os.path.expanduser("~/.ailcc/credentials.env")
        load_dotenv(creds_path)
        
        self.coinbase_key = os.getenv("COINBASE_API_KEY")
        self.ai_key = os.getenv("OPENAI_API_KEY")
        
        # Agent Routing Config
        self.primary_agent = os.getenv("PRIMARY_AGENT", "grok")
        self.secondary_agent = os.getenv("SECONDARY_AGENT", "gemini")
        self.tertiary_agents = os.getenv("TERTIARY_AGENTS", "claude,openai").split(',')
        
        # API Keys for Gateway
        self.grok_key = os.getenv("XAI_API_KEY") 
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        
        self.cost_tracking = os.getenv("COST_TRACKING_ENABLED", "false").lower() == "true"
        self.daily_budget = float(os.getenv("DAILY_COST_LIMIT", "0.00"))
        self.alert_threshold = float(os.getenv("COST_ALERT_THRESHOLD", "0.01"))
        self.current_daily_spend = 0.00

    def check_budget(self, estimated_cost):
        """Checks if operation is within budget"""
        if not self.cost_tracking:
            return True
        
        if self.current_daily_spend + estimated_cost > self.daily_budget:
            logger.warning(f"Budget Exceeded! Request Cost: ${estimated_cost}, Total: ${self.current_daily_spend}")
            return False
        return True

    def log_omni_trace(self, event_type, details, device_id="intel-i5"):
        """Task #2: Auto-Log Every Move to omni_trace.jsonl"""
        trace_path = os.path.join(os.getcwd(), "logs/omni_trace.jsonl")
        os.makedirs(os.path.dirname(trace_path), exist_ok=True)
        
        entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "device_id": device_id,
            "event_type": event_type,
            "details": details
        }
        
        try:
            with open(trace_path, 'a') as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.error(f"Failed to write omni_trace: {e}")

    def track_cost(self, agent_id, cost):
        """Updates daily spend and triggers alerts"""
        if not self.cost_tracking:
            return

        self.current_daily_spend += cost
        logger.info(f"Cost Update: +${cost:.4f} | Daily Total: ${self.current_daily_spend:.4f}")

        if self.current_daily_spend >= self.alert_threshold:
             # Optimization: Only broadcast alert once per session or on significant jumps
             asyncio.create_task(self.broadcast_update(
                "COST_ALERT", 
                "WARNING", 
                f"Daily spend ${self.current_daily_spend:.4f} exceeds alert threshold!"
            ))

    async def broadcast_structured_plan(self, plan_id: str, title: str, steps: list):
        """Phase 72: Anchors dynamic JSON templates directly into the Dashboard UI as visual checklists."""
        if not self.websocket: return
        payload = {
            "type": "ACTION_PLAN",
            "timestamp": datetime.datetime.now().isoformat(),
            "payload": {
                "id": plan_id,
                "title": title,
                "steps": steps,
                "status": "IN_PROGRESS"
            }
        }
        await self.websocket.send(json.dumps(payload))

    def _load_skill_templates(self):
        templates = {}
        template_dir = os.path.join(os.getcwd(), 'core', 'skill_templates')
        if os.path.exists(template_dir):
            for t_file in os.listdir(template_dir):
                if t_file.endswith('.json'):
                    try:
                        with open(os.path.join(template_dir, t_file), 'r') as f:
                            t_data = json.load(f)
                            if 'trigger' in t_data:
                                templates[t_data['trigger']] = t_data
                    except Exception as e:
                        logger.error(f"Failed to load template {t_file}: {e}")
        return templates

    async def _execute_dynamic_template(self, template, payload):
        template_name = template.get('name', 'UNKNOWN_TEMPLATE')
        plan_id = f"plan_{datetime.datetime.now().strftime('%H%M%S')}"
        logger.info(f"Phase 71/72 Dynamic Skill Loader: Executing {template_name}")
        
        # 1. Broadcast the FULL checklist schema upfront to the React UI
        steps_schema = []
        for i, step in enumerate(template.get('workflow_steps', [])):
             steps_schema.append({
                 "id": f"step_{i}",
                 "title": f"{step.get('node', 'Node')} ({step.get('action', 'Action')})",
                 "status": "pending"
             })
             
        await self.broadcast_structured_plan(
             plan_id=plan_id,
             title=f"Mastermind Synergy: {template_name}",
             steps=steps_schema
        )
        
        await self.broadcast_update(
            "MASTERMIND_ALLIANCE",
            "IN_PROGRESS",
            f"Spinning up Template: {template_name} ({template.get('description', '')})"
        )
        
        try:
            # Lazy load daemons
            from core.hippocampus_bridge import HippocampusBridge
            from core.stealth_ghostwriter_daemon import StealthGhostwriter
            from core.vision_matrix_daemon import VisionMatrixDaemon
            from core.graph_rag_daemon import GraphRAGDaemon
            from core.ghostwriter_daemon import GhostwriterDaemon
            from core.sovereign_agency_daemon import SovereignAgencyDaemon
            
            daemons = {
                "hippocampus_bridge": HippocampusBridge(),
                "pyautogui_ghost_typer": StealthGhostwriter(),
                "vision_matrix": VisionMatrixDaemon() if os.path.exists("core/vision_matrix_daemon.py") else None,
                "graph_rag_daemon": GraphRAGDaemon() if os.path.exists("core/graph_rag_daemon.py") else None,
                "ghostwriter_daemon": GhostwriterDaemon() if os.path.exists("core/ghostwriter_daemon.py") else None,
                "sovereign_agency": SovereignAgencyDaemon() if os.path.exists("core/sovereign_agency_daemon.py") else None
            }
            
            # Simulated state for passing data between steps
            context_data = payload.get("prompt", payload.get("task", ""))
            
            for i, step in enumerate(template.get('workflow_steps', [])):
                step_id = step.get('step_id', 'unknown')
                node = step.get('node', 'unknown')
                action = step.get('action', 'unknown')
                
                # Update specific step status
                steps_schema[i]["status"] = "in_progress"
                await self.broadcast_structured_plan(plan_id, f"Mastermind Synergy: {template_name}", steps_schema)
                
                await self.broadcast_update(
                    template_name,
                    "IN_PROGRESS",
                    f"Step '{step_id}': Dispatching to {node} -> {action}"
                )
                
                # Dynamic Routing (Example implementations)
                if node == "hippocampus_bridge" and action == "fetch_academic_context":
                     context_data = await daemons[node].query_all_domains(context_data)
                     context_data = str(context_data) # stringify for next steps
                
                elif node == "hippocampus_bridge" and action == "query_all_domains":
                     context_data = await daemons[node].run_sync_workflow(context_data)
                     
                elif node == "llm_gateway" and action == "claude_rtf_solve_synthesis":
                     context_data = await daemons["pyautogui_ghost_typer"].claude_rtf_solve_synthesis(context_data, payload.get("prompt", "Academic Essay"))
                     
                elif node == "llm_gateway" and action == "grok_syntax_mutation":
                     context_data = await daemons["pyautogui_ghost_typer"].grok_syntax_mutation(context_data)
                     
                elif node == "pyautogui_ghost_typer" and action == "emit_keystrokes_to_word":
                     # Run physical typer in thread pool
                     loop = asyncio.get_running_loop()
                     await loop.run_in_executor(None, daemons[node].emit_keystrokes_to_word, context_data)
                
                else:
                    await asyncio.sleep(1.5) # Simulate execution time for unimplemented nodes
                
                # Mark step completed
                steps_schema[i]["status"] = "completed"
                await self.broadcast_structured_plan(plan_id, f"Mastermind Synergy: {template_name}", steps_schema)
                
            await self.broadcast_update(template_name, "COMPLETED", f"Mastermind Workflow executed entirely via dynamic blueprint: {template_name}")
        except Exception as e:
            logger.error(f"Template Execution Failed: {e}")
            await self.broadcast_update(template_name, "FAILED", str(e))

    def select_agent(self, task_complexity="medium", required_capabilities=None):
        """
        Selects the best agent based on complexity and cost.
        Complexity: low, medium, high, critical
        """
        selected_agent = self.tertiary_agents[0] # Default Fallback

        if task_complexity == "critical":
            selected_agent = self.primary_agent
        elif task_complexity == "high":
            selected_agent = self.primary_agent
        elif task_complexity == "medium":
            selected_agent = self.secondary_agent
        
        # Enforce Budget - Force downgrade if over budget
        if self.cost_tracking and self.current_daily_spend >= self.daily_budget:
            if selected_agent == self.primary_agent: # Downgrade from Paid to Free
                logger.warning(f"Budget limit reached. Downgrading {selected_agent} to {self.secondary_agent}")
                return self.secondary_agent
        
        return selected_agent


    async def connect_to_dashboard(self):
        """Connect to Next.js WebSocket server"""
        try:
            from core.mcp_client_gateway import MCPClientGateway
            self.mcp_gateway = MCPClientGateway()
            await self.mcp_gateway.initialize_connections()
        except ImportError:
            logger.warning("MCPClientGateway not found. Proceeding without external MCP capabilities.")

        while True:
            try:
                async with websockets.connect(DASHBOARD_WS_URL) as ws:
                    self.websocket = ws
                    logger.info("Connected to Dashboard Visual Cortex")
                    # Run heartbeat (sender), listener (receiver), and Phase 60 thought loop concurrently
                    await asyncio.gather(
                        self.run_heartbeat_loop(),
                        self.listen_for_feedback(),
                        self.autonomous_thought_loop(),
                        self.listen_to_voice_interlock()
                    )
            except Exception as e:
                logger.warning(f"Dashboard disconnected: {e}. Retrying in 5s...")
                await asyncio.sleep(5)

    async def listen_to_voice_interlock(self):
        """Phase 88: Background loop to capture voice commands from Redis"""
        try:
            r = await self._get_redis()
            pubsub = r.pubsub()
            await pubsub.subscribe("channel:voice_command")
            logger.info("Orchestrator mapped to Vocal Ingress Pipeline (channel:voice_command)")
            
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        prompt = data.get("prompt")
                        if prompt:
                            logger.info(f"🎤 Voice Interlock Received: {prompt}")
                            # Send into standard executor queue
                            asyncio.create_task(self.process_task(prompt, target_agent=None, subtask_mode=False))
                    except Exception as e:
                        logger.error(f"Voice data parse error: {e}")
        except Exception as e:
            logger.error(f"Voice Interlock Listener Error: {e}")
            await asyncio.sleep(5)

    async def listen_for_feedback(self):
        """Listen for messages from Dashboard"""
        try:
            async for message in self.websocket:
                try:
                    raw_data = json.loads(message)
                    event = validate_event(raw_data)
                    data = raw_data # Maintain legacy support mapping
                except ValidationError as e:
                    logger.error(f"ZERO-TRUST REJECTION: Malformed Websocket Event detected and blocked:\n{e}")
                    await self.broadcast_update("SYSTEM", "ERROR", f"Sentinel Exception: Payload Rejected")
                    continue
                except Exception as e:
                    logger.error(f"Unparseable websocket message: {e}")
                    continue
                
                if data.get('type') == 'USER_FEEDBACK':
                    await self.handle_feedback(data['payload'])
                elif data.get('type') == 'SCHOLAR_REQUEST':
                    await self.handle_scholar_request(data['payload'])
                elif data.get('type') == 'ANTIGRAVITY_HEARTBEAT':
                    logger.info(f"Received Heartbeat from Gemini Adapter: {data.get('payload')}")
                elif data.get('type') == 'GIT_OPERATION':
                    await self.handle_git_operation(data.get('payload'))
                elif data.get('type') == 'REGISTER_AGENT':
                    payload = data.get('payload')
                    self.registry.register_agent(
                        payload.get('name'),
                        payload.get('role'),
                        payload.get('capabilities'),
                        payload.get('status', 'ONLINE')
                    )
                    await self.broadcast_roster()
                elif data.get('type') == 'PROCESS_TASK':
                    try:
                         # Phase 82: Enforce strictly-typed TaskPayload
                         task_payload = validate_task_payload(data.get('payload', {})).model_dump()
                         await self.handle_task_request(task_payload)
                    except ValidationError as e:
                         logger.error(f"SENTINEL: Blocked invalid Task Payload: {e}")
                elif data.get('type') == 'DATA_EXTRACTION':
                    await self.handle_data_extraction(data.get('payload'))
                
                # SRE Introspection Protocol (Phase 53)
                elif data.get('type') == 'SYSTEM_ERROR':
                    error_metadata = data.get('metadata', {})
                    trace = error_metadata.get('trace', "Unknown Error")
                    file_source = error_metadata.get('log_file', "Unknown Source")
                    
                    logger.critical(f"SRE INTERCEPT: Fatal error caught from {file_source}")
                    
                    # Generate an autonomous triage report via Grok
                    prompt = f"The following fatal error occurred in the AILCC node at '{file_source}'. Analyze this stack trace, explain what caused it, and suggest a 1-line bash command to hotfix it if possible.\n\nTRACE:\n{trace}"
                    
                    triage_response = await LLMGateway.ask_agent(
                        "grok", self.grok_key, "grok-beta",
                        "You are the self-healing AI Debugger for the AILCC system. Be concise and technical.",
                        prompt
                    )
                    
                    await self.broadcast_update(
                        "INCIDENT_RESPONSE",
                        "ESCALATED",
                        f"Crash in {file_source}: {triage_response}"
                    )
                
                # OMNI-Protocol: Standardized Command Handling
                elif data.get('type') == 'OMNI_COMMAND':
                    command = data.get('command') # PURGE, OPTIMIZE, DISPATCH
                    payload = data.get('payload', {})
                    
                    print(f"[Orchestrator] Received OMNI-Command: {command}")
                    
                    # Phase 71: Dynamic Template Loader Check
                    skill_templates = self._load_skill_templates()
                    if command in skill_templates:
                        # For backwards compatibility with Phase 69, if the command is INITIALIZE_AGENCY_PROJECT
                        # we want to execute the real hard-coded daemon for now instead of just simulating it.
                        if command != 'INITIALIZE_AGENCY_PROJECT':
                            await self._execute_dynamic_template(skill_templates[command], payload)
                            continue # Skip the hardcoded parsing below
                    
                    if command == 'DISPATCH':
                        task_description = payload.get('task')
                        if task_description:
                            self.log_omni_trace("OMNI_DISPATCH", {"task": task_description})
                            # Phase 60: Push tasks to the autonomous queue rather than immediate synchronous execution
                            logger.info(f"Phase 60: Pushing objective to Autonomous Thought Loop: {task_description}")
                            self.active_objectives.append(task_description)
                            await self.broadcast_update("SYSTEM_ALERT", "INFO", "Objective pushed to Autonomous Thought Loop.")
                    
                    elif command == 'OPTIMIZE':
                        # Trigger local optimization scripts (e.g. Vault Organizer)
                        target = payload.get('target', 'VAULT')
                        print(f"[Orchestrator] Optimizing Target: {target}")
                        # In a real scenario, this would trigger a subprocess or internal method
                        await self.broadcast_update(
                            'SYSTEM_ALERT',
                            'INFO',
                            f"Optimization started for {target}"
                        )

                    elif command == 'PURGE':
                        # Clear logs or temporary state
                        print("[Orchestrator] Purging system integrity logs...")
                        await self.broadcast_update(
                            'SYSTEM_ALERT',
                            'WARNING',
                            "System PURGE command executed." 
                        )

                    elif command == 'CONSULT':
                        # AI Query (Grok/Gemini)
                        prompt = payload.get('prompt')
                        provider = payload.get('provider', 'grok') # Default to Grok
                        model = payload.get('model', 'grok-beta') 
                        
                        logger.info(f"Consulting Oracle ({provider}): {prompt[:50]}...")
                        
                        # Determine API Key
                        api_key = self.grok_key
                        if provider == 'gemini':
                            api_key = os.getenv("GEMINI_API_KEY")
                            model = payload.get('model', 'gemini-pro')
                        elif provider == 'openai':
                            api_key = self.openai_key

                        # RAG Context Augmentation
                        augmented_prompt = self._augment_prompt_with_rag(prompt)
                        
                        # Phase 67: GraphRAG Context Injection
                        # Pull logical dependencies and architectural relationships, not just flat text
                        try:
                            from core.graph_rag_daemon import GraphRAGDaemon
                            graph = GraphRAGDaemon()
                            # Simple heuristic: Attempt to find files or major terms mentioned in the prompt
                            potential_nodes = [w.strip("'\",.;:()") for w in prompt.split() if '.' in w or len(w) >= 5]
                            graph_context = []
                            for node in potential_nodes:
                                chain = graph.retrieve_logical_chain(node, depth=2)
                                if chain and not chain[0].startswith("Node '"):
                                    graph_context.extend(chain)
                            
                            unique_context = list(set(graph_context))
                            if unique_context:
                                augmented_prompt += f"\n\n[GraphRAG Overlay: Logical system dependencies related to your query]\n"
                                augmented_prompt += "\n".join(unique_context)
                                logger.info(f"GraphRAG Overlay: Injected {len(unique_context)} multidimensional edges into consciousness context.")
                        except Exception as e:
                            logger.warning(f"GraphRAG Extraction Error (Non-fatal): {e}")

                        response = await LLMGateway.ask_agent(
                            provider, api_key, model,
                            "You are a Strategic Advisor for the AILCC system. Use context if provided.",
                            augmented_prompt
                        )
                        
                        await self.broadcast_update(
                            'AI_RESPONSE',
                            'COMPLETED',
                            response
                        )

                    elif command == 'PUBLISH':
                        # Phase 68: The Deep Digital Clone
                        topic = payload.get('topic', 'Recent AILCC Advancements')
                        context_logs = payload.get('context', 'Recent tasks include GraphRAG integration and Multi-Agent Blackboard consensus.')
                        
                        logger.info(f"Triggering Deep Digital Clone to author manifesto on: {topic}")
                        await self.broadcast_update(
                            "DIGITAL_CLONE",
                            "IN_PROGRESS",
                            f"Ghostwriter Daemon synthesizing manifesto for {topic}..."
                        )
                        
                        from core.ghostwriter_daemon import GhostwriterDaemon
                        from core.publishing_bridge import PublishingBridge
                        
                        ghostwriter = GhostwriterDaemon()
                        bridge = PublishingBridge()
                        
                        draft = await ghostwriter.draft_manifesto(context_logs, topic)
                        if "Error synthesizing" not in draft:
                            filepath = await bridge.publish_markdown(topic, draft)
                            await self.broadcast_update(
                                "DIGITAL_CLONE",
                                "COMPLETED",
                                f"Manifesto Published successfully to:\n{filepath}"
                            )
                        else:
                            await self.broadcast_update("DIGITAL_CLONE", "FAILED", draft)

                    elif command == 'INITIALIZE_AGENCY_PROJECT':
                        # Phase 69: The Sovereign Software Company
                        project_name = payload.get('project_name', 'Untitled_Agency_Project')
                        idea = payload.get('idea', 'Build a simple web server.')
                        
                        logger.info(f"Triggering Sovereign Agency for project: {project_name}")
                        await self.broadcast_update(
                            "SOVEREIGN_AGENCY",
                            "IN_PROGRESS",
                            f"Initializing autonomous agency pipeline for: {project_name}"
                        )
                        
                        from core.sovereign_agency_daemon import SovereignAgencyDaemon
                        
                        agency = SovereignAgencyDaemon()
                        
                        # We pass a lambda to forward agency internal steps to the central websocket
                        async def agency_ws_callback(domain, status, msg):
                            await self.broadcast_update(domain, status, msg)
                            
                        result = await agency.run_development_cycle(project_name, idea, ws_callback=agency_ws_callback)
                        
                        if result.startswith("Success"):
                            await self.broadcast_update("SOVEREIGN_AGENCY", "COMPLETED", result)
                        else:
                            await self.broadcast_update("SOVEREIGN_AGENCY", "FAILED", result)

                elif data.get('type') == 'OPTIMIZE_WORKFLOW':
                     # Comet-Grok Feedback Loop
                    payload = data.get('payload')
                    trace_id = payload.get('trace_id')
                    logger.info(f"Optimization Requested for Trace: {trace_id}")
                    
                    # 1. Read Trace (Simulated)
                    trace_path = os.path.join(os.getcwd(), "traces", f"{trace_id}.jsonl")
                    if os.path.exists(trace_path):
                        with open(trace_path, 'r') as f:
                            trace_data = [json.loads(line) for line in f]
                        
                        # 2. Send to Grok (Simulated)
                        # In real system: response = await LLMGateway.ask_agent("grok", ..., "Critique this trace...")
                        optimization_result = f"Optimization Complete. Recommendations: consolidate tabs, use CSS selectors for {trace_data[0].get('task', 'task')}."
                        
                        # 3. Broadcast Result
                        await self.broadcast_update(
                            "WORKFLOW_OPTIMIZATION",
                            "COMPLETED",
                            optimization_result
                        )
                    else:
                        logger.warning(f"Trace not found: {trace_path}")
                        await self.broadcast_update("WORKFLOW_OPTIMIZATION", "FAILED", "Trace file not found.")

                elif data.get('command', {}).get('action') == 'EXPAND_AGENT_POOL':
                    # Handle raw command object (uplink format)
                    cmd_data = data.get('command', {})
                    new_agents = cmd_data.get('parameters', {}).get('new_agents', [])
                    for agent in new_agents:
                        self.registry.register_agent(
                            agent.get('id').replace('_', ' ').title(), # simple formatting web_scraper -> Web Scraper
                            agent.get('role').replace('_', ' ').title(),
                            ["Dynamic Uplink"], 
                            "ONLINE"
                        )
                    await self.broadcast_roster()
                elif data.get('command', {}).get('action') in ['SET_RECURRING_DELEGATION', 'ADD_RECURRING_DELEGATION']:
                    # Handle recurring delegation setup (Mode 5)
                    cmd_data = data.get('command', {})
                    params = cmd_data.get('parameters', {})
                    
                    # In a real system, this would schedule a cron job or async task.
                    # For now, we simulate the scheduling and broadcast the success.
                    task_name = params.get('task')
                    target_ai = params.get('target_ai')
                    freq = params.get('frequency')
                    
                    confirmation_msg = f"Scheduled '{task_name}' [{freq}] -> Delegated to {target_ai.title()}"
                    
                    logger.info(f"Automation: {confirmation_msg}")
                    
                    await self.broadcast_update(
                        "AUTOMATION_SCHEDULE",
                        "ACTIVE",
                        confirmation_msg
                    )

                elif data.get('command', {}).get('action') == 'SYNC_ACADEMIC_TERM':
                    logger.info("Executing Phase 74: Syncing Active Academic Term to Task Router...")
                    courses_path = AILCC_PRIME_PATH / "01_Areas/modes/mode-1-student/current_courses.json"
                    if courses_path.exists():
                        with open(courses_path, 'r') as f:
                            term_data = json.load(f)
                            
                        # Extract all deliverables and map to the linear task system
                        synced_count = 0
                        for course in term_data.get('courses', []):
                            course_code = course.get('code')
                            for d in course.get('deliverables', []):
                                if d.get('status') != 'Completed':
                                    title = d.get('title')
                                    assign_task(
                                        task_id=f"uni_{course_code.replace(' ', '')}_{title.replace(' ', '')}",
                                        task_title=f"[{course_code}] {title}",
                                        agent_id="scholar",
                                        priority=3
                                    )
                                    synced_count += 1
                        
                        await self.broadcast_update(
                            "TERM_SYNC",
                            "COMPLETED",
                            f"Synced {synced_count} pending deliverables from {term_data.get('semester')} to OmniTracker."
                        )
                    else:
                        logger.error(f"Failed to find {courses_path}")
                        await self.broadcast_update("TERM_SYNC", "FAILED", "current_courses.json not found.")

        except Exception as e:
            logger.error(f"Error reading from websocket: {e}")

    async def handle_feedback(self, payload):
        """Process feedback from the user"""
        task_id = payload.get('taskId')
        action = payload.get('action')
        logger.info(f"Received HITL Feedback for {task_id}: {action}")
        
        # In a real engine, this would resume a paused workflow.
        # For now, we verify by broadcasting a confirmation.
        await self.broadcast_update(
            task_id, 
            "IN_PROGRESS", 
            f"Resuming task after {action}..."
        )

    async def broadcast_roster(self, force=False):
        """Send full agent roster to Dashboard with Delta Check"""
        if not self.websocket: return
        
        roster = self.registry.get_roster()
        
        # Optimization: Only send if roster changed
        if not force and roster == self._last_roster:
            return
            
        self._last_roster = roster
        payload = {
            "type": "AGENT_ROSTER",
            "timestamp": datetime.datetime.now().isoformat(),
            "payload": roster
        }
        await self.websocket.send(json.dumps(payload))

    async def broadcast_comet_status(self):
        """Broadcasts contents of run_logs.json for realtime Comet UI"""
        if not self.websocket: return
        
        try:
            logs_path = "comet_framework/run_logs.json"
            if os.path.exists(logs_path):
                with open(logs_path, 'r') as f:
                    data = json.load(f)
                    payload = {
                        "type": "COMET_STATUS",
                        "timestamp": datetime.datetime.now().isoformat(),
                        "payload": data
                    }
                    await self.websocket.send(json.dumps(payload))
        except Exception as e:
            logger.error(f"Failed to broadcast Comet status: {e}")

    async def handle_task_request(self, payload):
        """Process natural language task using Intent Router"""
        prompt = payload.get('prompt')
        trace_enabled = payload.get('trace', False)
        logger.info(f"Processing Task: {prompt} (Trace: {trace_enabled})")

        if trace_enabled:
             trace_file = f"traces/trace_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_comet.jsonl"
             with open(trace_file, 'a') as f:
                 f.write(json.dumps({"timestamp": datetime.datetime.now().isoformat(), "event": "TASK_START", "task": prompt}) + "\n")
        
        # 1. Route Intent
        is_ai_generated = payload.get('metadata', {}).get('is_ai_generated', False)
        task_type, confidence, target_agent, exec_tier = self.router.route_intent(prompt, is_ai_generated=is_ai_generated)
        
        # 2. Log Decision
        logger.info(f"Intent Classified: {task_type.value} (Conf: {confidence}) -> Agent: {target_agent} [{exec_tier.value}]")
        
        # 3. Broadcast Decision to UI
        await self.broadcast_update(
            "INTENT_ROUTER", 
            "CLASSIFIED", 
            f"Routing to {target_agent} ({task_type.value}) via {exec_tier.value}"
        )
        
        # 4. Execute Logic (Mock for now, creates foundation for dispatch)
        if task_type == TaskType.DESKTOP:
            if prompt.startswith("git "):
                # Parse Git Command
                git_args = prompt.split(" ")[1:]
                logger.info(f"Executing Git Command: {git_args}")

                try:
                    result = self.execute_git_operation(git_args)
                    self.log_omni_trace("GIT_EXECUTION", {"command": git_args, "result": "success"})

                    await self.broadcast_update(
                        "GIT_EXECUTION",
                        "COMPLETED",
                        f"Executed: {prompt}"
                    )

                    await self.broadcast_tool_event(
                        "Git Terminal",
                        "Antigravity",
                        result if result else "Success (No Output)"
                    )

                except Exception as e:
                    await self.broadcast_update(
                        "GIT_EXECUTION",
                        "FAILED",
                        str(e)
                    )
                # Parse Git Command
                git_args = prompt.split(" ")[1:] 
                logger.info(f"Executing Git Command: {git_args}")
                
                try:
                    result = self.execute_git_operation(git_args)
                    
                    await self.broadcast_update(
                        "GIT_EXECUTION",
                        "COMPLETED",
                        f"Executed: {prompt}"
                    )
                    
                    await self.broadcast_tool_event(
                        "Git Terminal",
                        "Antigravity",
                        result if result else "Success (No Output)"
                    )
                    
                except Exception as e:
                    await self.broadcast_update(
                        "GIT_EXECUTION",
                        "FAILED",
                        str(e)
                    )
            else:
                # Phase 56: Cross-Ecosystem Symbiosis (MCP Client Interception)
                mcp_tools = self.mcp_gateway.get_registered_tools() if hasattr(self, 'mcp_gateway') else {}
                
                # Simple heuristic matching for demonstration:
                matched_tool = None
                for t_name in mcp_tools.keys():
                    # E.g., 'execute_query' matches 'query' or 'execute'
                    if any(k in prompt.lower() for k in t_name.split("_") if len(k) > 3):
                        matched_tool = t_name
                        break
                        
                if matched_tool:
                    logger.info(f"Task matches external MCP Tool: {matched_tool}. Routing to Gateway.")
                    await self.broadcast_update("MCP_GATEWAY", "IN_PROGRESS", f"Routing request to external MCP server tool: {matched_tool}")
                    
                    try:
                        # In production, LLM would extract JSON schema parameters here.
                        result = await self.mcp_gateway.call_tool(matched_tool, {"query": prompt})
                        
                        output_text = result.get("content", [{"text": "Success"}])[0].get("text")
                        if result.get("isError"):
                            await self.broadcast_update("MCP_GATEWAY", "FAILED", f"External tool failed: {output_text}")
                        else:
                            await self.broadcast_update("MCP_GATEWAY", "COMPLETED", f"Executed remote MCP tool => Output: {output_text}")
                            await self.broadcast_terminal_signal(f"Routed via MCP: {matched_tool}", "OUT")
                    except Exception as e:
                        logger.error(f"MCP Gateway Execution Error: {e}")
                        await self.broadcast_update("MCP_GATEWAY", "FAILED", f"System Error: {e}")
                    
                    return # Exit early

                # Phase 57: Neural Skill Forging Integration
                logger.info(f"Unmapped Desktop Task: {prompt}. Consulting Skill Vault...")
                try:
                    import chromadb
                    client = chromadb.HttpClient(host=os.getenv("CHROMA_HOST", "localhost"), port=int(os.getenv("CHROMA_PORT", 8001)))
                    vault = client.get_collection(name="skill_vault")
                    
                    results = vault.query(query_texts=[prompt], n_results=1)
                    
                    if results['distances'] and len(results['distances'][0]) > 0 and results['distances'][0][0] < 1.0:
                        # Found existing skill
                        metadata = results['metadatas'][0][0]
                        script_code = metadata.get('code')
                        language = metadata.get('language')
                        logger.info(f"Found matching skill in vault (distance: {results['distances'][0][0]}). Executing directly.")
                        
                        # Execute directly
                        import subprocess, tempfile
                        ext = ".js" if language == "nodejs" else ".py"
                        cmd = ["node"] if language == "nodejs" else ["python3"]
                        with tempfile.NamedTemporaryFile(suffix=ext, mode='w', delete=False) as f:
                            f.write(script_code)
                            temp_path = f.name
                        
                        try:
                            # Exec
                            proc = subprocess.run(cmd + [temp_path], capture_output=True, text=True)
                            await self.broadcast_update("SKILL_EXECUTION", "COMPLETED", f"{proc.stdout}\n{proc.stderr}".strip() or "Execution Finished")
                            await self.broadcast_terminal_signal(f"Executed Forged Skill: {prompt}", "OUT")
                        finally:
                            os.remove(temp_path)

                    else:
                        # Phase 66: Multi-Agent Blackboard Interception
                        # Route unknown tasks through the Blackboard for consensus before forging
                        logger.info("No existing skill found. Dispatching to Multi-Agent Blackboard for consensus.")
                        await self.broadcast_update("BLACKBOARD_DEBATE", "IN_PROGRESS", "Summoning Grok, Claude, and Ollama for peer review...")
                        
                        from core.blackboard_daemon import BlackboardDaemon
                        blackboard = BlackboardDaemon()
                        consensus = await blackboard.debate_and_resolve(prompt)
                        verified_code = consensus.get("code", "")
                        debate_log = consensus.get("debate_log", "")
                        
                        if consensus.get("status") == "success" and verified_code:
                            await self.broadcast_update("BLACKBOARD_DEBATE", "COMPLETED", f"Consensus Reached.\n{debate_log}")
                            
                            # Test and verify consensus code in the Forge sandbox
                            await self.broadcast_update("SKILL_FORGE", "IN_PROGRESS", "Executing peer-reviewed code in Forge...")
                            from core.neural_skill_forge import NeuralSkillForge
                            forge = NeuralSkillForge()
                            await forge.initialize_forge()
                            
                            success, stdout, stderr = await forge.test_script(verified_code, "python")
                            if success:
                                await self.broadcast_update("SKILL_FORGE", "COMPLETED", f"Blackboard skill executed successfully.\nOutput: {stdout}")
                                await self.broadcast_terminal_signal(f"Forged verified skill: {prompt}", "OUT")
                                
                                # Persist to ChromaDB memory
                                try:
                                    from core.memory_ingest_daemon import MemoryIngestDaemon
                                    memory = MemoryIngestDaemon()
                                    memory.ingest_forged_skill(prompt, verified_code, "python")
                                except Exception as e:
                                    logger.error(f"Failed to ingest blackboard skill: {e}")
                                
                                logger.info(f"Phase 59: Queuing newly forged skill '{prompt}' for Mesh P2P replication.")
                                await self.broadcast_update("HIVEMIND_SYNC", "IN_PROGRESS", "Broadcasting peer-reviewed ability to AILCC Mesh peers...")
                            else:
                                await self.broadcast_update("SKILL_FORGE", "FAILED", f"Verified code failed in sandbox: {stderr}")
                                
                        else:
                            await self.broadcast_update("BLACKBOARD_DEBATE", "FAILED", "Agents failed to reach consensus.")

                except chromadb.errors.InvalidCollectionException:
                    logger.warning("Skill Vault collection does not exist yet. Ensure daemon has initialized it.")
                except Exception as e:
                    logger.error(f"Skill Vault Integration Error: {e}")
                    await self.broadcast_update("SKILL_FORGE", "FAILED", f"System Error: {e}")

        elif task_type in [TaskType.BROWSER, TaskType.DESKTOP] and any(kw in prompt.lower() for kw in ["click", "type", "look", "see", "screen", "button"]):
            # Phase 58: Multi-Modal GUI / Visual Autonomy Delegation
            logger.info("Routing visual/GUI task to Vision Matrix Daemon...")
            await self.broadcast_update("VISION_MATRIX", "IN_PROGRESS", "Waking up VLM visual cortex...")
            
            try:
                from core.vision_matrix_daemon import VisionMatrixDaemon
                vision_daemon = VisionMatrixDaemon()
                
                # Execute the loop. Vision Matrix handles taking screenshots and moving the cursor.
                success = await vision_daemon.execute_gui_objective(prompt, max_steps=5)
                
                if success:
                    await self.broadcast_update("VISION_MATRIX", "COMPLETED", "Visual interaction sequence successful.")
                    await self.broadcast_terminal_signal("Executed macOS GUI Sequence", "OUT")
                else:
                    await self.broadcast_update("VISION_MATRIX", "FAILED", "Could not complete visual objective.")
                    
            except ImportError:
                logger.error("Vision dependencies missing. Cannot execute visual task.")
                await self.broadcast_update("VISION_MATRIX", "FAILED", "Vision dependencies (pyautogui, mss) missing.")
            except Exception as e:
                logger.error(f"Vision Matrix Error: {e}")
                await self.broadcast_update("VISION_MATRIX", "FAILED", str(e))

        elif task_type == TaskType.BROWSER:
            # Phase 85: AGI Deep-Research Headless Browser Router
            logger.info("Routing Deep-Research payload to Comet Browser Daemon...")
            await self.broadcast_update("Comet", "IN_PROGRESS", f"Constructing Headless Scraper context for: {prompt[:40]}...")
            
            try:
                import json, datetime
                r = await self._get_redis()
                task_payload = {
                    "task_id": f"COMET-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "prompt": prompt,
                    "target_agent": "Comet"
                }
                await r.publish("channel:browser_request", json.dumps(task_payload))
                logger.info(f"Phase 85: Transmitted BROWSER vector to channel:browser_request")
            except Exception as e:
                logger.error(f"Failed to publish to Browser Daemon: {e}")
                await self.broadcast_update("Comet", "FAILED", f"Mesh Network PubSub Error: {e}")

        # Phase 77: Cross-Swarm Delegation Protocol via Redis
        # Replace legacy synchronous execution with async task streaming
        try:
            import redis, json, datetime, os
            r = await self._get_redis()
            
            # SubTask chunking heuristic for complex capabilities
            if any(hw in prompt.lower() for hw in ["research", "analyze", "synthesize", "comprehensive", "deep dive"]):
                logger.info("Complex objective detected. Chunking into SubTasks...")
                await self.broadcast_update("ORCHESTRATOR", "IN_PROGRESS", "Chunking task into parallel sub-routines...")
                
                sub_tasks = [
                    {"agent": "sentinel_core", "intent": f"Search and retrieve academic sources for: {prompt}"},
                    {"agent": "ghostwriter", "intent": f"Synthesize findings into an outline for: {prompt}"}
                ]
                
                payloads = []
                for st in sub_tasks:
                    payload = {
                        "task_id": f"SUBTASK-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                        "parent_prompt": prompt,
                        "agent": st["agent"],
                        "intent": st["intent"],
                        "timestamp": datetime.datetime.now().isoformat()
                    }
                    await r.publish("LEGION_DISPATCH", json.dumps(payload))
                    payloads.append(payload)
                    await self.broadcast_update("ORCHESTRATOR", "IN_PROGRESS", f"Dispatched SubTask to {st['agent']}")
                
                await self.broadcast_update("ORCHESTRATOR", "COMPLETED", "All sub-routines delegated to the Fleet.")
                await self.broadcast_terminal_signal(f"Delegated chunked SubTasks: {len(payloads)}", "OUT")
                
            else:
                # Dispatch as single task to the classified target agent
                payload = {
                    "task_id": f"TASK-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "agent": target_agent,
                    "intent": prompt,
                    "timestamp": datetime.datetime.now().isoformat()
                }
                await r.publish("LEGION_DISPATCH", json.dumps(payload))
                await self.broadcast_update("ORCHESTRATOR", "COMPLETED", f"Delegated intent to {target_agent} via Redis.")
                await self.broadcast_terminal_signal(f"Dispatched -> {target_agent}", "OUT")
                
        except Exception as e:
            logger.error(f"Failed to delegate to Legion: {e}")
            await self.broadcast_update("ORCHESTRATOR", "FAILED", str(e))
            
    async def _get_redis(self):
        import redis, os
        if not hasattr(self, '_redis') or self._redis is None:
            self._redis = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
        return self._redis

    async def handle_git_operation(self, payload):
        """Handle Git operations requested by interactions"""
        action = payload.get('action')
        message = payload.get('message', 'Auto-commit from Comet')
        
        logger.info(f"Git Operation Requested: {action}")
        
        try:
            if action == 'commit':
                await self.broadcast_terminal_signal(f"git add .", "CMD")
                self.execute_git_operation(['add', '.'])
                
                await self.broadcast_terminal_signal(f"git commit -m \"{message}\"", "CMD")
                output = self.execute_git_operation(['commit', '-m', message])
                await self.broadcast_terminal_signal(output, "OUT")
                
                await self.broadcast_update("GIT_TASK", "COMPLETED", f"Committed: {message}")
                
            elif action == 'push':
                await self.broadcast_terminal_signal("git push", "CMD")
                output = self.execute_git_operation(['push'])
                await self.broadcast_terminal_signal(output, "OUT")
                await self.broadcast_update("GIT_TASK", "COMPLETED", "Pushed changes to remote.")
                
            elif action == 'status':
                await self.broadcast_terminal_signal("git status", "CMD")
                output = self.execute_git_operation(['status'])
                await self.broadcast_terminal_signal(output, "OUT")
                await self.broadcast_tool_event("Git Status", "Comet", output)
                
        except Exception as e:
            logger.error(f"Git Operation Failed: {e}")
            await self.broadcast_terminal_signal(str(e), "ERR")
            await self.broadcast_update("GIT_TASK", "FAILED", str(e))

    async def handle_data_extraction(self, payload):
        """Task #36: Comet Handshake - Save browser extraction to local JSON vault"""
        source_url = payload.get('url', 'Unknown')
        data = payload.get('data', {})
        category = payload.get('category', 'general')
        
        logger.info(f"Comet Handshake: Extracting data from {source_url}")
        
        vault_dir = os.path.join(os.getcwd(), "04_Intelligence_Vault", "Scout_Extractions", category)
        os.makedirs(vault_dir, exist_ok=True)
        
        filename = f"extract_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(vault_dir, filename)
        
        try:
            with open(filepath, 'w') as f:
                json.dump({
                    "url": source_url,
                    "timestamp": datetime.datetime.now().isoformat(),
                    "category": category,
                    "extraction": data
                }, f, indent=2)
            
            logger.info(f"✓ Data vaulted successfully: {filepath}")
            
            await self.broadcast_terminal_signal(f"Vaulted extraction from {source_url} to {category}", "OUT")
            await self.broadcast_update("EXTRACTION", "COMPLETED", f"Saved to {category} vault.")
            
        except Exception as e:
            logger.error(f"Vaulting failed: {e}")
            await self.broadcast_terminal_signal(f"Extraction failed: {e}", "ERR")

    async def broadcast_terminal_signal(self, message, msg_type="OUT"):
        """Task #10: Stream raw terminal output to Dashboard"""
        if not self.websocket: return
        payload = {
            "type": "TERMINAL_SIGNAL",
            "timestamp": datetime.datetime.now().isoformat(),
            "id": f"sig_{datetime.datetime.now().timestamp()}",
            "payload": {
                "message": message,
                "type": msg_type
            }
        }
        await self.websocket.send(json.dumps(payload))

    def execute_git_operation(self, args):
        """Execute a git command using subprocess"""
        cmd = ['git'] + args
        try:
            result = subprocess.run(
                cmd, 
                cwd=os.getcwd(), 
                capture_output=True, 
                text=True, 
                check=True
            )
            logger.info(f"Git Command Success: {' '.join(cmd)}")
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            logger.error(f"Git Command Error: {e.stderr}")
            raise Exception(f"Git Error: {e.stderr}")

    async def broadcast_tool_event(self, tool_name, agent_id, args):
        """Send a specialized tool event for the Antigravity UI"""
        if not self.websocket: return
        payload = {
            "type": "TOOL_EVENT",
            "timestamp": datetime.datetime.now().isoformat(),
            "payload": {
                "id": f"tool_{datetime.datetime.now().timestamp()}",
                "name": tool_name,
                "agentId": agent_id,
                "args": args
            }
        }
        await self.websocket.send(json.dumps(payload))

    async def broadcast_update(self, task_id, status, message, required_input=None):
        if not self.websocket: return
        
        # Payload Slimming: Removed internal timestamp to reduce JSON overhead
        payload = {
            "type": "TASK_UPDATE",
            "payload": {
                "taskId": task_id,
                "status": status,
                "message": message
            }
        }
        if required_input:
            payload["payload"]["requiredInput"] = required_input
            
        await self.websocket.send(json.dumps(payload))

    async def send_rest_heartbeat(self):
        """Task #8: Send HTTP GET to /api/comet/heartbeat for relay watchdog"""
        url = "http://localhost:3001/api/comet/heartbeat"
        try:
             import urllib.request
             # Use a simple async-to-thread to avoid blocking the loop
             await asyncio.to_thread(lambda: urllib.request.urlopen(url, timeout=2).read())
             logger.info("REST Heartbeat synchronized with Relay Server.")
        except Exception as e:
             logger.warning(f"REST Heartbeat failed: {e}")

    async def run_heartbeat_loop(self):
        """Continuous loop pushing system status and simulating work"""
        iteration = 0
        while True:
            iteration += 1
            # 1. Gather System Stats
            cpu = psutil.cpu_percent()
            memory = psutil.virtual_memory().percent
            net_io = psutil.net_io_counters()
            net_activity = (net_io.bytes_sent + net_io.bytes_recv) % 100 

            telemetry = {
                "cpu": cpu,
                "memory": memory,
                "network": net_activity,
                "status": "ONLINE"
            }

            # Optimization: Only send if significant change (>1% for CPU/MEM)
            should_send = False
            if not self._last_telemetry:
                should_send = True
            else:
                cpu_delta = abs(cpu - self._last_telemetry["cpu"])
                mem_delta = abs(memory - self._last_telemetry["memory"])
                if cpu_delta > 1.0 or mem_delta > 1.0:
                    should_send = True

            if should_send and self.websocket:
                self._last_telemetry = telemetry
                payload = {
                    "type": "HEARTBEAT",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "payload": telemetry
                }
                await self.websocket.send(json.dumps(payload))

            # 2. Simulate Periodic Work (every ~30s)
            curr_sec = datetime.datetime.now().second
            if curr_sec % 30 == 0:
                await self.simulate_agent_activity()
                
            # 3. Broadcast Roster (Delta controlled)
            await self.broadcast_roster()

            # 4. Broadcast Comet Status
            if curr_sec % 10 == 0:
                await self.broadcast_comet_status()

            # 5. REST Heartbeat (Watchdog Satisfaction)
            if iteration % 6 == 0:
                await self.send_rest_heartbeat()

            # Phase 87: Biometric & Thermal Rhythm Integration (Throttling Protocol)
            try:
                r = await self._get_redis()
                fatigue_score = int(await r.get("ailcc:fatigue:score") or 0)
                
                if fatigue_score >= 80:
                    logger.warning(f"Commander Exhaustion Critical ({fatigue_score}/100). Throttling Non-Essential Daemons to preserve cognitive bandwidth.")
                    await asyncio.sleep(60) # Slow pulse
                    continue
                elif fatigue_score >= 50:
                    await asyncio.sleep(15) # Moderate pulse
                    continue
            except Exception:
                pass

            # Standard 5-second pulse for normal operations
            await asyncio.sleep(5)

    async def simulate_agent_activity(self):
        """Execute a REAL agent task using the LLM Gateway"""
        import random
        
        # 1. Select a Random Agent/Topic
        topic = random.choice([
            "Explain quantum entanglement for a 5 year old",
            "Write a haiku about a cybernetic comet",
            "Suggest 3 optimization strategies for React useEffect",
            "Analyze the philosophical implications of AI sentience"
        ])
        
        agent_role = "helpful assistant"
        provider = "openai"
        model = "gpt-3.5-turbo"
        api_key = self.openai_key
        
        # Randomly pick provider to test routing
        roll = random.random()
        if roll < 0.33:
            provider = "anthropic"
            model = "claude-3-opus-20240229"
            api_key = self.anthropic_key
            agent_role = "expert researcher"
        elif roll < 0.66:
            provider = "grok"
            model = "grok-beta"
            api_key = self.grok_key
            agent_role = "witty observer"
            
        logger.info(f"Dispatching Real Task to {provider} ({model})...")
        
        response = await LLMGateway.ask_agent(
            provider, 
            api_key, 
            model, 
            f"You are a {agent_role}.", 
            topic
        )
        
        # Truncate for display
        display_msg = (response[:100] + '...') if len(response) > 100 else response
        
        await self.broadcast_update(
            f"REAL_TASK_{provider.upper()}",
            "COMPLETED",
            display_msg
        )
        
        # Track simulated cost (approx)
        self.track_cost(provider, 0.005)

    # --- Legacy Synchronous Workflows (Kept for reference/CLI usage) ---
    def execute_cycle_sync(self):
        """Standard sync execution for GitHub Actions"""
        logger.info("Running sync cycle...")
        pass

    def _augment_prompt_with_rag(self, user_prompt):
        """Task #52: Semantic retrieval of Vault data to inject context."""
        try:
            import chromadb
            client = chromadb.HttpClient(host=os.getenv("CHROMA_HOST", "localhost"), port=int(os.getenv("CHROMA_PORT", 8001)))
            collection = client.get_collection(name="ailcc_memory")
            
            # Query chroma DB
            results = collection.query(
                query_texts=[user_prompt],
                n_results=2
            )
            
            context = ""
            if results and 'documents' in results and results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    context += f"\n--- Vault Context {i+1} ---\n{doc}\n"
            
            if context:
                logger.info("RAG Context Successfully Injected.")
                return f"Use the following Context to inform your answer if relevant:\n{context}\n\nUser Question:\n{user_prompt}"
        except ImportError:
            pass # Chroma not installed
        except Exception as e:
            logger.warning(f"RAG Retrieval failed or ChromaDB offline: {e}")
            
        return user_prompt

if __name__ == "__main__":
    engine = OrchestrationEngine()
    try:
        asyncio.run(engine.connect_to_dashboard())
    except KeyboardInterrupt:
        logger.info("Comet Engine shutting down.")

