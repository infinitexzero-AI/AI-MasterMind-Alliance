#!/usr/bin/env python3
"""
Grok-Antigravity Synapse Bridge
================================
Maintains multi-device state, dynamic context awareness, and session archiving
for the Terminal Grok Agent across your MacBook and ThinkPad devices.

Enhancements:
  - Cross-device context continuity (ingests the latest synced session transcript)
  - Git dirty tree & sync status warnings
  - Optional telemetry via `--no-telemetry`
"""

import os
import sys
import json
import socket
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

# Force UTF-8 output encoding on Windows to support emojis in console print statements
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ──────────────────────────────────────────────────────────────────────────────
# 1. Device Hostname Detection & Path Mapping
# ──────────────────────────────────────────────────────────────────────────────

HOSTNAME = socket.gethostname().lower()
IS_MAC = sys.platform == "darwin" or "macbook" in HOSTNAME

# Base paths (Uses cross-platform Path.home() as standard root)
HOME_DIR = Path.home()
AILCC_ROOT = HOME_DIR / "AILCC_PRIME"

# Resolve directories depending on device node context
if IS_MAC:
    NODE_NAME = "MacBook-Control-Plane"
    CLOUD_SYNC_DIR = HOME_DIR / "Library/Mobile Documents/com~apple~CloudDocs/AILCC_Nexus"
    ACADEMIC_DATA_PATH = AILCC_ROOT / "06_System" / "State" / "scholar_data.json"
    OBSIDIAN_VAULT = HOME_DIR / "Library/CloudStorage/OneDrive-MountAllisonUniversity/_ACTIVE_2026_Summer/Obsidian_Academic_Vault"
else:
    NODE_NAME = "ThinkPad-Primary-Compute"
    CLOUD_SYNC_DIR = HOME_DIR / "OneDrive" / "AILCC_Nexus"
    ACADEMIC_DATA_PATH = AILCC_ROOT / "06_System" / "State" / "scholar_data.json"
    
    # Resolve ThinkPad Obsidian vault path via OneDrive
    mta_vault = HOME_DIR / "OneDrive - Mount Allison University" / "_ACTIVE_2026_Summer" / "Obsidian_Academic_Vault"
    generic_vault = HOME_DIR / "OneDrive" / "_ACTIVE_2026_Summer" / "Obsidian_Academic_Vault"
    if mta_vault.exists():
        OBSIDIAN_VAULT = mta_vault
    elif generic_vault.exists():
        OBSIDIAN_VAULT = generic_vault
    else:
        OBSIDIAN_VAULT = AILCC_ROOT / "04_Intelligence_Vault" / "Obsidian_Vault"

# Git repository session storage path (synced via git push/pull)
GIT_SESSION_DIR = AILCC_ROOT / "docs" / "05_Tasks" / "Grok_Sessions"
LOCAL_STATE_FILE = AILCC_ROOT / "06_System" / "State" / "storagemind_status.json"

# ──────────────────────────────────────────────────────────────────────────────
# 2. Dynamic Context Harvesting
# ──────────────────────────────────────────────────────────────────────────────

def get_storage_context():
    """Reads system state from StorageMind's status json."""
    if LOCAL_STATE_FILE.exists():
        try:
            state = json.loads(LOCAL_STATE_FILE.read_text())
            ssd = state.get("ssd", {})
            return (
                f"- Status: {ssd.get('status', 'unknown').upper()}\n"
                f"- SSD Free Space: {ssd.get('free_gb', 'unknown')} GB / {ssd.get('total_gb', 'unknown')} GB total"
            )
        except Exception:
            pass
    
    # Fallback if state file missing/unreadable
    try:
        total, used, free = shutil.disk_usage("/")
        free_gb = free / (1024 ** 3)
        total_gb = total / (1024 ** 3)
        return f"- SSD Free Space: {free_gb:.2f} GB / {total_gb:.1f} GB total"
    except Exception:
        return "- SSD Free Space: Unknown"

def get_academic_context():
    """Gathers active course workloads and upcoming deadlines."""
    if ACADEMIC_DATA_PATH.exists():
        try:
            data = json.loads(ACADEMIC_DATA_PATH.read_text())
            lines = []
            
            # Support 06_System/State/scholar_data.json schema
            progress = data.get("degree_progress", {})
            if progress:
                lines.append(f"Degree: {progress.get('degree')} | GPA: {progress.get('current_gpa')} (Probation Cleared) | Credits: {progress.get('credits_completed')}/120")
            
            courses = data.get("courses", [])
            if isinstance(courses, list):
                lines.append("Active Load (Fall 2026):")
                for course in courses:
                    lines.append(f"  * {course.get('code')} ({course.get('name')})")
            elif isinstance(courses, dict):
                # Support legacy academic_data.json schema
                lines.append("Active Load:")
                grades = data.get("grades", {})
                for code, details in courses.items():
                    status = "Dropped/Paused" if details.get("paused") else "Active"
                    if status == "Active":
                        grade = grades.get(code, {}).get("current", "N/A")
                        lines.append(f"  * {code} ({details.get('name')}) | Grade: {grade}")
            
            deadlines = data.get("upcoming_deadlines", [])
            if deadlines:
                lines.append("Impending Deadlines:")
                for item in deadlines[:3]: # Keep top 3
                    lines.append(f"  * [{item.get('date')}] {item.get('course')}: {item.get('task')}")
            return "\n".join(lines)
        except Exception:
            pass
            
    return (
        "Active Load: None (Summer 2026 completed successfully. Passed CLAS 2501 with A, BIOL 3991 with A, PSYC 3141 with B. Term GPA: 3.667).\n"
        "Registered for Fall 2026: COMP 1631, PSYC 4101. (BIOL 2701 biostats is NOT registered; this is a gap to resolve during degree audit).\n"
        "Registered for Winter 2027: BIOL 2201 + Lab, BIOL 3041, BIOL 3221, BIOL 3631.\n"
        "Total Credits Earned: 129. Cumulative GPA: 2.0 (Cleared academic probation)."
    )

def get_obsidian_tasks():
    """Reads course task lists directly from Obsidian Vault READMEs."""
    lines = []
    if OBSIDIAN_VAULT.exists():
        courses_dir = OBSIDIAN_VAULT / "40 Courses"
        if courses_dir.exists():
            for course_folder in courses_dir.iterdir():
                if course_folder.is_dir():
                    readme = course_folder / "README.md"
                    if readme.exists():
                        try:
                            content = readme.read_text().splitlines()
                            todo_items = [line.strip() for line in content if line.strip().startswith("- [ ]")][:2]
                            if todo_items:
                                lines.append(f"  * {course_folder.name}:")
                                for item in todo_items:
                                    lines.append(f"    {item}")
                        except Exception:
                            pass
    if lines:
        return "Obsidian Course Deliverables:\n" + "\n".join(lines)
    return "Obsidian Course Deliverables: None detected or vault offline."

def get_swarm_registry():
    """Reads active agents roles in the Vanguard swarm."""
    registry_file = AILCC_ROOT / "agents" / "registry.json"
    if registry_file.exists():
        try:
            data = json.loads(registry_file.read_text())
            lines = []
            for agent in data.get("agents", []):
                if agent.get("status") == "active":
                    lines.append(f"  * {agent.get('name')} ({agent.get('role')})")
            return "Active Vanguard Swarm Swarm:\n" + "\n".join(lines)
        except Exception:
            pass
    return "Active Swarm: Antigravity (Codebase), Grok (Strategy), Valentine (Task Router)"

def get_active_academic_materials():
    """Scans OneDrive Academic active course directories and extracts high-signal course reading/lecture context."""
    if not IS_MAC:
        return ""
        
    active_dir = HOME_DIR / "Library/CloudStorage/OneDrive-MountAllisonUniversity/_ACTIVE_2026_Summer"
    if not active_dir.exists():
        return ""
        
    lines = []
    lines.append("\n## 📖 Active Course Lecture & Reading Materials (Week 4 Focus)")
    materials_found = False
    
    # Safe import pdf_to_md
    sys.path.append(str(AILCC_ROOT / "scripts"))
    try:
        from pdf_to_md import extract_pdf
    except ImportError:
        extract_pdf = None
        
    try:
        for course_folder in active_dir.iterdir():
            if course_folder.is_dir() and course_folder.name != "Obsidian_Academic_Vault":
                course_code = course_folder.name.split("_")[0]
                lines.append(f"\n### Course: {course_code}")
                
                # Check for readings and lectures subdirs
                subdirs = ["02_Readings_Papers", "03_Lectures_Slides"]
                for subdir_name in subdirs:
                    subdir_path = course_folder / subdir_name
                    if subdir_path.exists() and subdir_path.is_dir():
                        for file_path in subdir_path.iterdir():
                            if file_path.is_file():
                                ext = file_path.suffix.lower()
                                
                                # Silent PDF text-extraction trigger
                                if ext == ".pdf" and extract_pdf:
                                    md_equiv = file_path.with_suffix(".md")
                                    if not md_equiv.exists():
                                        try:
                                            print(f"📄 [Antigravity Ingestion] Converting PDF to clean Markdown: {file_path.name}...")
                                            extract_pdf(str(file_path))
                                        except Exception as e:
                                            print(f"⚠️ PDF extraction failed on {file_path.name}: {e}")
                                
                                # Read converted MD or TXT summaries
                                if ext in (".md", ".txt"):
                                    try:
                                        content = file_path.read_text().splitlines()
                                        summary = "\n".join(content[:60]) # First 60 lines for overview
                                        if len(content) > 60:
                                            summary += "\n... (truncated for token economy)"
                                        
                                        lines.append(f"\n* **File: {file_path.name} (Abstract / Excerpt)**:")
                                        lines.append("```markdown")
                                        lines.append(summary)
                                        lines.append("```")
                                        materials_found = True
                                    except Exception as e:
                                        pass
    except Exception as e:
        print(f"⚠️ Safe academic materials scan failed: {e}")
        
    if materials_found:
        return "\n".join(lines)
    return ""

# ──────────────────────────────────────────────────────────────────────────────
# 3. Cross-Device Continuity (Last Synced Session Ingestion)
# ──────────────────────────────────────────────────────────────────────────────

def get_last_session_context():
    """Finds the most recent archived Grok session transcript and extracts its context."""
    if not GIT_SESSION_DIR.exists():
        return ""
    
    try:
        session_files = sorted(
            [f for f in GIT_SESSION_DIR.glob("grok_session_*.md")],
            key=lambda x: x.name,
            reverse=True
        )
        if not session_files:
            return ""
        
        latest_file = session_files[0]
        # Load last 40 lines of the transcript to feed context to the new session
        content = latest_file.read_text().splitlines()
        summary_lines = content[-45:] if len(content) > 45 else content
        
        # Parse basic session details from filename
        parts = latest_file.stem.split("_")
        origin_date = parts[2] if len(parts) > 2 else "Unknown Date"
        
        return (
            f"\n## 🔗 LAST SESSION SYNCED CONTEXT (Cross-Device Continuity)\n"
            f"Archived file: {latest_file.name}\n"
            f"Below is a preview of the end of the previous session. Resynchronize your mind state with this context:\n"
            f"```markdown\n"
            + "\n".join(summary_lines) +
            f"\n```\n"
        )
    except Exception as e:
        return f"\n## 🔗 Last Session Continuity: Synapse read failed ({e})\n"

# ──────────────────────────────────────────────────────────────────────────────
# 4. Git Synchronization Status Audits
# ──────────────────────────────────────────────────────────────────────────────

def check_git_status():
    """Checks git tree health to prevent sync conflicts."""
    print("🔍 [Antigravity Synapse] Checking repository sync status...")
    try:
        # Check if local branch is behind remote
        subprocess.run(["git", "fetch"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5, cwd=str(AILCC_ROOT))
        status_res = subprocess.run(["git", "status", "-uno"], capture_output=True, text=True, check=True, cwd=str(AILCC_ROOT))
        
        if "your branch is behind" in status_res.stdout.lower():
            print("⚠️  [CONFLICT WARNING] Your local branch is behind the remote repository.")
            print("   Please run `git pull` before starting a new session to avoid transcript conflicts!")
            
            # Simple prompt option
            if sys.stdin.isatty():
                ans = input("   Would you like to run `git pull --rebase` now? (y/N): ").strip().lower()
                if ans == 'y':
                    subprocess.run(["git", "pull", "--rebase"], cwd=str(AILCC_ROOT))
                    print("✅ Pulled remote successfully.")
        
        # Check if dirty
        diff_res = subprocess.run(["git", "diff", "--name-only"], capture_output=True, text=True, check=True, cwd=str(AILCC_ROOT))
        if diff_res.stdout.strip():
            print("⚠️  [DIRTY STATE] You have uncommitted changes in the workspace.")
            print("   Transcripts will still be saved, but resolve working tree dirty states promptly.")
            
    except Exception as e:
        print(f"⚪ Git sync check skipped or failed: {e}")

# ──────────────────────────────────────────────────────────────────────────────
# 5. Rules Synthesis
# ──────────────────────────────────────────────────────────────────────────────

def compile_grok_rules(enable_telemetry=True):
    """Assembles all harvested context into a Markdown system instruction block."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if not enable_telemetry:
        return f"""
# ⚡️ ANTIGRAVITY SYSTEM CONTEXT
=======================================
[Compiled on: {timestamp} | Node: {NODE_NAME}]
- Host: {socket.gethostname()}
- Note: Telemetry explicitly disabled by --no-telemetry flag.

## 🎯 Directives for Grok Terminal Agent
1. You are the **Strategy & Strategy Swarm Lead** operating as a collaborative client within the Antigravity ecosystem.
2. Keep answers concise, actionable, and aligned with AILCC standards.
=======================================
"""
    
    storage_info = get_storage_context()
    academic_info = get_academic_context()
    obsidian_info = get_obsidian_tasks()
    swarm_info = get_swarm_registry()
    last_session_info = get_last_session_context()
    academic_materials = get_active_academic_materials()
    
    rules = f"""
# ⚡️ ANTIGRAVITY DYNAMIC SYSTEM CONTEXT
=======================================
[Compiled on: {timestamp} | Node: {NODE_NAME}]

## Device Topology
- Local Machine Node: {socket.gethostname()}
{storage_info}

## Swarm Synergy
{swarm_info}

## Current Life Context & Tasks
- Move belongings to Sackville, NB for Fall 2026 (housing search pending)

## Course Workload Context (Summer 2026)
{academic_info}
{obsidian_info}
{last_session_info}
{academic_materials}

## 🎯 Directives for Grok Terminal Agent
1. You are the **Strategy & Strategy Swarm Lead** operating as a collaborative client within the Antigravity ecosystem.
2. Maintain high-level strategic reasoning, academic drafting, and planning efficiency.
3. Front-load buffers for Joel's impending move-out. Keep answers concise, actionable, and aligned with AILCC standards.
4. All work session logs will be archived and synced across Joel's devices (ThinkPad ↔ MacBook) via the Antigravity Git and iCloud layer.
=======================================
"""
    return rules

# ──────────────────────────────────────────────────────────────────────────────
# 6. Session Export & Multi-Device Synapse Sync
# ──────────────────────────────────────────────────────────────────────────────

def archive_and_sync():
    """Exports the latest session transcript and copies it to synced folders."""
    print("\n💾 [Antigravity Synapse] Archiving session and running multi-device sync...")
    
    grok_bin = HOME_DIR / ".grok" / "bin" / "grok"
    if not grok_bin.exists():
        grok_bin = Path("grok")

    sessions = []
    try:
        res = subprocess.run([str(grok_bin), "sessions", "list"],
                             capture_output=True, text=True, check=True)
        lines = res.stdout.splitlines()
        session_ids = []
        for line in lines:
            words = line.split()
            for w in words:
                if len(w) == 36 and w.count("-") == 4:
                    session_ids.append(w)
        if session_ids:
            sessions = [{"id": session_ids[0]}]
    except Exception as e:
        print(f"⚠️  Failed to query session list: {e}")

    if not sessions:
        print("⚠️  No active Grok sessions found to archive.")
        return

    latest_session_id = sessions[0].get("id") if isinstance(sessions, list) else sessions
    print(f"📊 Detected Session ID: {latest_session_id}")

    GIT_SESSION_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"grok_session_{timestamp}_{latest_session_id[:8]}.md"
    git_filepath = GIT_SESSION_DIR / filename

    print(f"📤 Exporting transcript to: {git_filepath.name}...")
    try:
        export_res = subprocess.run([str(grok_bin), "export", str(latest_session_id)],
                                    capture_output=True, text=True, check=True)
        git_filepath.write_text(export_res.stdout)
        print("✅ Transcript successfully archived in AILCC_PRIME codebase.")
    except Exception as e:
        print(f"❌ Failed to export Grok session: {e}")
        return

    # iCloud Mirror Sync (Hot Copy)
    if CLOUD_SYNC_DIR.exists() or IS_MAC:
        try:
            cloud_session_dir = CLOUD_SYNC_DIR / "Grok_Sessions"
            cloud_session_dir.mkdir(parents=True, exist_ok=True)
            cloud_filepath = cloud_session_dir / filename
            shutil.copy2(git_filepath, cloud_filepath)
            print(f"☁️  [iCloud] Sync success: Synced mirrored copy to {cloud_filepath.name}")
        except Exception as e:
            print(f"⚠️  [iCloud] Sync failed: {e}")
    else:
        print(f"⚪ Cloud Mirror skipped (Cloud sync path not detected on this machine).")

    print("💡 Session updated successfully. Run `git commit -m 'grok: sync session'` to publish cluster-wide!")

# ──────────────────────────────────────────────────────────────────────────────
# 7. Core Execution
# ──────────────────────────────────────────────────────────────────────────────

def main():
    dry_run = "--dry-run" in sys.argv
    no_telemetry = "--no-telemetry" in sys.argv
    
    # Filter custom flags out before passing remaining args to grok binary
    grok_args = [arg for arg in sys.argv[1:] if arg not in ("--dry-run", "--no-telemetry")]
    
    # Run active git fetches and sync checks
    if not dry_run:
        check_git_status()
        
    # Compile rules containing dynamic context
    rules_text = compile_grok_rules(enable_telemetry=(not no_telemetry))
    
    if dry_run:
        print("=" * 60)
        print("🔍 ANTIGRAVITY DYNAMIC RULES PREVIEW (DRY RUN)")
        print("=" * 60)
        print(rules_text)
        print("=" * 60)
        sys.exit(0)
        
    # Use agent binary for headless single-turn prompts to prevent TTY hangs, otherwise use grok TUI
    is_headless = "-p" in sys.argv or "--single" in sys.argv
    binary_name = "agent" if is_headless else "grok"
    grok_bin = HOME_DIR / ".grok" / "bin" / binary_name
    if not grok_bin.exists():
        grok_bin = Path(binary_name)

    # Prepare execution arguments
    cmd = [str(grok_bin)] + grok_args
    cmd += ["--rules", rules_text]
    
    print(f"🚀 Initializing Antigravity-aware Grok Node [{NODE_NAME}]...")
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        pass
    finally:
        archive_and_sync()

if __name__ == "__main__":
    main()
