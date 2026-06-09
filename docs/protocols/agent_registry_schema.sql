-- Agent Registry Schema v1.0
-- Location: /Users/infinite27/Antigravity/knowledge.db

CREATE TABLE IF NOT EXISTS agent_registry (
    agent_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'IDLE',
    endpoint TEXT,
    last_seen TIMESTAMP,
    capabilities TEXT -- JSON string of capability tags
);

CREATE TABLE IF NOT EXISTS agent_capabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT,
    capability TEXT,
    confidence_score REAL,
    FOREIGN KEY(agent_id) REFERENCES agent_registry(agent_id)
);

CREATE TABLE IF NOT EXISTS system_telemetry (
    event_id UUID PRIMARY KEY,
    agent_id TEXT,
    event_type TEXT,
    latency_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
