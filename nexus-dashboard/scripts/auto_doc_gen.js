const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const WATCH_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'logs'];
const WALKTHROUGH_PATH = '/Users/infinite27/.gemini/antigravity/brain/3e98b031-b917-45d4-864d-53a6f76c9ee7/walkthrough.md';

console.log(`[AutoDoc] Starting Alliance Documentation Watchdog...`);
console.log(`[AutoDoc] Watching: ${WATCH_DIR}`);

let changeQueue = new Set();
let timeout = null;

function handleFileChange(event, filename) {
    if (!filename) return;

    // Ignore non-source files or ignored directories
    if (IGNORE_DIRS.some(dir => filename.includes(dir))) return;
    if (!/\.(tsx|ts|js|md)$/.test(filename)) return;

    changeQueue.add(filename);

    // Debounce processing
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(processChanges, 5000); // Wait 5 seconds of silence
}

async function processChanges() {
    const files = Array.from(changeQueue);
    changeQueue.clear();

    if (files.length === 0) return;

    console.log(`[AutoDoc] Detected changes in: ${files.join(', ')}`);

    const timestamp = new Date().toLocaleString();
    const entry = `\n### 📝 Auto-Update: ${timestamp}\n- **Modified Files**: ${files.map(f => `\`${f}\``).join(', ')}\n- **Status**: Changes detected and indexed by the Alliance Documentation Engine.\n`;

    try {
        fs.appendFileSync(WALKTHROUGH_PATH, entry);
        console.log(`[AutoDoc] Successfully updated walkthrough.md`);

        // Notify the Neural Uplink of the documentation event
        broadcastToAlliance({
            type: 'DOC_UPDATE',
            source: 'AutoDocEngine',
            payload: { files, timestamp }
        });

    } catch (err) {
        console.error(`[AutoDoc] Failed to update walkthrough:`, err.message);
    }
}

function broadcastToAlliance(event) {
    // Simple POST to Neural Uplink if available
    const data = JSON.stringify(event);
    const req = require('http').request('http://localhost:5005/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, (res) => { });
    req.on('error', () => { }); // Ignore if offline
    req.write(data);
    req.end();
}

// Start watching recursively
fs.watch(WATCH_DIR, { recursive: true }, handleFileChange);
