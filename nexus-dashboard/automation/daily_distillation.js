#!/usr/bin/env node
/**
 * Daily Knowledge Distillation Agent
 * Automatically runs at midnight to scan for new/modified vault documents
 * and re-index them into the semantic vector store.
 *
 * Wires into the existing Neural Uplink and broadcast system.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const VAULT_PATH = '/Users/infinite27/AILCC_PRIME/04_Intelligence_Vault';
const MODIFICATION_LOG = '/tmp/vault_last_sync.json';
const LOG_PATH = '/Users/infinite27/AILCC_PRIME/logs/knowledge_distillation.log';

function log(msg) {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${msg}\n`;
    process.stdout.write(line);
    try { fs.appendFileSync(LOG_PATH, line); } catch (e) { }
}

function loadLastSync() {
    try { return JSON.parse(fs.readFileSync(MODIFICATION_LOG, 'utf-8')); }
    catch (e) { return {}; }
}

function saveLastSync(data) {
    fs.writeFileSync(MODIFICATION_LOG, JSON.stringify(data, null, 2));
}

function walk(dir) {
    let results = [];
    try {
        for (const file of fs.readdirSync(dir)) {
            const fp = path.join(dir, file);
            try {
                const stat = fs.statSync(fp);
                if (stat.isDirectory()) results = results.concat(walk(fp));
                else if (/\.(md|txt|json)$/.test(file)) results.push({ path: fp, mtime: stat.mtimeMs });
            } catch (e) { }
        }
    } catch (e) { }
    return results;
}

async function analyzeLogTrends() {
    log('📊 Starting Log Trend Analysis...');
    const archiveDir = '/Users/infinite27/AILCC_PRIME/logs/archive';
    if (!fs.existsSync(archiveDir)) return { trends: [], anomalyCount: 0 };

    const files = fs.readdirSync(archiveDir).filter(f => f.endsWith('.log'));
    const patternMap = new Map();
    let anomalyCount = 0;

    for (const file of files.slice(-20)) { // Scan last 20 archived logs
        try {
            const content = fs.readFileSync(path.join(archiveDir, file), 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.includes('ERROR') || line.includes('FATAL')) {
                    anomalyCount++;
                    // Extract core error message (ignore timestamps)
                    const core = line.replace(/\[.*?\]/, '').trim();
                    patternMap.set(core, (patternMap.get(core) || 0) + 1);
                }
            }
        } catch (e) { }
    }

    const trends = Array.from(patternMap.entries())
        .filter(([_, count]) => count > 2) // recurring
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    log(`Trend analysis complete. Found ${anomalyCount} total anomalies.`);
    return { trends, anomalyCount };
}

async function runDistillation() {
    log('⚡ Daily Knowledge Distillation started.');
    const { trends, anomalyCount } = await analyzeLogTrends();

    const lastSync = loadLastSync();
    const allFiles = walk(VAULT_PATH);
    const newFiles = allFiles.filter(f => !lastSync[f.path] || lastSync[f.path] < f.mtime);

    log(`Found ${newFiles.length} new/modified files out of ${allFiles.length} total.`);

    // If we found trends, create a "Trend Report" in the vault
    if (trends.length > 0) {
        const trendReportPath = path.join(VAULT_PATH, `METRICS_TRENDS_${new Date().toISOString().split('T')[0]}.md`);
        const trendContent = `# Intelligence Trend Report\n\nDetected ${anomalyCount} anomalies in recent logs.\n\n## Leading Recurring Issues\n` +
            trends.map(([msg, count]) => `- **${count}x**: \`${msg}\``).join('\n');
        fs.writeFileSync(trendReportPath, trendContent);
        newFiles.push({ path: trendReportPath, mtime: Date.now() });
    }

    if (newFiles.length === 0) {
        log('No changes detected. Distillation complete.');
        return;
    }

    // POST to index:vault API endpoint
    const payload = JSON.stringify({ paths: newFiles.map(f => f.path), reindex: true });
    const req = http.request(`http://localhost:3000/api/intelligence/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            log(`Indexer response: ${data}`);
            const newSync = { ...lastSync };
            for (const f of newFiles) newSync[f.path] = f.mtime;
            saveLastSync(newSync);
            log('✅ Daily distillation complete. Vector store updated.');
            broadcastEvent({ type: 'KNOWLEDGE_DISTILLED', files: newFiles.length, trends: trends.length });
        });
    });

    req.on('error', (e) => {
        log(`API unavailable (${e.message}), triggering background re-index...`);
        const { exec } = require('child_process');
        exec(`cd /Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard && npm run index:vault`, (err, stdout) => {
            if (err) log(`Re-index error: ${err.message}`);
            else log(`Re-index complete: ${stdout.slice(0, 200)}`);
        });
    });

    req.write(payload);
    req.end();
}

function broadcastEvent(event) {
    const data = JSON.stringify(event);
    const req = http.request('http://localhost:5005/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, () => { });
    req.on('error', () => { });
    req.write(data);
    req.end();
}

// Support scheduling: run once now, then every 24h
runDistillation();
setInterval(runDistillation, 24 * 60 * 60 * 1000);

log('🔁 Daily Knowledge Distillation Agent is running (checks every 24h).');
