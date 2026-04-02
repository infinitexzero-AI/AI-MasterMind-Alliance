/* eslint-disable */
const WebSocket = require('ws');
const bus = require('../bus/messageBus');

function startWSServer(port = 3001) {
  // State Cache
  let systemState = {
    agents: [],
    telemetry: { cpu: 0, memory: 0, network: 0, status: 'INIT' },
    comet: {
      timestamp: Date.now(),
      traceId: 'INIT-000',
      mode6: { status: 'IDLE', stats: { total: 0, completed: 0 } },
      observability: { circuits: { github: { open: false }, linear: { open: false } } }
    },
    logs: []
  };

  const wss = new WebSocket.Server({ port });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

    // IMMEDIATE: Send Cached State
    if (systemState.agents.length > 0) {
      ws.send(JSON.stringify({ type: 'AGENT_ROSTER', payload: systemState.agents }));
    }
    ws.send(JSON.stringify({ type: 'COMET_STATUS', payload: systemState.comet }));
    
    // Send recent logs
    systemState.logs.slice(-10).forEach(log => {
      ws.send(JSON.stringify({ type: 'TASK_UPDATE', sender: 'SYSTEM', payload: log }));
    });

    const telemetryInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Mock Dynamic Telemetry
        const newTelemetry = {
          type: 'HEARTBEAT',
          payload: {
            cpu: Math.floor(20 + Math.random() * 15),
            memory: Math.floor(40 + Math.random() * 10),
            network: Math.floor(10 + Math.random() * 50),
            status: 'OPTIMAL'
          }
        };
        ws.send(JSON.stringify(newTelemetry));
      }
    }, 2000);

    bus.subscribe((cmd) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'command', cmd, ts: Date.now() }));
      }
    });

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);

        // UPDATE CACHE based on message type
        if (parsed.type === 'AGENT_ROSTER') systemState.agents = parsed.payload;
        if (parsed.type === 'COMET_STATUS') systemState.comet = parsed.payload;
        if (parsed.type === 'TASK_UPDATE') systemState.logs.push(parsed.payload);

        // Broadcast to all other clients
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });

        if (parsed.type === 'IDENTIFY') {
          console.log(`Client identified: ${parsed.payload.client}`);
        }
      } catch (e) {
        console.error('Error handling message:', e);
      }
    });

    ws.on('close', () => clearInterval(telemetryInterval));
  });

  // MOCK GENERATOR: Simulate Comet Task Processing
  setInterval(() => {
    // Only generate if we have basic state
    const currentTotal = systemState.comet.mode6?.stats?.total || 0;
    if (currentTotal < 40) { // Cap at 40 tasks
      const newTotal = currentTotal + 1;
      const completed = Math.floor(newTotal * 0.8);
      
      systemState.comet = {
        ...systemState.comet,
        timestamp: Date.now(),
        mode6: {
          status: 'ACTIVE',
          stats: {
            total: newTotal,
            completed: completed,
            active: newTotal - completed,
            failed: 0
          }
        }
      };

      // Broadcast update
      const updateMsg = JSON.stringify({ type: 'COMET_STATUS', payload: systemState.comet });
      wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) c.send(updateMsg);
      });
      
      console.log(`[AUTO-GEN] Comet Tasks: ${newTotal}`);
    }
  }, 3000); // New task every 3 seconds

  console.log("Forge WS + Bus running on", port);
  return wss;
}

if (require.main === module) startWSServer();
module.exports = { startWSServer };
