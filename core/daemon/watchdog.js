const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');
const WebSocket = require('ws');

// ----------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_DIRECTORY_SIZE_BYTES = 5n * 1024n * 1024n * 1024n; // 5 GB
const WS_URL = 'ws://localhost:3001';
const ZOMBIE_TIMEOUT_SECONDS = 3600; // 1 hour

const TARGET_DIRS = [
    path.join(process.env.HOME, '.gemini'),
    path.join(process.env.HOME, 'AILCC_PRIME', 'logs')
];

// Target process patterns to hunt
const TARGET_PROCESSES = [
    'Google Chrome', // Often left behind by selenium/puppeteer
    'python',
    'node'
];

// ----------------------------------------------------------------------
// Logger
// ----------------------------------------------------------------------
const LOG_FILE = path.join(process.env.HOME, 'AILCC_PRIME', 'logs', 'daemon', 'watchdog.log');

function log(msg) {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${msg}\n`;
    process.stdout.write(line);
    try {
        fs.appendFileSync(LOG_FILE, line);
    } catch (e) {
        console.error("Failed to write to log file:", e.message);
    }
}

// ----------------------------------------------------------------------
// 1. Auto-Purge Logic
// ----------------------------------------------------------------------
function getDirSize(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) return 0n;
        const stats = fs.statSync(dirPath);
        if (stats.isFile()) return BigInt(stats.size);
        
        let total = 0n;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            total += getDirSize(path.join(dirPath, file));
        }
        return total;
    } catch (e) {
        log(`Error calculating size for ${dirPath}: ${e.message}`);
        return 0n;
    }
}

function checkAndPurgeDirectories() {
    log("Running Auto-Purge check...");
    for (const dir of TARGET_DIRS) {
        if (!fs.existsSync(dir)) continue;
        
        const size = getDirSize(dir);
        log(`Directory ${dir} size: ${(Number(size) / (1024 ** 3)).toFixed(2)} GB`);
        
        if (size > MAX_DIRECTORY_SIZE_BYTES) {
            log(`🚨 OVER LIMIT: Purging ${dir}`);
            try {
                // Highly aggressive, but isolated to known cache/log dirs
                execSync(`rm -rf "${dir}"/*`);
                log(`✅ Successfully purged ${dir}`);
            } catch (e) {
                log(`❌ Failed to purge ${dir}: ${e.message}`);
            }
        }
    }
}

// ----------------------------------------------------------------------
// 2. Zombie Hunter Logic
// ----------------------------------------------------------------------
function huntZombies() {
    log("Running Zombie Hunter...");
    try {
        // macOS ps doesn't support etimes.
        // We will pull pid, etime (formatted elapsed time), and command.
        // etime format is [[dd-]hh:]mm:ss
        const psOutput = execSync("ps -eo pid,etime,command").toString();
        const lines = psOutput.split('\n');
        
        let killedCount = 0;
        
        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Regex to parse PID, ETIME (string), and COMMAND
            const match = line.match(/^(\d+)\s+([\d:-]+)\s+(.+)$/);
            if (!match) continue;
            
            const pid = parseInt(match[1], 10);
            const etimeStr = match[2];
            const cmd = match[3];
            
            // Convert etime string to elapsed seconds
            let elapsed = 0;
            const parts = etimeStr.split('-');
            let timeStr = etimeStr;
            let days = 0;
            
            if (parts.length === 2) {
                days = parseInt(parts[0], 10);
                timeStr = parts[1];
            }
            
            const hms = timeStr.split(':');
            if (hms.length === 3) {
                // hh:mm:ss
                elapsed = days * 86400 + parseInt(hms[0],10) * 3600 + parseInt(hms[1],10) * 60 + parseInt(hms[2],10);
            } else if (hms.length === 2) {
                // mm:ss
                elapsed = days * 86400 + parseInt(hms[0],10) * 60 + parseInt(hms[1],10);
            }
            
            // Check if matches our target patterns
            let isTarget = false;
            for (const pattern of TARGET_PROCESSES) {
                let regexStr = `(^|/)${pattern}( |$)`;
                if (pattern === 'python') {
                    regexStr = `(^|/)${pattern}[0-9\\.]*( |$)`;
                } else if (pattern === 'Google Chrome') {
                    regexStr = `(^|/)${pattern}( Helper)?( |$)`;
                }
                
                if (new RegExp(regexStr).test(cmd)) {
                    isTarget = true;
                    break;
                }
            }
            
            // If it's a target AND older than timeout AND not this script itself
            if (isTarget && elapsed > ZOMBIE_TIMEOUT_SECONDS && !cmd.includes('watchdog.js')) {
                log(`🧟 ZOMBIE DETECTED: PID ${pid} (${cmd.substring(0, 50)}...) running for ${elapsed}s`);
                
                // If it's a dry run, don't actually kill
                if (process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run')) {
                    log(`[DRY RUN] Would kill PID ${pid}`);
                } else {
                    try {
                        let forceKill = true;
                        if(forceKill) {
                           execSync(`kill -9 ${pid}`); // Much stronger than JS process.kill
                           log(`🔪 Force Terminated PID ${pid}`);
                           killedCount++;
                        }
                    } catch (e) {
                        log(`Failed to kill PID ${pid}: ${e.message}`);
                    }
                }
            }
        }
        
        log(`Zombie Hunter finished. Killed ${killedCount} processes.`);
        
    } catch (e) {
        log(`❌ Zombie Hunter error: ${e.message}`);
    }
}

// ----------------------------------------------------------------------
// 3. System Metrics (for Heartbeat)
// ----------------------------------------------------------------------
function getSystemMetrics() {
    try {
        // Memory (macOS specific simple calculation)
        const vmStat = execSync('vm_stat').toString();
        const pageSizeMatch = vmStat.match(/page size of (\d+) bytes/);
        const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 4096;
        
        const freePagesMatch = vmStat.match(/Pages free:\s+(\d+)/);
        const freePages = freePagesMatch ? parseInt(freePagesMatch[1], 10) : 0;
        
        const freeMemGB = (freePages * pageSize) / (1024 ** 3);
        
        // Disk Space (macOS /System/Volumes/Data)
        const dfOut = execSync('df -h /System/Volumes/Data').toString().split('\n')[1];
        const parts = dfOut.trim().split(/\s+/);
        // parts[3] is typically the Available space on mac usually ends in Gi
        let diskFreeStr = parts[3] ? parts[3].replace('Gi', '') : "0";
        
        let agentsActive = 0;
        try {
            // Count antigravity or other known agents
            agentsActive = parseInt(execSync('ps aux | grep -i "Agent" | grep -v grep | wc -l').toString().trim(), 10);
        } catch(e){}

        return {
            memoryFreeGB: freeMemGB.toFixed(2),
            diskFreeGB: parseFloat(diskFreeStr) || 0,
            agentsActive: agentsActive
        };
    } catch (e) {
        log(`Error gathering metrics: ${e.message}`);
        return { error: e.message };
    }
}

// ----------------------------------------------------------------------
// 4. Heartbeat Emitter
// ----------------------------------------------------------------------
let wsConnection = null;

function connectWebSocket() {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) return;
    
    log(`Connecting to Cortex Pulse at ${WS_URL}...`);
    wsConnection = new WebSocket(WS_URL);
    
    wsConnection.on('open', () => {
        log('✅ Connected to Cortex Pulse WebSocket');
        sendHeartbeat(); // Send initial heartbeat immediately
    });
    
    wsConnection.on('error', (err) => {
        log(`WebSocket Error: ${err.message}`);
        wsConnection = null;
    });
    
    wsConnection.on('close', () => {
        log('WebSocket connection closed. Will retry on next heartbeat cycle.');
        wsConnection = null;
    });
}

function sendHeartbeat() {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        return;
    }
    
    const metrics = getSystemMetrics();
    const payload = {
        type: 'heartbeat',
        source: 'watchdog_daemon',
        timestamp: new Date().toISOString(),
        metrics: metrics
    };
    
    try {
        wsConnection.send(JSON.stringify(payload));
        log(`💓 Heartbeat emitted (Disk: ${metrics.diskFreeGB}GB free)`);
    } catch (e) {
        log(`Failed to send heartbeat: ${e.message}`);
    }
}

// ----------------------------------------------------------------------
// Main Loop
// ----------------------------------------------------------------------
function runCycle() {
    log("--- Starting Watchdog Cycle ---");
    checkAndPurgeDirectories();
    huntZombies();
    sendHeartbeat();
    log("--- Watchdog Cycle Complete ---");
}

function init() {
    log("============= WATCHDOG DAEMON STARTING =============");
    
    if (process.argv.includes('--dry-run')) {
        log("MODE: DRY RUN (No destructive actions will be taken)");
        // Force dry run inside methods too
        process.env.DRY_RUN = 'true';
        huntZombies(); // Specific test of the zombie hunter
        process.exit(0);
    }
    
    // Initial run
    runCycle();
    
    // Schedule loop
    setInterval(runCycle, CHECK_INTERVAL_MS);
    
    // Also schedule heartbeat more frequently (e.g. every 60s)
    // while expensive operations happen every 5 mins
    setInterval(sendHeartbeat, 60 * 1000);
}

// Handle termination gracefully
process.on('SIGINT', () => {
    log("Watchdog daemon interrupted (SIGINT). Exiting.");
    if (wsConnection) wsConnection.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    log("Watchdog daemon terminated (SIGTERM). Exiting.");
    if (wsConnection) wsConnection.close();
    process.exit(0);
});

// START
init();
