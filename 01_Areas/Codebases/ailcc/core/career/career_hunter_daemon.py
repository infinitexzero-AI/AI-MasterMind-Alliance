import os
import sqlite3
import requests
import time
from datetime import datetime

# AILCC Nexus Pathway Resolution
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "memory", "vault_vector_store.db")
RESUME_PATH = os.path.join(os.path.dirname(__file__), "resume_vector_profile.md")
OLLAMA_URL = "http://localhost:11434/api/generate"

def ensure_tables():
    """Initializes the structural SQLite Kanban tables for job tracking."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS career_postings (
            id TEXT PRIMARY KEY,
            title TEXT,
            company TEXT,
            description TEXT,
            status TEXT,
            cover_letter TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def generate_cover_letter(target_role, company, description):
    """Hits the local zero-RAM boundary to mathematically fuse the JD and the Resume Profile."""
    try:
        if not os.path.exists(RESUME_PATH):
            return "SYSTEM ERROR: resume_vector_profile.md not found attached to Career Nexus."
            
        with open(RESUME_PATH, 'r') as f:
            resume_data = f.read()
            
        prompt = f"""
        You are a high-agency Career Synthesizer acting on behalf of the Commander (infinitexzero-AI).
        You must write a devastatingly effective, highly professional, 3-paragraph Cover Letter for the position of {target_role} at {company}.
        
        Job Description:
        {description}
        
        Candidate Identity Constraint:
        {resume_data}
        
        Do not use placeholder brackets like [Your Name]. Use the Commander's name if known, or simply sign off confidently without placeholders.
        Keep formatting clean. Make it aggressive, confident, and heavily leverage the MedTech and Founder baseline. Output ONLY the raw cover letter text. Do not output conversational filler like 'Here is the letter'.
        """
        
        payload = {
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False
        }
        
        print(f"[Cortex Career Nexus] Engaging LLaMA3 for {company} cover letter synthesis...")
        response = requests.post(OLLAMA_URL, json=payload, timeout=90)
        
        if response.status_code == 200:
            return response.json().get('response', '')
        return f"ERROR: Ollama Engine returned {response.status_code}. Is Model loaded?"
        
    except Exception as e:
        return f"CRITICAL FAILURE: {str(e)}"

def inject_bounty(title, company, description, status="DRAFTED"):
    """Used by the Dispatcher UI and autonomous scrapers to force new job postings into the ecosystem."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    job_id = f"JOB_{int(time.time())}"
    
    # Synchronously burn the cover letter via LLaMA3
    letter = generate_cover_letter(title, company, description)
    
    c.execute('''
        INSERT INTO career_postings (id, title, company, description, status, cover_letter)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (job_id, title, company, description, status, letter))
    conn.commit()
    conn.close()
    
    print(f"[Cortex Career Nexus] SUCCESS: Job '{title}' at {company} logged. Bespoke letter drafted.")
    return job_id

if __name__ == "__main__":
    ensure_tables()
    print("[AILCC CAREER NEXUS] Daemon online. Database architecture locked. Initializing synthetic system test...")
    
    # Test Injection simulating a physical external scrape
    inject_bounty(
        "AI Infrastructure Architect", 
        "Vanguard Medical Technologies", 
        "We need a founder-minded engineer to build local LLM pipelines (Next.js, Python, SQLite) to parse clinical telemetry in zero-RAM edge constraints. Must understand healthcare workflows and system architecture."
    )
