const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = '/Users/infinite27/AILCC_PRIME/06_System/Logs/watchdog_playwright.log';
const CHECK_INTERVAL = 15000; // 15 seconds
const PLAYWRIGHT_CMD = 'npm run browser';
const PLAYWRIGHT_CWD = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc';
const HEALTH_URL = 'http://localhost:3333/health'; // Based on relay.js BROWSER_SERVER

function log(msg) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${msg}\n`;
    console.log(entry.trim());
    fs.appendFileSync(LOG_FILE, entry);
}

function checkPlaywright() {
    log('Checking Playwright server health...');

    // Attempt to hit health endpoint
    exec(`curl -s -o /dev/null -w "%{http_code}" ${HEALTH_URL}`, (error, stdout) => {
        const statusCode = stdout.trim();

        if (statusCode === '200' || statusCode === '404') { // 404 is fine if the endpoint isn't defined yet, as long as server is up
            log(`Playwright server responded with ${statusCode}. Status: NOMINAL`);
        } else {
            log(`Playwright server unresponsive (Code: ${statusCode}). Attempting recovery...`);
            recoverPlaywright();
        }
    });
}

function recoverPlaywright() {
    // Kill any hanging processes
    exec('pkill -f "playwright"', (error) => {
        log('Terminated existing playwright processes. Re-launching...');

        const child = spawn('npm', ['run', 'browser'], {
            cwd: PLAYWRIGHT_CWD,
            detached: true,
            stdio: 'ignore'
        });

        child.unref();
        log('Playwright server re-launched in background.');
    });
}

// Ensure logs directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

log('🌀 S2-021: Playwright Watchdog Initiated');
setInterval(checkPlaywright, CHECK_INTERVAL);
checkPlaywright();
