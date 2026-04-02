/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Proactively load .env from the project root if it exists
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

const CONFIG_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'master_config.json'), 'utf-8'));
const bus = require('./bus');

// Correlation ID for end-to-end observability
const TRACE_ID = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Circuit Breaker State
const CIRCUIT_BREAKER = {
    github: { failures: 0, lastError: null, open: false },
    linear: { failures: 0, lastError: null, open: false }
};

const CONFIG = {
    linearKey: process.env.LINEAR_API_KEY,
    githubToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    outputFile: path.join(__dirname, CONFIG_DATA.bridge.output_file),
    projectRoot: path.join(__dirname, CONFIG_DATA.bridge.project_root)
};

function checkCircuit(service) {
    const state = CIRCUIT_BREAKER[service];
    if (state.open) {
        const cooldown = CONFIG_DATA.observability.circuit_breaker.timeout_ms;
        if (Date.now() - state.lastError > cooldown) {
            console.log(`[BRIDGE] Circuit half-open for ${service}. Retrying...`);
            state.open = false;
            state.failures = 0;
            return true;
        }
        return false;
    }
    return true;
}

function reportFailure(service, error) {
    CIRCUIT_BREAKER[service].failures++;
    CIRCUIT_BREAKER[service].lastError = Date.now();
    CIRCUIT_BREAKER[service].lastErrorMessage = error;
    if (CIRCUIT_BREAKER[service].failures >= CONFIG_DATA.observability.circuit_breaker.threshold) {
        console.warn(`[BRIDGE] Circuit OPEN for ${service} due to repeated failure: ${error}`);
        CIRCUIT_BREAKER[service].open = true;
    }
}

async function fetchLinearIssues() {
    try {
        if (!CONFIG.linearKey) {
            return { connected: false, issues: [], status: 'DISABLED (Missing Key)', traceId: TRACE_ID };
        }

        if (!checkCircuit('linear')) {
            return { connected: false, issues: [], status: 'CIRCUIT OPEN (API Failure)', traceId: TRACE_ID };
        }

        const query = `
            query {
                issues(first: 10, filter: { state: { name: { eq: "In Progress" } } }) {
                    nodes {
                        id
                        title
                        url
                        createdAt
                        state {
                            name
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': CONFIG.linearKey,
                'X-Trace-Id': TRACE_ID
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            reportFailure('linear', response.status);
            return { connected: false, issues: [], error: `Linear API error: ${response.status}`, traceId: TRACE_ID };
        }

        const data = await response.json();
        CIRCUIT_BREAKER.linear.failures = 0; // Success, reset
        return {
            connected: true,
            issues: data.data?.issues?.nodes || [],
            traceId: TRACE_ID
        };
    } catch (error) {
        reportFailure('linear', error.message);
        return { connected: false, issues: [], error: error.message, traceId: TRACE_ID };
    }
}

async function fetchGithubPRs() {
    try {
        if (!CONFIG.githubToken) {
            return { connected: false, prs: [], status: 'DISABLED (Missing Token)', traceId: TRACE_ID };
        }

        if (!checkCircuit('github')) {
            return { connected: false, prs: [], status: 'CIRCUIT OPEN (API Failure)', traceId: TRACE_ID };
        }

        const response = await fetch('https://api.github.com/search/issues?q=is:pr+author:@me+state:open', {
            headers: {
                'Authorization': `token ${CONFIG.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Antigravity-Cortex',
                'X-Trace-Id': TRACE_ID
            }
        });

        if (!response.ok) {
            reportFailure('github', response.status);
            return { connected: false, prs: [], error: `GitHub API error: ${response.status}`, traceId: TRACE_ID };
        }

        const data = await response.json();
        CIRCUIT_BREAKER.github.failures = 0; // Success
        return {
            connected: true,
            prs: data.items || [],
            traceId: TRACE_ID
        };
    } catch (error) {
        reportFailure('github', error.message);
        return { connected: false, prs: [], error: error.message, traceId: TRACE_ID };
    }
}

async function checkGitStatus() {
    try {
        const { stdout: branch } = await execAsync('git branch --show-current', { cwd: CONFIG.projectRoot });
        const { stdout: status } = await execAsync('git status --short', { cwd: CONFIG.projectRoot });
        return {
            connected: true,
            branch: branch.trim(),
            status: status.trim() || 'clean'
        };
    } catch (error) {
        return { connected: false, error: "Not a git repo or git not found" };
    }
}

async function checkFilesystem() {
    try {
        const stats = await fs.promises.stat(CONFIG.projectRoot);
        return {
            connected: true,
            projectPath: CONFIG.projectRoot,
            exists: stats.isDirectory()
        };
    } catch (error) {
        console.error('Failed to check filesystem:', error.message);
        return { connected: false, error: "Project root not found" };
    }
}

async function checkN8N() {
    try {
        const n8nUrl = 'https://infinitexzeroai.app.n8n.cloud/';
        const response = await fetch(n8nUrl);

        return {
            connected: response.ok,
            status: response.ok ? "ONLINE" : `Error: ${response.status}`,
            url: n8nUrl
        };
    } catch (error) {
        return {
            connected: false,
            status: "OFFLINE (Unreachable)",
            error: error.message
        };
    }
}

async function checkSystemHealth() {
    return {
        status: 'NOMINAL',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };
}

async function checkMode6() {
    try {
        const memoryPath = path.join(__dirname, 'mode6/mode6_memory.json');
        const archivePath = path.join(__dirname, 'mode6/mode6_archive.json');

        if (fs.existsSync(memoryPath)) {
            const data = fs.readFileSync(memoryPath, 'utf-8');
            let tasks = JSON.parse(data);

            const activeTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'pending');
            const doneTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');

            if (doneTasks.length > 10) {
                let archive = [];
                if (fs.existsSync(archivePath)) {
                    archive = JSON.parse(fs.readFileSync(archivePath, 'utf-8'));
                }
                archive.push(...doneTasks);
                fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
                fs.writeFileSync(memoryPath, JSON.stringify(activeTasks, null, 2));
                tasks = activeTasks;
                console.log(`[BRIDGE] Archived ${doneTasks.length} completed tasks.`);
            }

            const active = tasks.filter(t => t.status === 'in_progress').length;
            const completed = tasks.filter(t => t.status === 'completed').length;
            const failed = tasks.filter(t => t.status === 'failed').length;

            return {
                connected: true,
                status: active > 0 ? 'ACTIVE' : 'IDLE',
                stats: { active, completed, failed, total: tasks.length },
                recent_tasks: tasks.slice(-5)
            };
        } else {
            return { connected: true, status: 'STANDBY', stats: { total: 0 }, error: "Memory file not found" };
        }
    } catch (error) {
        return { connected: false, status: 'ERROR', error: error.message };
    }
}

async function fetchWhitepaper() {
    try {
        const wpPath = path.join(CONFIG.projectRoot, 'whitepaper.md');
        if (fs.existsSync(wpPath)) {
            const content = fs.readFileSync(wpPath, 'utf-8');
            const stats = fs.statSync(wpPath);
            return {
                exists: true,
                lastUpdated: stats.mtime.toISOString(),
                summary: content.substring(0, 500) + '...'
            };
        }
        return { exists: false };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

async function generateLiveStatus() {
    console.log('[MCP_BRIDGE] Syncing...');

    const [linear, github, git, filesystem, n8n, health, mode6, whitepaper] = await Promise.all([
        fetchLinearIssues(),
        fetchGithubPRs(),
        checkGitStatus(),
        checkFilesystem(),
        checkN8N(),
        checkSystemHealth(),
        checkMode6(),
        fetchWhitepaper()
    ]);

    const personalitiesPath = path.join(__dirname, '../../config/agent_personalities.json');
    let personalities = {};
    try {
        if (fs.existsSync(personalitiesPath)) {
            personalities = JSON.parse(fs.readFileSync(personalitiesPath, 'utf8'));
        }
    } catch (e) {
        console.error('[MCP_BRIDGE] Failed to load agent personalities:', e.message);
    }

    const agents = [
        { "name": "Valentine", "role": "Orchestrator", "status": "ONLINE", "conversations": 0 },
        { "name": "Antigravity", "role": "Inner Loop (Code)", "status": "ACTIVE", "conversations": 0 },
        { "name": "Comet", "role": "Outer Loop (Web)", "status": mode6.status === 'ACTIVE' ? 'WORKING' : 'IDLE', "conversations": mode6.stats?.total || 0 },
        { "name": "SuperGrok", "role": "Strategy", "status": "STANDBY", "conversations": 0 },
        { "name": "Claude", "role": "Deep Coding", "status": github.connected ? "LINKED" : "OFFLINE", "conversations": 0 },
        { "name": "ChatGPT", "role": "Backup/GitHub", "status": "OFFLINE", "conversations": 0 },
        { "name": "Gemini", "role": "Multi-Modal", "status": "LINKED", "conversations": 0 },
        { "name": "N8N", "role": "Automation", "status": n8n.connected ? "ACTIVE" : "OFFLINE", "conversations": 0 }
    ].map(agent => {
        const personality = personalities[agent.name.toLowerCase()];
        if (personality) {
            return {
                ...agent,
                neuromorphic: {
                    cellType: personality.class,
                    heritage: personality.heritage,
                    archetype: personality.archetype
                }
            };
        }
        return agent;
    });

    const status = {
        timestamp: new Date().toISOString(),
        traceId: TRACE_ID,
        observability: {
            circuits: CIRCUIT_BREAKER
        },
        mode6,
        whitepaper,
        linear,
        github,
        git,
        filesystem,
        n8n,
        health,
        agents
    };

    const dir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(status, null, 2));
    bus.publish('status_update', status);

    console.log(`[MCP_BRIDGE] Live status updated and published at ${status.timestamp}`);
}

async function main() {
    const args = process.argv.slice(2);
    const watchMode = args.includes('--watch');
    await generateLiveStatus();
    if (watchMode) {
        console.log('[MCP_BRIDGE] Watch mode enabled. Polling every 30s...');
        setInterval(generateLiveStatus, 30000);
    }
}

module.exports = { generateLiveStatus };
if (require.main === module) main();
