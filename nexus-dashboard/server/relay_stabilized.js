const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const OpenAI = require('openai');
const chokidar = require('chokidar');
const os = require('os');

// --- SOVEREIGN OS RELAY CONFIGURATION ---
const AILCC_ROOT = process.env.AILCC_ROOT || '/Volumes/XDriveBeta/AILCC_PRIME';
const VAULT_PATH = process.env.AILCC_VAULT || path.join(AILCC_ROOT, '04_Intelligence_Vault');
const EVENT_BUS_LOG = path.join(AILCC_ROOT, '06_System/Logs/event_bus.jsonl');
const PORT = 5005;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
const cors = require('cors');
app.use(cors());

const SERVER_START_TIME = Date.now();

// --- LOGGING ---
console.log(`🚀 Launching Neural Relay (Hardened Mode) on Port ${PORT}...`);
console.log(`📂 AILCC_ROOT: ${AILCC_ROOT}`);
console.log(`📂 VAULT_PATH: ${VAULT_PATH}`);

// --- TELEMETRY BROADCAST ---
async function broadcastHeartbeat() {
  const uptimeMs = Date.now() - SERVER_START_TIME;
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  const uptimeStr = `${days}d ${hours}h ${minutes}m`;

  const cpus = os.cpus();
  const load = os.loadavg();
  const cpuUsage = Math.min(100, Math.round((load[0] / cpus.length) * 100));

  const status = {
    node: os.hostname(),
    status: 'online',
    uptime: uptimeStr,
    cpu: cpuUsage,
    memory: Math.round((1 - os.freemem() / os.totalmem()) * 100),
    timestamp: new Date().toISOString()
  };

  io.emit('NODE_HEARTBEAT', status);
}

setInterval(broadcastHeartbeat, 5000);

// --- API ENDPOINTS ---
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Neural Relay | Sovereign OS</title>
        <style>
          body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; padding: 2rem; border-radius: 1rem; background: #1e293b; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #334155; }
          h1 { color: #38bdf8; margin-bottom: 0.5rem; }
          p { color: #94a3b8; margin-bottom: 1.5rem; }
          a { display: inline-block; background: #38bdf8; color: #0f172a; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
          a:hover { background: #0ea5e9; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚡ Neural Relay Online</h1>
          <p>Sovereign OS Backend Core operational on Port 5005.</p>
          <a href="http://localhost:3007">Launch Nexus Dashboard</a>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/system/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - SERVER_START_TIME) / 1000)
  });
});

// --- SOCKET.IO HANDLERS ---
io.on('connection', (socket) => {
  console.log(`🔌 New Telemetry Connection: ${socket.id}`);
  broadcastHeartbeat();

  socket.on('disconnect', () => {
    console.log(`🔌 Client Disconnected: ${socket.id}`);
  });
});

// --- CHOKIDAR WATCHERS (DISABLED FOR STABILITY) ---
/*
if (fs.existsSync(VAULT_PATH)) {
  const vaultWatcher = chokidar.watch(VAULT_PATH, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    usePolling: true,
    interval: 5000,
    depth: 1
  });

  vaultWatcher.on('all', (event, filePath) => {
    const filename = path.basename(filePath);
    io.emit('VAULT_EVENT', { type: event.toUpperCase(), filename, timestamp: new Date().toISOString() });
  });
}
*/

server.listen(PORT, '0.0.0.0', () => {
  console.log(`--- RELAY CORE ONLINE ON PORT ${PORT} ---`);
});
