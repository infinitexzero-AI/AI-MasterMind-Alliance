const { io } = require("socket.io-client");

const socket = io("http://localhost:5005");

const events = [
    { type: 'agent', msg: 'COMET: Initializing research on TASK-SC-001 (Chrome Side-Cart)' },
    { type: 'heartbeat', msg: 'Neural Uplink Stable: Latency 42ms' },
    { type: 'agent', msg: 'COMET: Querying Chrome.sidePanel API documentation' },
    { type: 'agent', msg: 'COMET: Research complete. Prepared research_summary.md' },
    { type: 'system', msg: 'Handoff Triggered: COMET → ANTIGRAVITY (Reference: TASK-SC-001)' },
    { type: 'agent', msg: 'ANTIGRAVITY: Motor Cortex activated. Scaffolding Chrome Extension...' },
    { type: 'heartbeat', msg: 'System Load: OPTIMAL' },
    { type: 'agent', msg: 'ANTIGRAVITY: Extension scaffold complete. Compiling assets...' },
    { type: 'agent', msg: 'ANTIGRAVITY: Development phase success. Requesting review from CLAUDE.' },
    { type: 'system', msg: 'Handoff Triggered: ANTIGRAVITY → CLAUDE (Documentation Review)' }
];

socket.on("connect", () => {
    console.log("🛰️ Connected to Neural Uplink Simulator");

    let i = 0;
    const interval = setInterval(() => {
        if (i >= events.length) {
            console.log("✅ Simulation complete.");
            socket.disconnect();
            clearInterval(interval);
            return;
        }

        const event = {
            id: Date.now().toString(),
            ...events[i],
            timestamp: new Date().toLocaleTimeString()
        };

        console.log(`📤 Emitting: [${event.type}] ${event.msg}`);
        socket.emit("SYSTEM_EVENT", event);
        i++;
    }, 4000);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
});
