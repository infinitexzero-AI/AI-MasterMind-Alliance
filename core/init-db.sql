-- Initial schema for AILCC Mastermind Alliance
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'normal',
    agent_id UUID REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    agent_id UUID REFERENCES agents(id),
    level TEXT DEFAULT 'info',
    message TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial agents
INSERT INTO agents (id, name, status) VALUES 
('493f2f88-46cc-4611-a871-337346808744', 'chatgpt-proxy', 'active'),
('5a6b7c8d-9e0f-4a1b-bc2d-3e4f5a6b7c8d', 'claude-proxy', 'active'),
('6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'perplexity-proxy', 'active')
ON CONFLICT (id) DO NOTHING;
