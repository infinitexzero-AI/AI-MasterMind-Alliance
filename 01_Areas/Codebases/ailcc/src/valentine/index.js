const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now (Dashboard is typically localhost:3000)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.VALENTINE_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// System State (In-Memory for now)
let systemStatus = {
  health: 100,
  layer: 'Connective Tissue',
  status: 'OPTIMAL',
  activeAgents: [],
  pendingTasks: []
};

// --- Routes ---

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Valentine Core',
    timestamp: new Date().toISOString(),
    system: systemStatus
  });
});

// Telemetry Endpoint (for agents to report in)
app.post('/telemetry/report', (req, res) => {
  const { agentId, status, load } = req.body;
  console.log(`[TELEM] Agent ${agentId} reported: ${status}`);
  // In a real DB, we'd save this. For now, just log and ack.
  
  // Update local state (simple toggle)
  if (!systemStatus.activeAgents.includes(agentId)) {
      systemStatus.activeAgents.push(agentId);
  }

  // Broadcast to dashboard via Socket.io
  io.emit('agent_update', { agentId, status, load, timestamp: new Date() });
  
  res.json({ received: true });
});

// --- Socket.io Handlers ---

io.on('connection', (socket) => {
  console.log('[SOCKET] Client connected:', socket.id);

  // Send initial state
  socket.emit('system_state', systemStatus);

  socket.on('disconnect', () => {
    console.log('[SOCKET] Client disconnected:', socket.id);
  });

  socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
  });
});

// --- Start Server ---

server.listen(PORT, () => {
  console.log(`
  💘 Valentine Core Online
  ----------------------
  PORT:    ${PORT}
  STATUS:  LISTENING
  MODE:    Connective Tissue
  ----------------------
  `);
});
