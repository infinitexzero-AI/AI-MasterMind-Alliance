-- AI Mastermind Alliance: Vault Nexus Schema (v1.0)
-- The "Hippocampus" shared data layer.

-- 1. Artifacts: Researched evidence, email extracts, and academic documents.
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- EMAIL_EXTRACT | PDF_SUMMARY | SYLLABUS | CITATION
    source_agent TEXT NOT NULL, -- comet | antigravity | claude | grok
    content TEXT,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

-- 2. Agent Status: Live telemetry and focus for the dashboard.
CREATE TABLE IF NOT EXISTS agent_status (
    agent_name TEXT PRIMARY KEY,
    current_task TEXT,
    last_pulse DATETIME,
    resource_usage JSON,
    status TEXT -- online | processing | idle | error
);

-- 3. Strategic Verdicts: High-level decisions from "The Judge".
CREATE TABLE IF NOT EXISTS strategic_verdicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verdict TEXT NOT NULL,
    rationale TEXT,
    confidence REAL,
    is_authorized BOOLEAN DEFAULT FALSE, -- Human-in-the-loop flag
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Academic Progress: Tracking for the "Dopamine Dash".
CREATE TABLE IF NOT EXISTS academic_progress (
    course_code TEXT PRIMARY KEY,
    milestone_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending | in-progress | complete
    due_date DATE,
    earned_credits REAL DEFAULT 0
);
