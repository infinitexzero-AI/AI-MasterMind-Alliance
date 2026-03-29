/**
 * Lightweight WS simulator for Forge Monitor telemetry.
 * Run with: ts-node forge-monitor/ws-server.ts
 */
import WebSocket, { Server } from 'ws';

const port = process.env.FORGE_WS_PORT ? Number(process.env.FORGE_WS_PORT) : 4001;
const wss = new Server({ port });

console.log(`Forge WS simulator listening on ws://localhost:\${port}`);

function broadcastSample() {
  const payload = {
    ts: new Date().toISOString(),
    agents: [
      { id: 'claude', status: 'ok', tasks: Math.floor(Math.random()*3) },
      { id: 'openai', status: 'warn', tasks: Math.floor(Math.random()*3) },
      { id: 'grok', status: 'ok', tasks: Math.floor(Math.random()*3) }
    ]
  };
  const data = JSON.stringify(payload);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  });
}
setInterval(broadcastSample, 2000);

wss.on('connection', (socket) => {
  console.log('client connected');
  socket.on('message', (msg) => {
    console.log('recv', msg.toString());
    socket.send(JSON.stringify({ echo: msg.toString(), ts: new Date().toISOString() }));
  });
});
