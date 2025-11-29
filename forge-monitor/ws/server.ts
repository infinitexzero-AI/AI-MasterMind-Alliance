import { WebSocketServer } from 'ws';
import { HeartbeatSimulator } from '../sim/heartbeat';

const sim = new HeartbeatSimulator();

export function startWSServer(port = 7077) {
  const wss = new WebSocketServer({ port });
  console.log('[WS] Forge Monitor WebSocket running on', port);

  function broadcast(type: string, payload: any) {
    const data = JSON.stringify({ type, payload, ts: Date.now() });
    wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); });
  }

  setInterval(() => {
    broadcast('agentStatus', sim.generateAgentStatus());
    broadcast('pipelineTelemetry', sim.generatePipelineTelemetry());
  }, 3000);

  return wss;
}

if (require.main === module) startWSServer();
