from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json
import os
from typing import List, Dict, Any

app = FastAPI(title="AI Mastermind Alliance API", version="0.1.0")

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Secure this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROTOCOL_PATH = os.path.join(BASE_DIR, "00_Projects", "Orchestration_Hub", "protocols")
INSPECTOR_BIN = os.path.join(PROTOCOL_PATH, "protocol_inspector.py")
CLEANUP_BIN = os.path.join(PROTOCOL_PATH, "system_cleanup.sh")

@app.get("/")
def read_root():
    return {"message": "Alliance Prime API Online", "version": "0.1.0"}

@app.get("/health")
def check_storage_health():
    """Run protocol_inspector.py --action check_health"""
    if not os.path.exists(INSPECTOR_BIN):
         raise HTTPException(status_code=500, detail="Inspector tool not found")

    try:
        # We run check_health which returns exit code. 
        # But we actually want the SNAPSHOT data usually, or just a simple status.
        # Let's run snapshot for details but parse it, 
        # OR just rely on check_health exit code for simple verification.
        # The user spec asked for JSON output. Inspector doesn't default JSON yet except via python usage.
        # Let's use the generated JSON from the protocol or parsing via inspector if we add a json flag.
        # For now, let's wrap the python script invocation to return data.
        
        # Actually, let's just run it and capture the output if any, or rely on snapshot which provides markdown.
        # To get structured data, we might need to update inspector or parse the markdown.
        # User prompt implies: "return JSONResponse(content=json.loads(result.stdout))"
        # This assumes inspector outputs JSON. Currently it outputs text/markdown.
        # TODO: Update inspector to support --json flag in Phase 6.
        # For now, return a mock or simple status based on exit code.
        
        result = subprocess.run(
            [INSPECTOR_BIN, "--action", "check_health"],
            capture_output=True,
            text=True
        )
        
        status_map = {0: "GREEN", 1: "YELLOW", 2: "RED"}
        status = status_map.get(result.returncode, "UNKNOWN")
        
        return {
            "status": status,
            "exit_code": result.returncode,
            "raw_output": result.stdout.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/snapshot")
def get_snapshot():
    """Generate storage snapshot (Markdown)"""
    if not os.path.exists(INSPECTOR_BIN):
         raise HTTPException(status_code=500, detail="Inspector tool not found")
         
    result = subprocess.run(
        [INSPECTOR_BIN, "--action", "snapshot"],
        capture_output=True,
        text=True
    )
    return {"snapshot": result.stdout}

@app.post("/cleanup")
def run_cleanup():
    """Trigger system_cleanup.sh (requires approval in production)"""
    if not os.path.exists(CLEANUP_BIN):
        raise HTTPException(status_code=500, detail="Cleanup script not found")
        
    # TODO: Add Auth check here
    result = subprocess.run(
        [CLEANUP_BIN],
        capture_output=True,
        text=True
    )
    return {"output": result.stdout}

@app.get("/artifacts")
def list_artifacts():
    """Return all AllianceArtifact objects from logs/*.jsonl"""
    # Mocking for generic scaffold
    return {"artifacts": []}
