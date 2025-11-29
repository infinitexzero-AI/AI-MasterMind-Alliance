const WebSocket = require('ws');

function startWSServer(port = 7070) {
  const wss = new WebSocket.Server({ port });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

    const interval = setInterval(() => {
      ws.send(JSON.stringify({
        type: 'telemetry',
        status: 'ok',
        latency: Math.floor(40 + Math.random() * 10),
        timestamp: Date.now()
      }));
    }, 2000);

    ws.on('close', () => clearInterval(interval));
  });

  console.log(`Forge WS running on :${port}`);
  return wss;
}

if (require.main === module) startWSServer();

module.exports = { startWSServer };
