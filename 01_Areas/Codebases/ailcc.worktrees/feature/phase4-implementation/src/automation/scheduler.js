const { generateLiveStatus } = require('./mcp-bridge');

const INTERVAL_MINUTES = 5;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

console.log(`[SCHEDULER] Starting MCP Sync Scheduler.`);
console.log(`[SCHEDULER] Interval: ${INTERVAL_MINUTES} minutes.`);

// Run immediately on start
(async () => {
    try {
        await generateLiveStatus();
    } catch (e) {
        console.error('[SCHEDULER] Initial sync failed:', e.message);
    }
})();

// Schedule loop
setInterval(async () => {
    try {
        await generateLiveStatus();
    } catch (e) {
        console.error('[SCHEDULER] Sync failed:', e.message);
    }
}, INTERVAL_MS);
