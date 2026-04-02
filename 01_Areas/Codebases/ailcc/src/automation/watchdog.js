/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROCESSES = [
    { name: 'mcp-bridge', command: 'node src/automation/mcp-bridge.js', pattern: 'mcp-bridge.js' },
    { name: 'relay-server', command: 'node dashboard/server/relay.js', pattern: 'relay.js' },
    { name: 'scheduler', command: 'node src/automation/scheduler.js', pattern: 'scheduler.js' }
];

function checkProcess(p) {
    try {
        const output = execSync(`ps aux | grep "${p.pattern}" | grep -v grep`).toString();
        if (output.trim()) {
            return true;
        }
    } catch (e) {
        // grep returns 1 if no match
    }
    return false;
}

function startProcess(p) {
    console.log(`[Watchdog] 🚨 Process ${p.name} is down! Restarting...`);
    const logFile = path.join(process.cwd(), `tmp/${p.name}.watchdog.log`);
    const child = exec(`${p.command} >> ${logFile} 2>&1`, (error) => {
        if (error) {
            console.error(`[Watchdog] Failed to start ${p.name}:`, error);
        }
    });
    console.log(`[Watchdog] Started ${p.name} (PID: ${child.pid})`);
}

async function run() {
    console.log('[Watchdog] Starting system health monitor...');
    const configPath = path.join(__dirname, 'master_config.json');
    if (!fs.existsSync(configPath)) {
        console.error('[Watchdog] Master config not found. Exiting.');
        return;
    }

    while (true) { // eslint-disable-line no-constant-condition
        for (const p of PROCESSES) {
            if (!checkProcess(p)) {
                 startProcess(p);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30s
    }
}

if (require.main === module) {
    run();
}
