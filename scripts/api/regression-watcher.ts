
/**
 * 📉 AILCC Performance Regression Watcher (Phase 20)
 * 
 * Background daemon that pings critical AILCC endpoints every minute.
 * Maintains a rolling average of latency. If the latency spikes by >50%
 * above the baseline in a single tick, it generates a Regression Warning
 * in the Event Bus to flag potentially bloated code commits.
 */

const TARGET_ENDPOINTS = [
    { name: 'Cortex Plan', url: 'http://localhost:3000/api/cortex/plan', method: 'POST', body: { intent: 'Ping' } },
    { name: 'System Health', url: 'http://localhost:3000/api/system/health', method: 'GET' },
    { name: 'Event Stream Probe', url: 'http://localhost:3000/api/system/event-stream', method: 'GET', timeoutOnly: true }
];

const POLL_INTERVAL_MS = 60000; // 1 Minute
const REGRESSION_THRESHOLD_PERCENT = 1.5; // 50% slower than moving average triggers alert

// In-memory TS structure, easily portable to SQLite if needed
const latencyBaseline: Record<string, number[]> = {};

async function emitRegression(endpointName: string, expected: number, actual: number) {
    console.warn(`[Regression Watcher] 🚨 Spiked detected on ${endpointName} (${actual.toFixed(0)}ms > ${expected.toFixed(0)}ms)`);
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'RegressionWatcher',
                message: `[PERFORMANCE REGRESSION] ${endpointName} latency spiked to ${actual.toFixed(0)}ms (Baseline: ${expected.toFixed(0)}ms). Potential unoptimized logic deployment detected.`,
                severity: 'warning',
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        // Suppress
    }
}

async function pingEndpoint(endpoint: { url: string; method: string; body?: Record<string, unknown>; timeoutOnly?: boolean }) {
    const start = performance.now();
    try {
        // If it's pure EventStream, we just establish connection and close immediately to measure handshake latency
        if (endpoint.timeoutOnly) {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 100);
            await fetch(endpoint.url, { signal: controller.signal }).catch(() => { });
        } else {
            await fetch(endpoint.url, {
                method: endpoint.method,
                headers: { 'Content-Type': 'application/json' },
                body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
            });
        }
    } catch (e) {
        // Endpoint down completely
    }
    return performance.now() - start;
}

async function runAudit() {
    console.log(`[Regression Watcher] ⏱️ Running latency audit pass...`);

    for (const ep of TARGET_ENDPOINTS) {
        const latency = await pingEndpoint(ep);

        if (!latencyBaseline[ep.name]) {
            latencyBaseline[ep.name] = [];
        }

        const history = latencyBaseline[ep.name];

        // Calculate moving average of last 10 successful pings
        if (history.length >= 10) {
            const movingAverage = history.reduce((a, b) => a + b, 0) / history.length;

            // If the current ping is significantly slower than our trusted average, trigger regression event
            if (latency > movingAverage * REGRESSION_THRESHOLD_PERCENT && latency > 50) { // Ignore micro-stutters under 50ms
                await emitRegression(ep.name, movingAverage, latency);
            }
        }

        // Push current ping to history and slice to keep only the last 10
        history.push(latency);
        if (history.length > 10) history.shift();
    }
}

console.log(`[Regression Watcher] 📉 Daemon Online. Establishing baseline metrics...`);
runAudit(); // Initial pass
setInterval(runAudit, POLL_INTERVAL_MS);
