import fs from 'fs';
import path from 'path';

const ENDPOINTS = [
    { name: 'System Health', url: 'http://localhost:3000/api/system/health' },
    { name: 'Cortex Map', url: 'http://localhost:3000/api/system/cortex-map' },
    { name: 'Intelligence Search', url: 'http://localhost:3000/api/intelligence/search?q=test' },
    { name: 'System Updates', url: 'http://localhost:3000/api/system/updates' },
    { name: 'Vision OCR', url: 'http://localhost:3000/api/system/vision' },
    { name: 'Dependency Graph', url: 'http://localhost:3000/api/system/dependency-graph' }
];

async function runAudit() {
    console.log('[StressTest] Initiating Nightly Health Audit...');
    const report: any = {
        timestamp: new Date().toISOString(),
        passes: [],
        failures: [],
        latency: {}
    };

    for (const ep of ENDPOINTS) {
        const start = Date.now();
        try {
            console.log(`[StressTest] Testing: ${ep.name}...`);
            const res = await fetch(ep.url);
            const duration = Date.now() - start;
            report.latency[ep.name] = `${duration}ms`;

            if (res.ok) {
                report.passes.push(ep.name);
            } else {
                report.failures.push({ name: ep.name, status: res.status });
            }
        } catch (error: any) {
            report.failures.push({ name: ep.name, error: error.message });
        }
    }

    const reportPath = path.join(process.cwd(), '.nightly_health_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('[StressTest] Result Template Created.');
    console.log(`[StressTest] Passes: ${report.passes.length} | Failures: ${report.failures.length}`);
}

runAudit().catch(e => console.error(e));
