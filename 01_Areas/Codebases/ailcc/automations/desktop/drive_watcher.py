"""
ANTIGRAVITY CORTEX v3.0 - ESCALATION ENGINE
Features: Drive Watcher + API Server + Linear Auto-Escalation
"""

import os
import time
import json
import logging
import datetime
import threading
import requests
import io
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
import google.generativeai as genai
from dotenv import load_dotenv

# Import Navigator (temporarily disabled due to dependency conflicts)
# from navigator import run_navigator

# Add parent directory to sys.path for core imports
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import Agent Registry and Linear Integration
from core.agent_registry import router as agent_router
from core import performance_analytics, task_assignments, chat_history, bulk_operations
from integrations.linear_integration import extract_linear_artifacts

# Load env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# --- CONFIGURATION ---
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_TEAM_ID = os.getenv("LINEAR_TEAM_ID")

FOLDER_MAP = {
    'INBOX': '116Amvq7y36Rxq4JNBR8U5-8n1OAK-LkM',
    'PROCESSED': '13ko1RV0dyCFtcpi7mW4mEiWbdWHGgHtn',
    'FINANCIALS': '14PQXC99eDN96bH0Y4o8WlmSPYPPKrO-7',
    'PROJECTS': '1m7_mSLfMQPxCmNpzY3L8HWylo2sIGCHC',
    'LEGAL': '1HeNtxFZj5jqdeu1tH9UKFikVdQNONffu'
}

DASHBOARD_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../knowledge-dashboard/public/cortex_status.json'))

# --- LOGGING ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- GLOBAL STATE ---
SYSTEM_STATE = {
    "status": "ONLINE",
    "boot_time": datetime.datetime.now().isoformat(),
    "last_active": datetime.datetime.now().isoformat(),
    "latest_action": "System Startup",
    "intel_feed": [],  # Store recent 5 items for dashboard
    "activity_history": [],  # Store last 50 activities for timeline
    "recent_files": [],  # Store recent Drive files
    "stats": {
        "intel_processed": 0,
        "files_analyzed": 0,
        "tasks_created": 0,
        "nav_requests": 0
    }
}

def update_dashboard(action, detail):
    SYSTEM_STATE["last_active"] = datetime.datetime.now().isoformat()
    SYSTEM_STATE["latest_action"] = f"{action}: {detail}"
    
    # Create activity entry with full details
    entry = {
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "timestamp": datetime.datetime.now().isoformat(),
        "action": action,
        "detail": detail
    }
    
    # Keep a running feed of the last 5 actions for intel_feed (backward compat)
    SYSTEM_STATE["intel_feed"].insert(0, entry)
    SYSTEM_STATE["intel_feed"] = SYSTEM_STATE["intel_feed"][:5]
    
    # Store full activity history (last 50)
    SYSTEM_STATE["activity_history"].insert(0, entry)
    SYSTEM_STATE["activity_history"] = SYSTEM_STATE["activity_history"][:50]

    try:
        os.makedirs(os.path.dirname(DASHBOARD_DATA_PATH), exist_ok=True)
        with open(DASHBOARD_DATA_PATH, 'w') as f:
            json.dump(SYSTEM_STATE, f)
    except Exception as e:
        logger.error(f"Dashboard Sync Failed: {e}")

# --- DRIVE LOGIC ---
def authenticate_drive():
    SCOPES = ['https://www.googleapis.com/auth/drive']
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        logger.error(f"Authentication Failed: {e}")
        return None

def analyze_content(file_name, file_content_text):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""
    Analyze this file metadata and content snippet.
    File Name: {file_name}
    Content Snippet: {file_content_text[:2000]}...
    
    Determine the best folder: 'FINANCIALS', 'PROJECTS', 'LEGAL', or 'PROCESSED' (default).
    Also extract a 1-sentence summary.
    
    Output JSON ONLY: {{"folder": "FOLDER_KEY", "summary": "text"}}
    """
    
    try:
        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except Exception as e:
        logger.error(f"Gemini Analysis Failed: {e}")
        return {"folder": "PROCESSED", "summary": "Manual review required"}

def move_file(service, file_id, target_folder_id):
    try:
        file = service.files().get(fileId=file_id, fields='parents').execute()
        previous_parents = ",".join(file.get('parents'))
        service.files().update(
            fileId=file_id,
            addParents=target_folder_id,
            removeParents=previous_parents,
            fields='id, parents'
        ).execute()
        logger.info(f"File {file_id} moved to {target_folder_id}")
    except Exception as e:
        logger.error(f"Move Failed: {e}")

def drive_watcher_loop():
    service = authenticate_drive()
    if not service:
        return

    logger.info("🧠 CORTEX WATCHER (Background) ONLINE...")
    
    while True:
        try:
            query = f"'{FOLDER_MAP['INBOX']}' in parents and trashed = false"
            results = service.files().list(q=query, fields="files(id, name, mimeType)").execute()
            items = results.get('files', [])

            for item in items:
                file_id = item['id']
                name = item['name']
                mime = item['mimeType']
                logger.info(f"Detected: {name} ({mime})")

                decision = analyze_content(name, f"File Type: {mime}")
                target_key = decision.get('folder', 'PROCESSED')
                summary = decision.get('summary', 'No summary')
                
                target_id = FOLDER_MAP.get(target_key, FOLDER_MAP['PROCESSED'])
                
                logger.info(f"Gemini Decision: {target_key} | {summary}")
                move_file(service, file_id, target_id)
                update_dashboard("MOVED", name)
            
            time.sleep(30)

        except Exception as e:
            logger.error(f"Loop Error: {e}")
            time.sleep(60)

# --- LINEAR LOGIC ---
def create_linear_issue(title, description, priority=2):
    """Auto-creates a Linear ticket."""
    if not LINEAR_API_KEY or not LINEAR_TEAM_ID:
        logger.warning("⚠️ Linear credentials missing. Skipping auto-escalation.")
        return None

    query = """
    mutation IssueCreate($title: String!, $description: String!, $teamId: String!, $priority: Int) {
        issueCreate(input: {
            title: $title
            description: $description
            teamId: $teamId
            priority: $priority
        }) {
            success
            issue {
                identifier
                url
            }
        }
    }
    """
    variables = {
        "title": title,
        "description": description,
        "teamId": LINEAR_TEAM_ID,
        "priority": priority
    }

    try:
        response = requests.post(
            "https://api.linear.app/graphql",
            json={"query": query, "variables": variables},
            headers={"Content-Type": "application/json", "Authorization": LINEAR_API_KEY}
        )
        if response.status_code == 200:
            data = response.json()
            if "errors" in data:
                logger.error(f"Linear API Error: {data['errors']}")
                return None
            issue = data["data"]["issueCreate"]["issue"]
            return issue["url"]
    except Exception as e:
        logger.error(f"Linear Connection Failed: {e}")
    return None

# --- API ENDPOINTS ---

class AgentActionRequest(BaseModel):
    templateId: str
    params: dict = {}

@app.post("/api/agent_action")
def agent_action(request: AgentActionRequest):
    """Handle agent action requests using prompt templates.
    Expected payload: {"templateId": "id", "params": {"key": "value"}}
    """
    # Load prompt templates
    try:
        import json, os
        tmpl_path = os.path.join(os.path.dirname(__file__), "..", "ui", "dashboard", "src", "data", "promptTemplates.json")
        with open(tmpl_path, "r") as f:
            templates = json.load(f)
        template = next((t for t in templates if t["id"] == request.templateId), None)
        if not template:
            return {"error": f"Template {request.templateId} not found"}
        # Fill placeholders
        prompt = template["prompt"]
        for key, val in request.params.items():
            placeholder = f"{{{{{key}}}}}"
            prompt = prompt.replace(placeholder, str(val))
        # Generate response via Gemini (fallback to echo)
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            result = response.text
        except Exception as e:
            logger.error(f"Agent action generation failed: {e}")
            result = f"Error generating response: {e}"
        return {"result": result}
    except Exception as e:
        logger.error(f"Agent action endpoint error: {e}")
        return {"error": str(e)}
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch Drive Watcher in Background Thread
    t = threading.Thread(target=drive_watcher_loop, daemon=True)
    t.start()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include agent registry routes
app.include_router(agent_router)

class Command(BaseModel):
    action: str
    target: str
    payload: str

@app.get("/")
def read_root():
    return SYSTEM_STATE

@app.post("/command")
def receive_command(cmd: Command):
    logger.info(f"API Command Received: {cmd.action} -> {cmd.target}")
    update_dashboard("API_CMD", f"{cmd.action} for {cmd.target}")
    return {"status": "received", "data": cmd}

@app.post("/inject/comet")
def receive_comet_intel(data: dict, background_tasks: BackgroundTasks):
    summary = data.get("summary", "No Content")
    source = data.get("source", "Browser")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
    
    logger.info(f"📨 INTEL RECEIVED from {source}")
    update_dashboard("INTEL_IN", summary[:30])

    def process_intel():
        # 1. Analyze with Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""
        Analyze this web intelligence: "{summary}"
        
        1. Summarize the core value.
        2. Is this URGENT or HIGH PRIORITY for an AI startup? (Yes/No)
        3. If Yes, suggest a Task Title.
        
        Output JSON ONLY: {{"summary": "...", "urgent": boolean, "task_title": "..."}}
        """
        
        try:
            response = model.generate_content(prompt)
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            analysis = json.loads(clean_json)
            
            # 2. Save Markdown Note
            filename = f"Intel_{timestamp}_{source}.md"
            content = f"# Intel Source: {source}\n\n{analysis['summary']}\n\nOriginal: {summary}"
            
            # Create metadata
            file_metadata = {
                'name': filename,
                'parents': [FOLDER_MAP['INBOX']]
            }
            
            # Convert string to file-like object
            file_stream = io.BytesIO(content.encode('utf-8'))
            media = MediaIoBaseUpload(file_stream, mimetype='text/markdown', resumable=True)
            
            # Authenticate & Upload
            service = authenticate_drive()
            if service:
                service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                logger.info(f"✅ Research Note Saved: {filename}")
            
            # 3. AUTO-ESCALATION CHECK
            if analysis.get("urgent") is True:
                logger.info("🔥 HIGH PRIORITY DETECTED. Escalating to Linear...")
                ticket_url = create_linear_issue(
                    title=f"⚠️ {analysis['task_title']}", 
                    description=f"Auto-escalated from Cortex.\n\nContext: {analysis['summary']}\nSource: {source}"
                )
                if ticket_url:
                    update_dashboard("ESCALATED", f"Ticket Created: {ticket_url}")
                    SYSTEM_STATE["stats"]["intel_processed"] = SYSTEM_STATE["stats"].get("intel_processed", 0) + 1
                else:
                    update_dashboard("ESCALATION_FAILED", "Check Logs")
            else:
                update_dashboard("FILED", filename)
                SYSTEM_STATE["stats"]["intel_processed"] = SYSTEM_STATE["stats"].get("intel_processed", 0) + 1

                
        except Exception as e:
            logger.error(f"Processing Failed: {e}")
            update_dashboard("ERROR", "Intel Processing Failed")

    background_tasks.add_task(process_intel)
    return {"status": "processing"}

@app.post("/inject/mobile")
def receive_mobile_intel(data: dict, background_tasks: BackgroundTasks):
    """
    Mobile intel injection endpoint for Valentine, Grok iPhone, and other mobile agents
    Accepts intel from Apple Shortcuts, mobile apps, etc.
    """
    summary = data.get("summary", "No Content")
    source = data.get("source", "Mobile Agent")
    agent_id = data.get("agent_id", "unknown")  # e.g., "valentine-mobile-001"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
    
    logger.info(f"📱 MOBILE INTEL RECEIVED from {source} (Agent: {agent_id})")
    update_dashboard("MOBILE_IN", summary[:30])
    
    # Update agent registry if agent_id provided
    if agent_id != "unknown":
        try:
            from core.agent_registry import load_agents, save_agents, update_stats
            registry = load_agents()
            for agent in registry.get('agents', []):
                if agent.get('id') == agent_id:
                    agent['last_active'] = datetime.datetime.now().isoformat()
                    agent['status'] = 'active'
                    agent['session_data']['intel_contributed'] = agent['session_data'].get('intel_contributed', 0) + 1
                    update_stats(registry)
                    save_agents(registry)
                    logger.info(f"✅ Updated agent {agent_id} in registry")
                    break
        except Exception as e:
            logger.warning(f"Could not update agent registry: {e}")
    
    # Process intel same as comet
    def process_intel():
        # 1. Analyze with Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""
        Analyze this mobile intelligence: "{summary}"
        
        1. Summarize the core value.
        2. Is this URGENT or HIGH PRIORITY for an AI startup? (Yes/No)
        3. If Yes, suggest a Task Title.
        
        Output JSON ONLY: {{"summary": "...", "urgent": boolean, "task_title": "..."}}
        """
        
        try:
            response = model.generate_content(prompt)
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            analysis = json.loads(clean_json)
            
            # 2. Save Markdown Note
            filename = f"Mobile_Intel_{timestamp}_{source}.md"
            content = f"# Mobile Intel Source: {source}\n\n{analysis['summary']}\n\nOriginal: {summary}\n\nAgent ID: {agent_id}"
            
            # Create metadata
            file_metadata = {
                'name': filename,
                'parents': [FOLDER_MAP['INBOX']]
            }
            
            # Convert string to file-like object
            file_stream = io.BytesIO(content.encode('utf-8'))
            media = MediaIoBaseUpload(file_stream, mimetype='text/markdown', resumable=True)
            
            # Authenticate & Upload
            service = authenticate_drive()
            if service:
                service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                logger.info(f"✅ Mobile Research Note Saved: {filename}")
            
            # 3. AUTO-ESCALATION CHECK
            if analysis.get("urgent") is True:
                logger.info("🔥 HIGH PRIORITY MOBILE INTEL. Escalating to Linear...")
                ticket_url = create_linear_issue(
                    title=f"⚠️ {analysis['task_title']}", 
                    description=f"Auto-escalated from Mobile Agent ({source}).\n\nContext: {analysis['summary']}\nAgent: {agent_id}"
                )
                if ticket_url:
                    update_dashboard("ESCALATED", f"Mobile Ticket: {ticket_url}")
                    SYSTEM_STATE["stats"]["intel_processed"] = SYSTEM_STATE["stats"].get("intel_processed", 0) + 1
                else:
                    update_dashboard("ESCALATION_FAILED", "Check Logs")
            else:
                update_dashboard("FILED", filename)
                SYSTEM_STATE["stats"]["intel_processed"] = SYSTEM_STATE["stats"].get("intel_processed", 0) + 1

                
        except Exception as e:
            logger.error(f"Mobile Intel Processing Failed: {e}")
            update_dashboard("ERROR", "Mobile Intel Processing Failed")

    background_tasks.add_task(process_intel)
    return {"status": "processing", "source": source, "agent_id": agent_id}

@app.get("/api/analytics")
def get_analytics():
    """
    Returns system analytics and metrics
    """
    return {
        "system_status": SYSTEM_STATE["status"],
        "uptime_seconds": (datetime.datetime.now() - datetime.datetime.fromisoformat(SYSTEM_STATE.get("boot_time", datetime.datetime.now().isoformat()))).total_seconds() if "boot_time" in SYSTEM_STATE else 0,
        "total_activities": len(SYSTEM_STATE.get("activity_history", [])),
        "intel_processed": SYSTEM_STATE.get("stats", {}).get("intel_processed", 0),
        "files_analyzed": SYSTEM_STATE.get("stats", {}).get("files_analyzed", 0),
        "tasks_created": SYSTEM_STATE.get("stats", {}).get("tasks_created", 0),
        "nav_requests": SYSTEM_STATE.get("stats", {}).get("nav_requests", 0)
    }

@app.get("/api/activity/recent")
def get_recent_activity(limit: int = 20):
    """
    Returns recent activity history
    """
    activity_history = SYSTEM_STATE.get("activity_history", [])
    return {"activities": activity_history[:limit]}

@app.post("/api/chat")
async def agent_chat(data: dict):
    """
    Agent chat endpoint - respond to user messages
    """
    message = data.get("message", "")
    logger.info(f"💬 Chat Message: {message}")
    
    # Simple responses for now - can enhance with Gemini later
    response_text = f"Received: {message}. Currently processing via Cortex agents."
    
    if "status" in message.lower():
        response_text = f"System Status: {SYSTEM_STATE['status']}. Last activity: {SYSTEM_STATE.get('latest_action', 'None')}"
    elif "help" in message.lower():
        response_text = "Available commands: Check status, process files, navigate web, create tasks. Send me any request!"
    
    update_dashboard("CHAT", message[:30])
    
    return {
        "response": response_text,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/files/recent")
def get_recent_files(limit: int = 10):
    """
    Returns recently monitored files from Drive
    """
    # This would query Drive API - for now return mock data
    recent_files = SYSTEM_STATE.get("recent_files", [])
    return {"files": recent_files[:limit]}

@app.post("/navigate")
async def trigger_navigator(cmd: Command, background_tasks: BackgroundTasks):
    """
    Triggers the browser agent to perform a task.
    Payload example: "Go to amazon.com and find the price of iPhone 15"
    """
    logger.info(f"🧭 NAVIGATOR REQUEST: {cmd.payload}")
    update_dashboard("NAVIGATING", cmd.payload[:30])
    
    # Increment nav counter
    if "stats" not in SYSTEM_STATE:
        SYSTEM_STATE["stats"] = {}
    SYSTEM_STATE["stats"]["nav_requests"] = SYSTEM_STATE["stats"].get("nav_requests", 0) + 1
    
    async def run_browser_task():
        try:
            result = await run_navigator(cmd.payload)
            update_dashboard("NAV_COMPLETE", str(result)[:30])
            logger.info(f"✅ Navigation Result: {result}")
        except Exception as e:
            logger.error(f"Navigation Failed: {e}")
            update_dashboard("NAV_FAILED", str(e))

    background_tasks.add_task(run_browser_task)
    return {"status": "navigator_started", "task": cmd.payload}

@app.get("/api/linear/extract")
def extract_linear_data():
    """
    Extract all data from Linear AI Mastermind Alliance project
    Returns projects, issues, milestones, and recent activity
    """
    try:
        artifacts = extract_linear_artifacts()
        return {
            "status": "success",
            "data": artifacts,
            "summary": {
                "projects": len(artifacts.get('projects', [])),
                "issues": len(artifacts.get('issues', [])),
                "recent_activity": len(artifacts.get('recent_activity', []))
            }
        }
    except Exception as e:
        logger.error(f"Linear extraction failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/linear/issues/create")
def create_linear_task(data: dict):
    """
    Create a new Linear issue from dashboard
    Expected payload:
    {
        "title": str,
        "description": str,
        "priority": int (0-4),
        "teamId": str (optional),
        "projectId": str (optional),
        "assigneeId": str (optional),
        "labelIds": list (optional)
    }
    """
    try:
        from integrations.linear_integration import create_linear_issue
        
        result = create_linear_issue(
            title=data.get("title"),
            description=data.get("description", ""),
            team_id=data.get("teamId"),
            priority=data.get("priority", 2),
            project_id=data.get("projectId"),
            assignee_id=data.get("assigneeId"),
            label_ids=data.get("labelIds")
        )
        
        if result and 'data' in result:
            issue_data = result['data']['issueCreate']
            if issue_data['success']:
                issue = issue_data['issue']
                update_dashboard("TASK_CREATED", f"{issue['identifier']}: {issue['title']}")
                SYSTEM_STATE["stats"]["tasks_created"] = SYSTEM_STATE["stats"].get("tasks_created", 0) + 1
                return {
                    "status": "success",
                    "issue": issue
                }
        
        return {
            "status": "error",
            "message": "Failed to create issue"
        }
    except Exception as e:
        logger.error(f"Linear task creation failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/linear/teams")
def get_linear_teams():
    """Get all accessible Linear teams"""
    try:
        from integrations.linear_integration import get_all_teams
        result = get_all_teams()
        
        if result and 'data' in result:
            teams = result['data']['teams']['nodes']
            return {
                "status": "success",
                "teams": teams
            }
        return {
            "status": "error",
            "message": "Failed to fetch teams"
        }
    except Exception as e:
        logger.error(f"Failed to get teams: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/linear/labels")
def get_linear_labels(team_id: str = None):
    """Get labels for a team"""
    try:
        from integrations.linear_integration import get_team_labels
        result = get_team_labels(team_id)
        
        if result and 'data' in result:
            labels = result['data']['team']['labels']['nodes']
            return {
                "status": "success",
                "labels": labels
            }
        return {
            "status": "error",
            "message": "Failed to fetch labels"
        }
    except Exception as e:
        logger.error(f"Failed to get labels: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/linear/users")
def get_linear_users(team_id: str = None):
    """Get team members for assignment"""
    try:
        from integrations.linear_integration import get_team_members
        result = get_team_members(team_id)
        
        if result and 'data' in result:
            members = result['data']['team']['members']['nodes']
            # Filter to active members only
            active_members = [m for m in members if m.get('active', True)]
            return {
                "status": "success",
                "users": active_members
            }
        return {
            "status": "error",
            "message": "Failed to fetch users"
        }
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/linear/projects")
def get_linear_projects(team_id: str = None):
    """Get projects for a team"""
    try:
        from integrations.linear_integration import get_team_projects_list
        result = get_team_projects_list(team_id)
        
        if result and 'data' in result:
            projects = result['data']['team']['projects']['nodes']
            return {
                "status": "success",
                "projects": projects
            }
        return {
            "status": "error",
            "message": "Failed to fetch projects"
        }
    except Exception as e:
        logger.error(f"Failed to get projects: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/analytics/agent/{agent_id}")
def get_agent_analytics_endpoint(agent_id: str, days: int = 7):
    """Get performance analytics for a specific agent"""
    try:
        analytics = performance_analytics.get_agent_analytics(agent_id, days)
        return {
            "status": "success",
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"Failed to get agent analytics: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/analytics/all")
def get_all_analytics_endpoint(days: int = 7):
    """Get performance analytics for all agents"""
    try:
        analytics = performance_analytics.get_all_analytics(days)
        return {
            "status": "success",
            **analytics
        }
    except Exception as e:
        logger.error(f"Failed to get all analytics: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/analytics/trends")
def get_performance_trends_endpoint(agent_id: str = None, days: int = 7):
    """Get performance trends over time"""
    try:
        trends = performance_analytics.get_performance_trends(agent_id, days)
        return {
            "status": "success",
            "trends": trends
        }
    except Exception as e:
        logger.error(f"Failed to get trends: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/analytics/record")
def record_task_completion_endpoint(data: dict):
    """
    Record a task completion for analytics
    Expected: {
        "agent_id": str,
        "task_type": str,
        "duration_ms": float,
        "success": bool (optional, default True)
    }
    """
    try:
        agent_data = performance_analytics.record_task_completion(
            agent_id=data.get("agent_id"),
            task_type=data.get("task_type"),
            duration_ms=data.get("duration_ms"),
            success=data.get("success", True)
        )
        return {
            "status": "success",
            "agent_data": agent_data
        }
    except Exception as e:
        logger.error(f"Failed to record task: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/assignments/assign")
def assign_task_endpoint(data: dict):
    """
    Assign a Linear task to an agent
    Expected: {
        "task_id": str,
        "task_title": str,
        "agent_id": str,
        "task_url": str (optional),
        "priority": int (optional, 0-4)
    }
    """
    try:
        assignment = task_assignments.assign_task(
            task_id=data.get("task_id"),
            task_title=data.get("task_title"),
            agent_id=data.get("agent_id"),
            task_url=data.get("task_url"),
            priority=data.get("priority", 2)
        )
        return {
            "status": "success",
            "assignment": assignment
        }
    except Exception as e:
        logger.error(f"Failed to assign task: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/assignments/update")
def update_assignment_status_endpoint(data: dict):
    """
    Update task assignment status
    Expected: {
        "task_id": str,
        "status": str ('assigned', 'in_progress', 'completed', 'blocked'),
        "notes": str (optional)
    }
    """
    try:
        assignment = task_assignments.update_task_status(
            task_id=data.get("task_id"),
            status=data.get("status"),
            notes=data.get("notes")
        )
        if assignment:
            return {
                "status": "success",
                "assignment": assignment
            }
        return {
            "status": "error",
            "message": "Assignment not found"
        }
    except Exception as e:
        logger.error(f"Failed to update assignment: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/assignments/agent/{agent_id}")
def get_agent_assignments_endpoint(agent_id: str, include_completed: bool = False):
    """Get all task assignments for an agent"""
    try:
        assignments = task_assignments.get_agent_assignments(agent_id, include_completed)
        return {
            "status": "success",
            "agent_id": agent_id,
            "assignments": assignments,
            "count": len(assignments)
        }
    except Exception as e:
        logger.error(f"Failed to get agent assignments: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/assignments/all")
def get_all_assignments_endpoint(status: str = None):
    """Get all task assignments, optionally filtered by status"""
    try:
        assignments = task_assignments.get_all_assignments(status)
        return {
            "status": "success",
            "assignments": assignments,
            "count": len(assignments)
        }
    except Exception as e:
        logger.error(f"Failed to get assignments: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/assignments/workload")
def get_workload_summary_endpoint(agent_id: str = None):
    """Get workload summary for one or all agents"""
    try:
        workload = task_assignments.get_agent_workload_summary(agent_id)
        return {
            "status": "success",
            **workload
        }
    except Exception as e:
        logger.error(f"Failed to get workload: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.delete("/api/assignments/unassign/{task_id}")
def unassign_task_endpoint(task_id: str):
    """Remove task assignment"""
    try:
        success = task_assignments.unassign_task(task_id)
        if success:
            return {
                "status": "success",
                "message": f"Task {task_id} unassigned"
            }
        return {
            "status": "error",
            "message": "Assignment not found"
        }
    except Exception as e:
        logger.error(f"Failed to unassign task: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/chat/save")
def save_chat_message_endpoint(data: dict):
    """
    Save a chat message to history
    Expected: {
        "agent_id": str,
        "message": str,
        "role": str ('user', 'assistant', 'system'),
        "metadata": dict (optional)
    }
    """
    try:
        message = chat_history.save_message(
            agent_id=data.get("agent_id"),
            message=data.get("message"),
            role=data.get("role", "user"),
            metadata=data.get("metadata")
        )
        return {
            "status": "success",
            "message": message
        }
    except Exception as e:
        logger.error(f"Failed to save chat message: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/chat/agent/{agent_id}")
def get_agent_chat_endpoint(agent_id: str, limit: int = 100, offset: int = 0):
    """Get chat history for a specific agent"""
    try:
        messages = chat_history.get_agent_chat_history(agent_id, limit, offset)
        return {
            "status": "success",
            "agent_id": agent_id,
            "messages": messages,
            "count": len(messages)
        }
    except Exception as e:
        logger.error(f"Failed to get agent chat: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/chat/all")
def get_all_chat_endpoint(limit: int = 100, offset: int = 0, agent_id: str = None):
    """Get all chat history, optionally filtered by agent"""
    try:
        result = chat_history.get_all_chat_history(limit, offset, agent_id)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/chat/search")
def search_chat_endpoint(query: str, agent_id: str = None, limit: int = 50):
    """Search chat history by message content"""
    try:
        results = chat_history.search_chat_history(query, agent_id, limit)
        return {
            "status": "success",
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Failed to search chat: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/chat/stats")
def get_chat_stats_endpoint():
    """Get overall chat statistics"""
    try:
        stats = chat_history.get_chat_stats()
        return {
            "status": "success",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Failed to get chat stats: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/chat/export")
def export_chat_endpoint(agent_id: str = None, format: str = "json"):
    """Export chat history in various formats"""
    try:
        export_data = chat_history.export_chat_history(agent_id, format)
        
        # Set appropriate content type
        content_types = {
            "json": "application/json",
            "txt": "text/plain",
            "csv": "text/csv"
        }
        
        from fastapi.responses import Response
        return Response(
            content=export_data,
            media_type=content_types.get(format, "text/plain"),
            headers={
                "Content-Disposition": f"attachment; filename=chat_history.{format}"
            }
        )
    except Exception as e:
        logger.error(f"Failed to export chat: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.delete("/api/chat/agent/{agent_id}")
def delete_agent_chat_endpoint(agent_id: str):
    """Delete all chat history for an agent"""
    try:
        deleted = chat_history.delete_agent_history(agent_id)
        return {
            "status": "success",
            "deleted": deleted,
            "message": f"Deleted {deleted} messages for agent {agent_id}"
        }
    except Exception as e:
        logger.error(f"Failed to delete chat: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/bulk/ping")
def bulk_ping_endpoint(data: dict):
    """
    Ping multiple agents at once
    Expected: {
        "agent_ids": [str, str, ...]
    }
    """
    try:
        results = bulk_operations.bulk_ping_agents(data.get("agent_ids", []))
        return {
            "status": "success",
            **results
        }
    except Exception as e:
        logger.error(f"Bulk ping failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/bulk/update-status")
def bulk_update_status_endpoint(data: dict):
    """
    Update status for multiple agents
    Expected: {
        "agent_ids": [str, ...],
        "status": str
    }
    """
    try:
        results = bulk_operations.bulk_update_status(
            data.get("agent_ids", []),
            data.get("status")
        )
        return {
            "status": "success",
            **results
        }
    except Exception as e:
        logger.error(f"Bulk update failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/bulk/reset-errors")
def bulk_reset_errors_endpoint(data: dict):
    """
    Reset error counts for multiple agents
    Expected: {
        "agent_ids": [str, ...]
    }
    """
    try:
        results = bulk_operations.bulk_reset_errors(data.get("agent_ids", []))
        return {
            "status": "success",
            **results
        }
    except Exception as e:
        logger.error(f"Bulk reset failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
