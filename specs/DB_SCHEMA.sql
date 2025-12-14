-- AllianceArtifact Database Schema (v1.0)
-- Compatible with SQLite and PostgreSQL
-- Purpose: Persist and track all Alliance work across agents.

-- 1. Artifacts Table (Core)
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,                       -- e.g., "PRIME-dashboard-UI_SNAPSHOT-v1.0"
    project TEXT NOT NULL,                     -- "PRIME", "VALENTINE", "SCHOLAR", "TEK"
    scope TEXT,                                -- "dashboard", "ios", "research"
    type TEXT NOT NULL,                        -- "DOCUMENT", "CODE", "WORKFLOW", "MEDIA", "LOG"
    source_platform TEXT,                      -- "Antigravity", "Claude", "n8n", "Comet"
    status TEXT NOT NULL,                      -- "IDEA", "IN_PROGRESS", "REVIEW", "PROD", "ARCHIVED"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version TEXT NOT NULL DEFAULT "1.0",
    
    -- Metadata stored as JSON strings for SQLite compatibility (or JSONB in Postgres)
    agents TEXT,                               -- JSON Array: ["Antigravity", "Comet"]
    links TEXT,                                -- JSON Object: {"linear": "LIN-123", "msg": "MSG-456"}
    tags TEXT,                                 -- JSON Array: ["infrastructure", "critical"]
    notes TEXT
);

-- 2. Artifact Files (Many-to-One)
-- Tracks actual files on disk linked to the abstract artifact record
CREATE TABLE IF NOT EXISTS artifact_files (
    id TEXT PRIMARY KEY,
    artifact_id TEXT NOT NULL,
    file_path TEXT NOT NULL,                   -- Absolute path on local system
    file_type TEXT,                            -- mime type or extension
    size_bytes INTEGER,
    checksum TEXT,                             -- SHA256
    FOREIGN KEY(artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE
);

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project);
CREATE INDEX IF NOT EXISTS idx_artifacts_status ON artifacts(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_platform ON artifacts(source_platform);
CREATE INDEX IF NOT EXISTS idx_files_artifact ON artifact_files(artifact_id);

-- 4. Initial Seed Data (Example)
INSERT INTO artifacts (id, project, scope, type, source_platform, status, version, agents, tags)
VALUES 
    ('PRIME-spec-dashboard-v1.0', 'PRIME', 'dashboard', 'DOCUMENT', 'Antigravity', 'REVIEW', '1.0', '["Antigravity", "Claude"]', '["architecture", "spec"]'),
    ('PRIME-code-health-widget-v1.0', 'PRIME', 'dashboard', 'CODE', 'Antigravity', 'PROD', '1.0', '["Antigravity"]', '["ui", "react"]');
