import express from 'express';
import OpenAI from 'openai';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const xai = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Enable CORS for Dashboard (Port 3000)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for local dev
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Helper: Neural Memory (RAG)
async function getMemoryContext(query) {
    try {
        console.log(`[MEMORY] Querying Vault for: "${query.substring(0, 50)}..."`);
        const response = await fetch('http://hippocampus-api:8000/memory/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, n_results: 3 })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.results && data.results.length > 0) {
                const context = data.results.map(r => `[RECALLED INTEL]: ${r.content}`).join('\n---\n');
                console.log(`[MEMORY] Retrieved ${data.results.length} relevant fragments.`);
                return context;
            }
        }
    } catch (error) {
        console.error('[MEMORY ERROR]: Failed to reach Hippocampus API.', error.message);
    }
    return 'No relevant project history found.';
}

// Helper: Tool Discovery (MCP)
async function getSwarmTools() {
    try {
        const response = await fetch('http://hippocampus-api:8000/swarm/tools/discover');
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.tools) {
                return data.tools.map(t => `- ${t.name} (${t.type}): ${t.description}`).join('\n');
            }
        }
    } catch (error) {
        console.error('[TOOL ERROR]: Failed to discover swarm tools.', error.message);
    }
    return 'No tools discovered.';
}

// Helper: Swarm Blackboard (Intents)
async function getSwarmIntents() {
    try {
        const response = await fetch('http://hippocampus-api:8000/swarm/intent/active');
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.intent) {
                return `LATEST SWARM INTENT: ${JSON.stringify(data.intent.data)}`;
            }
        }
    } catch (error) {
        console.error('[BLACKBOARD ERROR]: Failed to fetch swarm intents.', error.message);
    }
    return 'Swarm silence.';
}

// Helper: Multi-Provider Strategic Execution
async function executeStrategicCall(messages, options = {}) {
    const providers = [
        { name: 'OpenAI', client: openai, model: options.model || 'gpt-4o' },
        { name: 'xAI', client: xai, model: 'grok-4.20-experimental-beta-0304-reasoning' }
    ];

    let lastError = null;

    for (const provider of providers) {
        try {
            if (!provider.client.apiKey && provider.name !== 'OpenAI') continue;
            
            console.log(`[ORCHESTRATOR] Attempting strategic call via ${provider.name} (${provider.model})...`);
            
            const completion = await provider.client.chat.completions.create({
                model: provider.model,
                messages,
                ...options
            });

            return {
                provider: provider.name,
                model: provider.model,
                content: completion.choices[0].message.content
            };
        } catch (error) {
            lastError = error;
            console.error(`[ORCHESTRATOR ERROR] ${provider.name} failed:`, error.message);
            
            // Only failover if it's a quota or server error (429, 5xx)
            if (!error.message.includes('429') && !error.message.includes('500') && !error.message.includes('quota')) {
                break; 
            }
            console.warn(`[ORCHESTRATOR] Failing over to next provider...`);
        }
    }

    throw new Error(`All providers failed. Last error: ${lastError.message}`);
}

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', agent: 'chatgpt-proxy' });
});

app.get('/health/system', async (req, res) => {
    try {
        const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';
        const queues = {
            'task-queue': { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }
        };

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                core: {
                    status: 'up',
                    uptime: process.uptime(),
                    version: '1.5.0',
                    agents_active: 1
                },
                redis: { status: redisStatus },
                queues
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Relays for Blackboard
app.post('/broadcast', async (req, res) => {
    try {
        const response = await fetch('http://hippocampus-api:8000/swarm/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/execute', async (req, res) => {
    const taskId = uuidv4();
    try {
        const { prompt, context: providedContext, image } = req.body;

        // Step 1: Parallel Intel Gathering
        const [recalledContext, tools, activeIntents] = await Promise.all([
            getMemoryContext(prompt),
            getSwarmTools(),
            getSwarmIntents()
        ]);

        const systemContent = `You are ChatGPT, the master strategist in the AI Mastermind Alliance. 
        You have access to the Unified Semantic Memory and the Swarm Blackboard.
        
        AVAILABLE TOOLS (MCP):
        ${tools}
        
        RECALLED INTELLIGENCE:
        ${recalledContext}
        
        SWARM PULSE:
        ${activeIntents}
        
        Strategy: Use this awareness to provide precise, tool-aware advice. 
        If an image is provided, analyze it as the current visual state of the Nexus Dashboard.`;

        // Step 2: High-Risk Detection (Strategic Consensus Gate)
        const isHighRisk = (p) => {
            const riskyKeywords = ['rm ', 'purge', 'delete', 'reset', 'pkill', 'format', 'overwrite'];
            return riskyKeywords.some(k => p.toLowerCase().includes(k));
        };

        const messages = [
            { role: 'system', content: systemContent },
            ...(providedContext ? [{ role: 'system', content: `Provided Web Context: ${providedContext}` }] : [])
        ];

        // Step 3: Handle Multi-Modal Input
        if (image) {
            console.log(`[VISION] Analyzing provided image context (Base64).`);
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }
                ]
            });
        } else {
            messages.push({ role: 'user', content: prompt });
        }

        // Step 4: Generate Response with Multi-Provider Failover
        const { content: rawResponse, provider, model } = await executeStrategicCall(messages);
        let responseText = rawResponse;

        // Step 5: Strategic Consensus (Vanguard Swarm Audit)
        if (isHighRisk(prompt)) {
            console.log(`[VANGUARD] High-risk command detected. Triggering Swarm Consensus...`);
            
            // Broadcast to Security & Architect agents via Blackboard
            await redis.publish('swarm:blackboard', JSON.stringify({
                channel: 'security',
                message: { intent: 'CONSENSUS_REQUIRED', command: prompt, raw_response: responseText },
                sender: 'valentine-core'
            }));

            // Parallel Audit from specialized agents
            const { content: auditVerdict } = await executeStrategicCall([
                { role: 'system', content: 'You are the Grok Lead Architect. Review the proposed executive command for structural safety.' },
                { role: 'user', content: `PROPOSED ACTION: ${responseText}` }
            ]);
            
            responseText = `🛡️ [VANGUARD CONSENSUS AUDIT]: ${auditVerdict}\n\n---\n\n${responseText}`;
        }

        res.json({ 
            taskId, 
            status: 'success', 
            response: responseText,
            provider,
            model,
            contextRecalled: recalledContext !== 'No relevant project history found.',
            toolsAware: tools !== 'No tools discovered.'
        });

        // Auto-Distill: Feed successful executions into Knowledge Distillation Pipeline
        distillToKnowledge(prompt, responseText, provider).catch(err => 
            console.error('[AUTO-DISTILL ERROR]:', err.message)
        );

    } catch (error) {
        console.error('[EXECUTION ERROR]:', error.message);
        res.status(500).json({ taskId, status: 'error', message: error.message });
    }
});

// --- Neural Memory (RAG) Propagation ---
async function indexToRAG(id, content, metadata) {
    try {
        console.log(`[RAG] Indexing ${id}...`);
        await fetch('http://hippocampus-api:8000/memory/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, content, metadata })
        });
        return true;
    } catch (err) {
        console.error(`[RAG ERROR] ${id}:`, err.message);
        return false;
    }
}

async function distillToKnowledge(prompt, response, provider) {
    const kiId = `ki_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    try {
        const distillResult = await executeStrategicCall([
            { role: 'system', content: `You are a Knowledge Distiller. Extract a structured Knowledge Item from the following agent interaction. 
Return ONLY valid JSON with these fields:
- "title": short descriptive title (max 10 words)
- "summary": 2-3 sentence summary of the key insight
- "tags": array of 3-5 relevant tags
- "relationships": array of related concepts/systems mentioned
- "actionable": boolean, whether this contains actionable next steps
Do NOT include any markdown formatting or code fences. Return raw JSON only.` },
            { role: 'user', content: `PROMPT: ${prompt}\n\nRESPONSE: ${response.substring(0, 2000)}` }
        ]);

        let ki;
        try {
            ki = JSON.parse(distillResult.content);
        } catch {
            console.warn('[DISTILL] Could not parse LLM output as JSON, storing raw.');
            ki = { title: prompt.substring(0, 50), summary: response.substring(0, 200), tags: ['auto-distilled'], relationships: [], actionable: false };
        }

        const kiRecord = {
            id: kiId,
            ...ki,
            source_prompt: prompt.substring(0, 200),
            provider,
            distilled_at: new Date().toISOString()
        };

        // Propagate to RAG Pipeline (Closing the Neural Loop)
        await indexToRAG(kiId, `${ki.title}: ${ki.summary}\nTags: ${ki.tags.join(', ')}\nRelationships: ${ki.relationships.join(', ')}`, {
            source: 'distillation',
            agent: 'valentine-core',
            actionable: ki.actionable,
            ki_id: kiId
        });

        await redis.set(`ki:${kiId}`, JSON.stringify(kiRecord));
        await redis.lpush('ki:index', kiId);
        await redis.ltrim('ki:index', 0, 499); // Keep last 500 KIs

        console.log(`[DISTILL] ✅ Knowledge Item created: ${kiId} — "${ki.title}"`);
        return kiRecord;
    } catch (error) {
        console.error(`[DISTILL ERROR]: ${error.message}`);
        // Store raw even if LLM fails
        const fallbackKI = {
            id: kiId,
            title: prompt.substring(0, 50),
            summary: response.substring(0, 200),
            tags: ['raw-capture'],
            relationships: [],
            actionable: false,
            source_prompt: prompt.substring(0, 200),
            provider: provider || 'unknown',
            distilled_at: new Date().toISOString()
        };

        // Propagate even raw capture to RAG for accessibility
        await indexToRAG(kiId, `${fallbackKI.title}: ${fallbackKI.summary}`, {
            source: 'distillation-fallback',
            agent: 'valentine-core',
            ki_id: kiId
        });

        await redis.set(`ki:${kiId}`, JSON.stringify(fallbackKI));
        await redis.lpush('ki:index', kiId);
        return fallbackKI;
    }
}

// Manual Distillation Endpoint
app.post('/distill', async (req, res) => {
    try {
        const { text, source } = req.body;
        if (!text) return res.status(400).json({ status: 'error', message: 'Text is required.' });

        const ki = await distillToKnowledge(source || 'manual-input', text, 'manual');
        res.json({ status: 'success', ki });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Knowledge Item Retrieval
app.get('/knowledge', async (req, res) => {
    try {
        const kiIds = await redis.lrange('ki:index', 0, 49);
        const kis = await Promise.all(
            kiIds.map(async (id) => {
                const raw = await redis.get(`ki:${id}`);
                return raw ? JSON.parse(raw) : null;
            })
        );
        res.json({ status: 'success', count: kis.filter(Boolean).length, items: kis.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Knowledge Relationship Map (Mermaid)
app.get('/knowledge/map', async (req, res) => {
    try {
        const kiIds = await redis.lrange('ki:index', 0, 49);
        const kis = await Promise.all(
            kiIds.map(async (id) => {
                const raw = await redis.get(`ki:${id}`);
                return raw ? JSON.parse(raw) : null;
            })
        );
        
        const validKIs = kis.filter(Boolean);
        let mermaid = 'graph TD\n';
        
        validKIs.forEach((ki, i) => {
            const nodeId = `KI${i}`;
            const label = (ki.title || 'Untitled').replace(/"/g, "'");
            mermaid += `    ${nodeId}["${label}"]\n`;
            
            if (ki.relationships && ki.relationships.length > 0) {
                ki.relationships.forEach(rel => {
                    const relNode = rel.replace(/[^a-zA-Z0-9]/g, '_');
                    mermaid += `    ${nodeId} --> ${relNode}["${rel}"]\n`;
                });
            }
        });

        res.json({ status: 'success', format: 'mermaid', diagram: mermaid, count: validKIs.length });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── PHASE 11B: SOVEREIGN LOGIC BRIDGE (Self-Coding Sandbox) ────────────────

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SANDBOX_DIR = '/tmp/sovereign_sandbox';
const SCRIPTS_DIR = '/app/generated_scripts';

// Ensure sandbox directory exists
try { fs.mkdirSync(SANDBOX_DIR, { recursive: true }); } catch {}
try { fs.mkdirSync(SCRIPTS_DIR, { recursive: true }); } catch {}

// Generate a utility script from a problem description
app.post('/forge', async (req, res) => {
    const forgeId = `forge_${Date.now()}`;
    try {
        const { problem, language } = req.body;
        if (!problem) return res.status(400).json({ status: 'error', message: 'Problem description required.' });

        const lang = language || 'python';
        const ext = lang === 'python' ? '.py' : '.js';

        console.log(`[FORGE] 🔨 Generating ${lang} script for: "${problem.substring(0, 60)}..."`);

        // Step 1: Generate the script via LLM
        const result = await executeStrategicCall([
            { role: 'system', content: `You are a script forge. Write a clean, self-contained ${lang} utility script that solves the given problem.
Requirements:
- Include a docstring explaining what it does
- Include error handling
- Make it runnable standalone (include if __name__ == "__main__" for Python, or main() for JS)
- Return ONLY the code, no markdown fences or explanations` },
            { role: 'user', content: problem }
        ]);

        const scriptContent = result.content
            .replace(/^```\w*\n?/gm, '')
            .replace(/```$/gm, '')
            .trim();

        // Step 2: Write to sandbox
        const sandboxPath = path.join(SANDBOX_DIR, `${forgeId}${ext}`);
        fs.writeFileSync(sandboxPath, scriptContent);

        // Step 3: Syntax check (non-destructive)
        let syntaxOk = false;
        let syntaxError = null;
        try {
            if (lang === 'python') {
                execSync(`python3 -c "import ast; ast.parse(open('${sandboxPath}').read())"`, { timeout: 5000 });
            } else {
                execSync(`node --check ${sandboxPath}`, { timeout: 5000 });
            }
            syntaxOk = true;
        } catch (err) {
            syntaxError = err.stderr ? err.stderr.toString().substring(0, 500) : err.message;
        }

        // Step 4: Store metadata in Redis
        const forgeRecord = {
            id: forgeId,
            problem: problem.substring(0, 300),
            language: lang,
            sandbox_path: sandboxPath,
            syntax_valid: syntaxOk,
            syntax_error: syntaxError,
            promoted: false,
            provider: result.provider,
            forged_at: new Date().toISOString()
        };

        await redis.set(`forge:${forgeId}`, JSON.stringify(forgeRecord));
        await redis.lpush('forge:index', forgeId);
        await redis.ltrim('forge:index', 0, 99);

        console.log(`[FORGE] ${syntaxOk ? '✅' : '⚠️'} Script ${forgeId}${ext} created (syntax: ${syntaxOk ? 'VALID' : 'ERROR'})`);

        res.json({
            status: 'success',
            forge: forgeRecord,
            preview: scriptContent.substring(0, 500)
        });
    } catch (error) {
        console.error('[FORGE ERROR]:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Promote a forged script to the permanent library
app.post('/forge/promote', async (req, res) => {
    try {
        const { forgeId, filename } = req.body;
        if (!forgeId) return res.status(400).json({ status: 'error', message: 'forgeId required.' });

        const raw = await redis.get(`forge:${forgeId}`);
        if (!raw) return res.status(404).json({ status: 'error', message: 'Forge not found.' });

        const forge = JSON.parse(raw);
        if (!forge.syntax_valid) return res.status(400).json({ status: 'error', message: 'Cannot promote script with syntax errors.' });

        const ext = forge.language === 'python' ? '.py' : '.js';
        const targetName = filename || `${forgeId}${ext}`;
        const targetPath = path.join(SCRIPTS_DIR, targetName);

        // Copy from sandbox to permanent library
        fs.copyFileSync(forge.sandbox_path, targetPath);
        forge.promoted = true;
        forge.promoted_path = targetPath;
        forge.promoted_at = new Date().toISOString();
        await redis.set(`forge:${forgeId}`, JSON.stringify(forge));

        console.log(`[FORGE] 🚀 Script promoted: ${targetPath}`);
        res.json({ status: 'success', promoted_to: targetPath, forge });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// List all forged scripts
app.get('/forge', async (req, res) => {
    try {
        const forgeIds = await redis.lrange('forge:index', 0, 49);
        const forges = await Promise.all(
            forgeIds.map(async (id) => {
                const raw = await redis.get(`forge:${id}`);
                return raw ? JSON.parse(raw) : null;
            })
        );
        res.json({ status: 'success', count: forges.filter(Boolean).length, items: forges.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── PHASE 11C: SCHOLAR PROTOCOL (Comet Bridge) ────────────────────────────

app.post('/scholar/mission', async (req, res) => {
    try {
        const { mission, target_url, instructions } = req.body;

        const missionId = `scholar_${Date.now()}`;
        const missionRecord = {
            id: missionId,
            mission: mission || 'Enrollment Audit',
            target_url: target_url || 'https://selfservice.mta.ca',
            instructions: instructions || 'Log into MTA Self-Service portal, verify enrollment for Winter 2026 courses, and extract any registration holds.',
            status: 'QUEUED',
            created_at: new Date().toISOString()
        };

        // Store mission for Comet to pick up
        await redis.set(`scholar:${missionId}`, JSON.stringify(missionRecord));
        await redis.lpush('scholar:queue', missionId);

        // Broadcast to swarm
        await redis.publish('swarm:blackboard', JSON.stringify({
            channel: 'scholar',
            message: { intent: 'SCHOLAR_MISSION', mission: missionRecord },
            sender: 'valentine-core'
        }));

        console.log(`[SCHOLAR] 📚 Mission queued: ${missionId} — "${missionRecord.mission}"`);
        res.json({ status: 'success', mission: missionRecord });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Comet reports mission results back
app.post('/scholar/report', async (req, res) => {
    try {
        const { missionId, results, status } = req.body;
        if (!missionId) return res.status(400).json({ status: 'error', message: 'missionId required.' });

        const raw = await redis.get(`scholar:${missionId}`);
        if (!raw) return res.status(404).json({ status: 'error', message: 'Mission not found.' });

        const mission = JSON.parse(raw);
        mission.status = status || 'COMPLETED';
        mission.results = results;
        mission.completed_at = new Date().toISOString();
        await redis.set(`scholar:${missionId}`, JSON.stringify(mission));

        // Auto-distill the results
        if (results) {
            distillToKnowledge(mission.mission, JSON.stringify(results), 'comet-scholar').catch(err =>
                console.error('[SCHOLAR DISTILL ERROR]:', err.message)
            );
        }

        console.log(`[SCHOLAR] ✅ Mission ${missionId} completed.`);
        res.json({ status: 'success', mission });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get pending scholar missions (for Comet to poll)
app.get('/scholar/queue', async (req, res) => {
    try {
        const missionIds = await redis.lrange('scholar:queue', 0, 9);
        const missions = await Promise.all(
            missionIds.map(async (id) => {
                const raw = await redis.get(`scholar:${id}`);
                return raw ? JSON.parse(raw) : null;
            })
        );
        res.json({ status: 'success', count: missions.filter(Boolean).length, missions: missions.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => console.log(`[ChatGPT Proxy] Swarm Orchestration Active on port ${PORT}`));
