const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

// 1. Start Relay Server
console.log('Starting Relay Server...');
const relayPath = path.join(__dirname, '../server/relay.js');
const relay = spawn('node', [relayPath]);

relay.stdout.on('data', (data) => console.log(`[Relay]: ${data}`));
relay.stderr.on('data', (data) => console.error(`[Relay ERR]: ${data}`));

// Wait for server to start
setTimeout(() => {
    console.log('Connecting Agents...');

    // 2. Simulate Dashboard (Listener)
    const dashboard = new WebSocket('ws://localhost:3001');

    dashboard.on('open', () => {
        console.log('✅ Dashboard Connected');
    });

    dashboard.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log('📩 Dashboard Received:', msg);
        if (msg.type === 'PAGE_VISIT' && msg.url === 'https://example.com') {
            console.log('✅ SUCCESS: Bridge Verified!');
            process.exit(0);
        }
    });

    // 3. Simulate Comet Extension (Sender)
    const comet = new WebSocket('ws://localhost:3001');

    comet.on('open', () => {
        console.log('✅ Comet Extension Connected');
        const payload = JSON.stringify({
            type: 'PAGE_VISIT',
            url: 'https://example.com',
            timestamp: new Date().toISOString()
        });
        console.log('📤 Comet Sending:', payload);
        comet.send(payload);
    });

}, 2000);

// Timeout safety
setTimeout(() => {
    console.error('❌ TIMEOUT: Verification Failed');
    process.exit(1);
}, 10000);
