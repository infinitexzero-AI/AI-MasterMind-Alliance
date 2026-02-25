const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuration
const CONFIG = {
    linearKey: process.env.LINEAR_API_KEY,
    githubToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    // Updated path to point to the Next.js public directory
    outputFile: path.join(__dirname, '../command-center/public/data/live_status.json'),
    projectRoot: path.join(__dirname, '../..') // Pointing to 'ailcc' root which contains .git
};

async function fetchLinearIssues() {
    try {
        if (!CONFIG.linearKey) throw new Error("Missing Linear Key");

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
                'Authorization': CONFIG.linearKey
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`Linear API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            connected: true,
            issues: data.data?.issues?.nodes || []
        };
    } catch (error) {
        console.error('Failed to fetch Linear issues:', error.message);
        return { connected: false, issues: [], error: error.message };
    }
}

async function fetchGithubPRs() {
    try {
        if (!CONFIG.githubToken) throw new Error("Missing GitHub Token");

        const response = await fetch('https://api.github.com/search/issues?q=is:pr+author:@me+state:open', {
            headers: {
                'Authorization': `token ${CONFIG.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Antigravity-Cortex'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn('GitHub API permission/rate-limit issue.');
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            connected: true,
            prs: data.items || []
        };
    } catch (error) {
        console.error('Failed to fetch GitHub PRs:', error.message);
        return { connected: false, prs: [], error: error.message };
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
        // console.error('Failed to check git status:', error.message);
        // Fail silently for cleaner logs if just not a git repo
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
    // Stub for N8N check - in real scenario could hit a health endpoint
    // For now, we assume if we can reach localhost:5678 (default n8n) it might be up, 
    // or just return a placeholder status.
    return {
        connected: false, // Default to false until actual integration
        status: "Checking not implemented"
    };
}

async function checkSystemHealth() {
    // Basic stub for system health - in production could use 'os' module
    // For now, return a nominal status
    return {
        status: 'NOMINAL',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };
}

async function generateLiveStatus() {
    console.log('[MCP_BRIDGE] Syncing...');

    // We can run these in parallel
    const [linear, github, git, filesystem, n8n, health] = await Promise.all([
        fetchLinearIssues(),
        fetchGithubPRs(),
        checkGitStatus(),
        checkFilesystem(),
        checkN8N(),
        checkSystemHealth()
    ]);

    const status = {
        timestamp: new Date().toISOString(),
        linear,
        github,
        git,
        filesystem,
        n8n,
        health,
        // In the future, 'agents' could be dynamic based on which services are responding.
        // For now we keep the static structure but updated with real connectivity flags where possible.
        agents: [
            { "name": "Valentine", "role": "Orchestrator", "status": "ONLINE", "conversations": 0 },
            { "name": "Antigravity", "role": "Inner Loop (Code)", "status": "ACTIVE", "conversations": 0 },
            { "name": "Comet", "role": "Outer Loop (Web)", "status": "IDLE", "conversations": 0 },
            { "name": "SuperGrok", "role": "Strategy", "status": "STANDBY", "conversations": 0 },
            { "name": "Claude", "role": "Deep Coding", "status": github.connected ? "LINKED" : "OFFLINE", "conversations": 0 },
            { "name": "ChatGPT", "role": "Backup/GitHub", "status": "OFFLINE", "conversations": 0 },
            { "name": "Gemini", "role": "Multi-Modal", "status": "LINKED", "conversations": 0 },
            { "name": "N8N", "role": "Automation", "status": n8n.connected ? "ACTIVE" : "OFFLINE", "conversations": 0 }
        ]
    };

    // Ensure directory exists
    const dir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(status, null, 2));
    console.log(`[MCP_BRIDGE] Live status updated at ${status.timestamp}`);
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

// Export for scheduler
module.exports = { generateLiveStatus };

// Run if executed directly
if (require.main === module) {
    main();
}


