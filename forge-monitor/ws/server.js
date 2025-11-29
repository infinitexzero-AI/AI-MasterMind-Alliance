const WebSocket = require('ws');
const bus = require('../bus/messageBus');

function startWSServer(port = 7070) {
  const wss = new WebSocket.Server({ port });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

    const telemetryInterval = setInterval(() => {
      ws.send(JSON.stringify({
        type: 'telemetry',
        status: 'ok',
        latency: Math.floor(40 + Math.random() * 10),
        timestamp: Date.now()
      }));
    }, 2000);

    bus.subscribe((cmd) => {
      ws.send(JSON.stringify({ type: 'command', cmd, ts: Date.now() }));
    });

    ws.on('close', () => clearInterval(telemetryInterval));
  });

  console.log("Forge WS + Bus running on", port);
  return wss;
}

if (require.main === module) startWSServer();
module.exports = { startWSServer };
