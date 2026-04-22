const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[NightShift] Starting System Audit...');

const results = {
    timestamp: new Date().toISOString(),
    disk: {},
    logs: [],
    errors: []
};

try {
    const disk = execSync('df -h /').toString().split('\n')[1].split(/\s+/);
    results.disk = { size: disk[1], used: disk[2], available: disk[3], percent: disk[4] };
} catch (e) { console.error('Disk check failed'); }

// Scan logs for RECENT errors
const logDir = path.join(process.cwd(), 'logs');
if (fs.existsSync(logDir)) {
    const logFiles = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
    logFiles.forEach(f => {
        try {
            const content = fs.readFileSync(path.join(logDir, f), 'utf8');
            const lines = content.split('\n').filter(l => l.includes('ERROR') || l.includes('fail'));
            if (lines.length > 0) {
                results.errors.push({ file: f, sample: lines.slice(-5) });
            }
        } catch (e) {}
    });
}

const auditPath = path.join(process.cwd(), '.night_shift_report.json');
fs.writeFileSync(auditPath, JSON.stringify(results, null, 2));
console.log('[NightShift] Audit Complete. Report written to .night_shift_report.json');
