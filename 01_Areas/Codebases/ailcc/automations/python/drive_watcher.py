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

# Import Agent Registry and Linear Integration
from agent_registry import router as agent_router
from linear_integration import extract_linear_artifacts

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
            from agent_registry import load_agents, save_agents, update_stats
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

# --- ADHD WORKFLOW ENDPOINTS ---

@app.post("/api/adhd/email/process")
async def process_academic_email(data: dict, background_tasks: BackgroundTasks):
    """
    Process academic email detected by adhd_email_processor
    Creates ADHD-optimized task breakdown and schedules reminders
    """
    logger.info(f"📧 Academic task received: {data.get('subject', 'Unknown')}")
    
    task_type = data.get('task_type', 'assignment')
    priority = data.get('priority', 'MEDIUM')
    course_code = data.get('course_code', 'Unknown')
    due_date = data.get('due_date')
    subject = data.get('subject', 'Academic Task')
    
    update_dashboard("ADHD_EMAIL", f"{priority}: {subject[:30]}")
    
    def create_task_breakdown():
        try:
            # Import task engine
            import sys
            sys.path.append(os.path.join(os.path.dirname(__file__), '../core'))
            from adhd_task_engine import TaskBreakdownEngine
            
            # Generate breakdown
            engine = TaskBreakdownEngine(perplexity_api_key=os.getenv("PERPLEXITY_API_KEY"))
            breakdown = engine.generate_breakdown(
                task=subject,
                task_type=task_type,
                due_date=due_date
            )
            
            logger.info(f"✅ Created {breakdown.total_subtasks} subtasks for: {subject}")
            
            # Save to Drive
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
            filename = f"Task_{course_code}_{timestamp}.json"
            content = json.dumps(breakdown.to_dict(), indent=2)
            
            file_metadata = {
                'name': filename,
                'parents': [FOLDER_MAP['PROJECTS']]
            }
            
            file_stream = io.BytesIO(content.encode('utf-8'))
            media = MediaIoBaseUpload(file_stream, mimetype='application/json', resumable=True)
            
            service = authenticate_drive()
            if service:
                service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                logger.info(f"📝 Task breakdown saved: {filename}")
            
            # Update stats
            SYSTEM_STATE["stats"]["tasks_created"] = SYSTEM_STATE["stats"].get("tasks_created", 0) + 1
            update_dashboard("TASK_CREATED", f"{breakdown.total_subtasks} subtasks | {breakdown.total_estimated_hours}h")
            
        except Exception as e:
            logger.error(f"Task breakdown failed: {e}")
            update_dashboard("TASK_ERROR", str(e))
    
    background_tasks.add_task(create_task_breakdown)
    return {
        "status": "processing",
        "task_type": task_type,
        "priority": priority,
        "course": course_code
    }

@app.post("/api/adhd/tasks/breakdown")
def generate_task_breakdown(data: dict):
    """
    Generate ADHD-optimized task breakdown on demand
    Request: {"task": "...", "task_type": "...", "due_date": "..."}
    """
    task = data.get("task", "")
    task_type = data.get("task_type", "assignment")
    due_date = data.get("due_date")
    
    if not task:
        return {"error": "Task description required"}
    
    try:
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), '../core'))
        from adhd_task_engine import TaskBreakdownEngine
        
        engine = TaskBreakdownEngine(perplexity_api_key=os.getenv("PERPLEXITY_API_KEY"))
        breakdown = engine.generate_breakdown(task, task_type, due_date)
        
        logger.info(f"✅ Generated breakdown: {breakdown.total_subtasks} subtasks")
        
        return {
            "status": "success",
            "breakdown": breakdown.to_dict()
        }
    except Exception as e:
        logger.error(f"Breakdown generation failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/adhd/tasks/recent")
def get_recent_adhd_tasks(limit: int = 10):
    """
    Get recently created ADHD tasks
    """
    # Query Drive for recent task files
    service = authenticate_drive()
    if not service:
        return {"tasks": []}
    
    try:
        query = f"'{FOLDER_MAP['PROJECTS']}' in parents and name contains 'Task_' and trashed = false"
        results = service.files().list(
            q=query, 
            orderBy='createdTime desc',
            pageSize=limit,
            fields="files(id, name, createdTime, webViewLink)"
        ).execute()
        
        tasks = results.get('files', [])
        return {"tasks": tasks}
    except Exception as e:
        logger.error(f"Could not fetch tasks: {e}")
        return {"tasks": []}

@app.post("/api/adhd/calendar/sync")
def sync_to_calendar(data: dict):
    """
    Sync task breakdown to Apple Calendar (placeholder for macOS automation)
    """
    breakdown_data = data.get("breakdown")
    course_code = data.get("course_code", "Unknown")
    
    logger.info(f"📅 Calendar sync requested for: {course_code}")
    
    # This would trigger AppleScript/Shortcuts automation
    # For now, just log the request
    update_dashboard("CALENDAR_SYNC", f"{course_code} tasks scheduled")
    
    return {
        "status": "queued",
        "message": "Calendar sync will be handled by macOS automation"
    }

@app.post("/api/adhd/focus/trigger")
def trigger_focus_mode(data: dict):
    """
    Trigger macOS Focus Mode change
    """
    mode = data.get("mode", "Deep Work")
    duration_minutes = data.get("duration", 60)
    
    logger.info(f"🔔 Focus Mode requested: {mode} for {duration_minutes} min")
    
    # This would trigger AppleScript to change Focus Mode
    # For now, just log
    update_dashboard("FOCUS_MODE", f"{mode} ({duration_minutes}m)")
    
    return {
        "status": "triggered",
        "mode": mode,
        "duration": duration_minutes
    }

# --- RESEARCH INTEGRATION ENDPOINTS ---

@app.post("/api/research/synthesize")
def research_synthesis(data: dict):
    """
    Perform deep literature synthesis using Perplexity
    Request: {"topic": "...", "depth": "detailed"}
    """
    topic = data.get("topic")
    depth = data.get("depth", "detailed")
    
    if not topic:
        return {"error": "Topic required"}
        
    logger.info(f"🔬 Research Request: {topic} ({depth})")
    update_dashboard("RESEARCH", f"Synthesizing: {topic[:20]}...")

    try:
        # Import dynamically to avoid circular dependencies
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), '../integrations'))
        from perplexity_client import PerplexityResearchClient
        
        client = PerplexityResearchClient()
        result = client.deep_research(topic, depth=depth)
        
        if "error" in result:
             raise Exception(result["error"])
             
        # Save to Drive
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"Research_{topic[:30].replace(' ', '_')}_{timestamp}.md"
        content = client.format_as_markdown(result)
        
        # Save file logic (reusing Drive auth)
        file_metadata = {'name': filename, 'parents': [FOLDER_MAP['PROJECTS']]}
        file_stream = io.BytesIO(content.encode('utf-8'))
        media = MediaIoBaseUpload(file_stream, mimetype='text/markdown', resumable=True)
        
        service = authenticate_drive()
        if service:
            service.files().create(body=file_metadata, media_body=media, fields='id').execute()
            logger.info(f"✅ Research saved: {filename}")
            
        update_dashboard("RESEARCH_DONE", filename)
        return {"status": "success", "file": filename, "data": result}
        
    except Exception as e:
        logger.error(f"Research failed: {e}")
        update_dashboard("RESEARCH_FAIL", str(e))
        return {"status": "error", "message": str(e)}

@app.post("/api/research/analyze")
def research_analysis(data: dict):
    """
    Perform complex analysis using SuperGrok
    Request: {"context": "...", "question": "..."}
    """
    context = data.get("context", "")
    question = data.get("question", "")
    
    if not question:
        return {"error": "Question required"}
        
    logger.info(f"🧠 Analysis Request: {question[:30]}...")
    update_dashboard("ANALYSIS", "Thinking...")
    
    try:
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), '../integrations'))
        from supergrok_integration import SuperGrokClient
        
        client = SuperGrokClient()
        result = client.think_mode_analysis(context, question)
        
        update_dashboard("ANALYSIS_DONE", "Grok response received")
        return {"status": "success", "analysis": result}
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return {"status": "error", "message": str(e)}


    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return {"status": "error", "message": str(e)}

# --- NOTION INTEGRATION ENDPOINTS ---

@app.post("/api/notion/assignment")
def create_notion_assignment(data: dict):
    """
    Create an assignment in Notion database
    Request: {"title": "...", "course": "...", "due_date": "YYYY-MM-DD"}
    """
    title = data.get("title")
    course = data.get("course")
    due_date = data.get("due_date")
    
    if not title or not course:
        return {"error": "Title and Course required"}
        
    try:
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), '../integrations'))
        from notion_academic import NotionAcademicManager
        
        manager = NotionAcademicManager()
        url = manager.create_assignment(title, course, due_date)
        
        if url:
             update_dashboard("NOTION", f"Created: {title}")
             return {"status": "success", "url": url}
        else:
             return {"status": "error", "message": "Failed to create page"}
             
    except Exception as e:
        logger.error(f"Notion creation failed: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
