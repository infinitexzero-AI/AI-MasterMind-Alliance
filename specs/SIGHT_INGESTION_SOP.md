# SOP: Sight-Ingestion & Academic Vision Protocol

**Version:** 1.0  
**Domain:** Scholar / Infrastructure  
**Owner:** Antigravity (Local Context)  

## 1. Overview
"Sight-Ingestion" is the capability of the AILCC Vanguard to ingest academic context directly from a user's screen using high-efficiency multimodal analysis. This protocol bypasses the need for manual file uploads by "watching" course portals and transcribing visible syllabi, rubrics, and assessment tables.

## 2. Infrastructure Requirements
- **Vision Daemon:** `scripts/screenshot_stream_daemon.py`
- **Cortex Proxy:** FastAPI backend (`/api/v1/vision/analyze`)
- **Neural Synapse:** Redis (`localhost:6379`)
- **Knowledge Object:** `research_summary.md`

## 3. Configuration & Optimization
The system uses **Frame-Diffing** and **Image Hashing** to save Gemini API quota.

- **Threshold (`DIFF_THRESHOLD`):** Default is **5.0%**. 
  - Increase to 10% if the environment is highly dynamic (e.g., constant status bar updates).
  - Decrease to 2% if capturing fine-grained text changes in static documents.
- **Caching:** Results are hashed (MD5) and cached in Redis for 7 days.

## 4. Onboarding a New Course (Step-by-Step)

### Step 1: Initialize Category
1. Open `scripts/screenshot_stream_daemon.py`.
2. Add the new Course ID (e.g., `MATH-2101`) to the `process_image` prompt instructions.
3. Ensure `02_Resources/Academics/[Course-ID]` directory exists or will be created by the daemon.

### Step 2: Activate Vision Stream
1. Ensure the FastAPI backend is running:
   ```bash
   cd 01_Areas/Codebases/ailcc/dashboard/server/api && python main.py
   ```
2. Start the Daemon:
   ```bash
   python scripts/screenshot_stream_daemon.py
   ```

### Step 3: Portal Navigation
1. Open the university portal (Moodle/Nexus).
2. Navigate slowly through:
   - **Syllabus / Course Outline**
   - **Assessment/Grade Weighting Table**
   - **Schedule of Deliverables**
3. The system will "chirp" (log) when it detects a visual change > 5% and transcribe the markdown directly into the academic database.

### Step 4: Knowledge Synthesis
1. Once ingestion is complete, review `research_summary.md`.
2. Trigger the "Synthesis Audit" to generate study guides:
   ```bash
   # Via Dashboard or CLI Relay
   curl -X POST http://localhost:3000/api/scholar/audit
   ```

## 5. Troubleshooting
- **429 Errors:** Check if the Dashboard shows a "Quota Exhausted" alert. Wait for the cooldown period (60s default).
- **No Ingestion:** Ensure screenshots are hitting `C:/Users/infin/Desktop/Screenshots`.
- **Duplicate Skips:** If you need to re-analyze a page that was skipped, clear the Redis cache for that image hash or slightly modify the window position to trigger a >5% change.
