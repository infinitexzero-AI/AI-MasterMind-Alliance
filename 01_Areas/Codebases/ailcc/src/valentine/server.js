import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { createClient } from 'redis';

// Initialize Express App
const app = express();
const server = http.createServer(app);
const PORT = process.env.VALENTINE_PORT || 3002;

// Initialize Redis Client
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to dashboard domain
    methods: ["GET", "POST"]
  }
});

// Paths
// Paths
const BASE_DIR = '/Users/infinite27/AILCC_PRIME';
const SYNC_DIR = path.join(BASE_DIR, '.sync'); // Keep for legacy/internal state
const VAULT_DIR = path.join(BASE_DIR, '04_Intelligence_Vault');
const COMET_STATE_FILE = path.join(SYNC_DIR, 'comet-state.json');
const ANTIGRAVITY_STATE_FILE = path.join(SYNC_DIR, 'antigravity-state.json');

// Ensure sync directory exists
if (!fs.existsSync(SYNC_DIR)) {
  fs.mkdirSync(SYNC_DIR, { recursive: true });
}

// In-memory State
const systemState = {
  agents: [
    { id: 'antigravity', name: 'Antigravity', status: 'active', syncStrength: 100, color: '#06b6d4', message: 'Orchestrating UI Refinement', currentTask: 'Dashboard Optimization' },
    { id: 'comet', name: 'Comet', status: 'awaiting', syncStrength: 0, color: '#3b82f6', message: 'Waiting for sync...' },
    { id: 'gemini', name: 'Gemini', status: 'synced', syncStrength: 100, color: '#f59e0b', message: 'Primary Controller' },
    { id: 'claude', name: 'Claude', status: 'offline', syncStrength: 0, color: '#ef4444' },
    { id: 'chatgpt', name: 'ChatGPT', status: 'awaiting', syncStrength: 45, color: '#22c55e' }
  ],
  services: [
    { id: 'valentine', name: 'Valentine Core', status: 'healthy', health: 100 },
    { id: 'redis', name: 'Redis', status: 'healthy', health: 98 },
    { id: 'queue', name: 'Message Queue', status: 'healthy', health: 95 }
  ],
  storage: {
    icloud: { active: true, filesPerSec: 0, totalFiles: 0, synced: 0, lastSync: null },
    onedrive: { active: false, filesPerSec: 0, totalFiles: 0, synced: 0 }
  },
  tasks: [],
  logs: []
};

// File Watcher Logic for Comet
const watcher = chokidar.watch(COMET_STATE_FILE, {
  persistent: true,
  ignoreInitial: false
});

const handleCometUpdate = async (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    if (!data) return;

    const cometState = JSON.parse(data);
    console.log('✨ Received Comet State Update:', cometState);

    // Update internal state
    const cometAgent = systemState.agents.find(a => a.id === 'comet');
    if (cometAgent) {
      cometAgent.status = 'synced';
      cometAgent.syncStrength = cometState.syncStrength || 100;
      cometAgent.message = cometState.lastMessage || 'Synced via File Bridge';
      cometAgent.lastSeen = new Date().toISOString();
    }

    // Broadcast immediately
    io.emit('state:update', { type: 'agents', data: systemState.agents });
    io.emit('log', {
      type: 'success',
      message: `Comet Sync Received: ${cometState.lastMessage?.substring(0, 50)}...`,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('Error reading Comet state:', err);
  }
};

watcher
  .on('add', handleCometUpdate)
  .on('change', handleCometUpdate);

// Vault Watcher (iCloud Bridge)
const vaultWatcher = chokidar.watch(VAULT_DIR, {
  persistent: true,
  ignoreInitial: true, // Don't spam on startup
  followSymlinks: true, // IMPORTANT for iCloud Bridge
  depth: 5
});

// Initial File Count (Async)
async function countFiles(dir) {
  let count = 0;
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        count += await countFiles(path.join(dir, file.name));
      } else {
        count++;
      }
    }
  } catch (err) {
    console.error('Error counting files:', err);
  }
  return count;
}

// Watcher for iCloud Offload (Drop Zone)
// OFFLOAD_DIR removed as it was unused
// Using the path from previous step
const OFFLOAD_VOLUME_DIR = '/Volumes/XDriveAlpha/iCloud_Offload_2026_01_14';

if (!fs.existsSync(OFFLOAD_VOLUME_DIR)) {
  try { fs.mkdirSync(OFFLOAD_VOLUME_DIR, { recursive: true }); } catch (e) { /* ignore */ }
}

const offloadWatcher = chokidar.watch(OFFLOAD_VOLUME_DIR, {
  persistent: true,
  ignoreInitial: false,
  depth: 0
});

offloadWatcher.on('all', (event, _filepath) => {
  countFiles(OFFLOAD_VOLUME_DIR).then(count => {
    systemState.storage.icloud.pendingEvacuation = count;
    io.emit('state:update', { type: 'storage', data: systemState.storage });

    if (event === 'add') {
      io.emit('log', {
        type: 'success',
        message: `📥 Drop Detected: ${count} files pending.`,
        timestamp: new Date()
      });
    }
  });
});

vaultWatcher.on('all', (event, path) => {
  console.log(`[Vault] ${event}: ${path}`);
  systemState.storage.icloud.lastSync = new Date().toISOString();
  systemState.storage.icloud.filesPerSec = Math.floor(Math.random() * 10) + 1;

  countFiles(VAULT_DIR).then(count => {
    systemState.storage.icloud.totalFiles = count;
    io.emit('state:update', { type: 'storage', data: systemState.storage });
  });

  if (event === 'add' || event === 'change') {
    if (Math.random() > 0.7) {
      io.emit('log', {
        type: 'info',
        message: `Vault Sync: ${event} detected in ${path.split('/').pop()}`,
        timestamp: new Date()
      });
    }
  }
});

// Initialize file count
countFiles(VAULT_DIR).then(count => {
  console.log(`Initial Vault Scan: ${count} files identified.`);
  systemState.storage.icloud.totalFiles = count;
});


// WebSocket Logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial state
  socket.emit('state:full', systemState);

  // Handle heartbeats/pings
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Periodic Updates
setInterval(() => {
  // Decay activity
  if (systemState.storage.icloud.filesPerSec > 0) {
    systemState.storage.icloud.filesPerSec = Math.max(0, systemState.storage.icloud.filesPerSec - 1);
  }

  io.emit('state:update', { type: 'storage', data: systemState.storage });
}, 1000);

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Deep Semantic Health Check (For Sentinel Watchdog)
app.get('/health/deep', async (req, res) => {
  try {
    // 1. Check Redis Latency
    const start = Date.now();
    await redisClient.ping();
    const redisLatency = Date.now() - start;

    // 2. Check Node Memory
    const mem = process.memoryUsage();
    if (mem.heapUsed > 1.5 * 1024 * 1024 * 1024) { 
      throw new Error('Memory leak threshold breached (>1.5GB Heap)');
    }

    res.status(200).json({
      status: 'healthy',
      redisLatencyMs: redisLatency,
      memoryUsageMB: Math.round(mem.heapUsed / 1024 / 1024),
      vaultWatcherActive: vaultWatcher ? true : false
    });
  } catch (error) {
    console.error('[Health Deep] FAULT DETECTED:', error.message);
    res.status(503).json({ status: 'fault', error: error.message });
  }
});

// Broadcast Endpoint with Data Classification Enforcement
app.post('/api/broadcast', async (req, res) => {
  const { intent, payload, data_classification, isGeneratedCode } = req.body;

  // 1. The Hard Classifications Rule
  const VALID_TAGS = ['LOCAL_ONLY', 'CLOUD_OK', 'REDACTED'];
  if (!data_classification || !VALID_TAGS.includes(data_classification)) {
    console.error(`[Security] Rejected Payload: Missing valid data_classification`);
    return res.status(403).json({ error: 'Forbidden: Missing or invalid data_classification flag. Must be LOCAL_ONLY, CLOUD_OK, or REDACTED.' });
  }

  // 2. The Sandbox Enforcement for Singularity Engine
  let channel = 'live:broadcast';
  if (isGeneratedCode) {
    channel = 'staging:broadcast'; // Force to staging queue
  }

  try {
    const wrappedPayload = {
      intent,
      data_classification,
      payload,
      timestamp: Date.now()
    };
    await redisClient.publish(channel, JSON.stringify(wrappedPayload));
    res.json({ success: true, channel, message: 'Payload securely broadcasted' });
  } catch (error) {
    res.status(500).json({ error: 'Redis publish failed' });
  }
});

app.get('/api/agents', (req, res) => {
  res.json(systemState.agents);
});

// Endpoint to update Antigravity state (to be read by Comet)
app.post('/api/antigravity/state', (req, res) => {
  const { message, status } = req.body;
  const state = {
    timestamp: new Date().toISOString(),
    status: status || 'active',
    lastMessage: message || 'Update from Antigravity',
    systemHealth: 100
  };

  try {
    fs.writeFileSync(ANTIGRAVITY_STATE_FILE, JSON.stringify(state, null, 2));
    res.json({ success: true, message: 'Antigravity state written' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for Comet Browser to push state (Proxies to File Bridge)
app.post('/api/comet/state', (req, res) => {
  const { message, status, syncStrength, url } = req.body;
  const state = {
    lastMessage: message || 'Sync from Comet Browser',
    status: status || 'active',
    syncStrength: syncStrength || 100,
    currentUrl: url,
    timestamp: new Date().toISOString()
  };

  try {
    // Writing to the file triggers the watcher defined above
    fs.writeFileSync(COMET_STATE_FILE, JSON.stringify(state, null, 2));
    res.json({ success: true, message: 'Comet state synced to Valentine Bridge' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deploy', (req, res) => {
  const { serviceId } = req.body;
  console.log(`Deploy command received for: ${serviceId}`);
  // Simulate deployment logic
  io.emit('log', {
    type: 'info',
    message: `Deploy sequence initiated for ${serviceId}`,
    timestamp: new Date()
  });
  res.json({ success: true, message: 'Deployment initiated' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`❤️ Valentine Core online on port ${PORT}`);
  console.log(`Filesystem Watcher Active: ${SYNC_DIR}`);
});
