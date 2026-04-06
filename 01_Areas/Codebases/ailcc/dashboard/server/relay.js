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
const Redis = require('ioredis');
let McpServer, SSEServerTransport;

// --- Grok MCP SuperAssistant Infrastructure ---
let mcpServer;
let mcpTransport;

(async () => {
  try {
    const mcpModule = await import('@modelcontextprotocol/sdk/server/mcp.js');
    const sseModule = await import('@modelcontextprotocol/sdk/server/sse.js');
    McpServer = mcpModule.McpServer;
    SSEServerTransport = sseModule.SSEServerTransport;

    mcpServer = new McpServer({
      name: "AILCC Vanguard Bridge",
      version: "1.0.0"
    });

    // Tool: GENS-2101 Technical Synthesis
    mcpServer.tool("get_academic_context", "Retrieves high-fidelity technical data for GENS-2101 Test 3 (Forests, Water, Metabolism)", async () => {
      try {
        const guidePath = path.join('c:/Users/infin/AILCC_PRIME', '02_Resources/Academics/GENS-2101/GENS2101_Test3_Focused_Guide.md');
        const content = fs.readFileSync(guidePath, 'utf8');
        return {
          content: [{ type: "text", text: content }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error reading context: ${err.message}` }],
          isError: true
        };
      }
    });

    // Tool: System Telemetry
    mcpServer.tool("get_vanguard_telemetry", "Returns current mesh node status and hardware telemetry", async () => {
        const history = await redis.lrange(TELEMETRY_KEY, 0, 5);
        return {
            content: [{ type: "text", text: JSON.stringify(history.map(h => JSON.parse(h)), null, 2) }]
        };
    });

    console.log("🚀 [MCP] Neural Bridge Initialized");
  } catch (err) {
    console.error("❌ [MCP] Failed to initialize neural bridge:", err);
  }
})();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3
});

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false
});

redis.on('error', (err) => console.error('❌ Redis Error:', err));
redis.on('connect', () => console.log('⚡ Connected to Redis Persistent Core'));

redisSubscriber.on('error', (err) => {
    if (!err.message.includes('subscriber mode')) {
        console.error('❌ Redis Subscriber Error:', err);
    }
});

redisSubscriber.on('connect', () => {
    console.log('⚡ Connected Redis Subscriber to core streams');
    redisSubscriber.subscribe('NEURAL_SYNAPSE', 'GLOBAL_CONTEXT_ARRAY', (err) => {
        if (err) console.error('❌ Failed to subscribe:', err);
    });
});

redisSubscriber.on('message', (channel, message) => {
    if (channel === 'NEURAL_SYNAPSE') {
        try {
            const data = JSON.parse(message);
            if (data.intent === 'TASK_PROGRESS_UPDATE') {
                io.emit('TASK_PROGRESS_UPDATE', data);
            } else if (data.intent === 'FORCE_UI_SYNC') {
                broadcastTasks(); 
            } else if (data.type === 'HARDWARE_TELEMETRY' || data.type === 'NOW_PLAYING') {
                io.emit(data.type, data.payload);
            }
        } catch (e) {
            // Ignore parse errors from generic bus chatter
        }
    } else if (channel === 'GLOBAL_CONTEXT_ARRAY') {
        try {
            const data = JSON.parse(message);
            io.emit('GLOBAL_CONTEXT_ARRAY', data);
        } catch (e) {
            console.error('❌ Broadcast Error on GLOBAL_CONTEXT_ARRAY:', e);
        }
    }
});

const AILCC_ROOT = process.env.AILCC_ROOT || path.join(os.homedir(), 'AILCC_PRIME');
const EVENT_BUS_LOG = path.join(AILCC_ROOT, '06_System/Logs/event_bus.jsonl');
const REGISTRY_FILE = path.join(AILCC_ROOT, '01_Areas/Codebases/ailcc/registries/agents_registry.json');
const CONSOLIDATED_TASKS_FILE = path.join(AILCC_ROOT, 'tasks/consolidated_task_registry.json');
const STATE_FILE = path.join(__dirname, '../../dashboard_state.json');

// Vault Path: Dynamic alignment with ThinkPad/MacBook patterns
const VAULT_PATH = os.platform() === 'win32' 
    ? path.join(AILCC_ROOT, 'AILCC_VAULT')
    : '/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT';

const ACADEMIC_MATRIX_FILE = path.join(AILCC_ROOT, '01_Areas/Codebases/ailcc/hippocampus_storage/academic_matrix/current_semester.json');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const BROWSER_SERVER = 'http://localhost:3333';
const cors = require('cors');
const SERVER_START_TIME = Date.now();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json()); // Ensure JSON parsing is enabled
app.use(cors());

// --- Sovereign Telemetry Core ---
const TELEMETRY_KEY = 'ailcc:telemetry:runs';

app.post('/api/system/telemetry', async (req, res) => {
  const event = req.body;
  if (event.type === 'XBOX_PRESENCE') {
    io.emit('XBOX_PRESENCE', event.data);
    await redis.set('ailcc:vanguard:xbox_presence', JSON.stringify(event.data));
    console.log(`📡 [Xbox Vanguard] ${event.data.online ? 'ONLINE' : 'OFFLINE'} | ${event.data.title}`);
    return res.status(202).json({ status: 'broadcasted' });
  }
  return res.status(400).json({ error: 'Unknown telemetry type' });
});

app.post('/api/telemetry/log', async (req, res) => {
  const event = req.body;
  if (!event.run_id || !event.type) {
    return res.status(400).json({ error: 'Invalid telemetry event' });
  }

  const logEntry = {
    ...event,
    id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: event.timestamp || new Date().toISOString()
  };

  try {
    // Persist to Redis list for history (capped at 1000 items)
    await redis.lpush(TELEMETRY_KEY, JSON.stringify(logEntry));
    await redis.ltrim(TELEMETRY_KEY, 0, 999);

    // Broadcast to dashboard
    io.emit('TELEMETRY_EVENT', logEntry);
    res.status(202).json({ status: 'logged', id: logEntry.id });
  } catch (err) {
    console.error('❌ Telemetry Logging failed:', err);
    res.status(500).json({ error: 'Internal logging error' });
  }
});

app.get('/api/telemetry/history', async (req, res) => {
  try {
    const history = await redis.lrange(TELEMETRY_KEY, 0, 100);
    res.json(history.map(h => JSON.parse(h)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});


const multibar = new cliProgress.MultiBar({
  format: '{agent} |{bar}| {percentage}% | {value}/{total} Tasks',
  hideCursor: true,
  clearOnComplete: false
}, cliProgress.Presets.shades_classic);

const bars = {
  comet: multibar.create(100, 0, { agent: '🌠 Comet     ' }),
  antigravity: multibar.create(100, 0, { agent: '🌀 Anti-Grav' }),
  judge: multibar.create(100, 0, { agent: '⚖️  Judge     ' }),
  gemini: multibar.create(100, 0, { agent: '💎 Gemini    ' })
};

const agentProgress = {
  comet: 0,
  antigravity: 0,
  judge: 0,
  gemini: 0
};

let agentsRegistry = { agents: [] };

function loadRegistry() {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
      agentsRegistry = JSON.parse(data);
      console.log('📖 Agents Registry loaded.');
      broadcastRoster();
    }
  } catch (err) {
    console.error('❌ Failed to load registry:', err);
  }
}

function broadcastRoster() {
  const payload = agentsRegistry.agents.map(a => ({
    name: a.name,
    role: a.role,
    status: 'idle',
    currentTask: 'Awaiting directive',
    metrics: { tasksCompleted: 0, successRate: 1.0, latency: 0 }
  }));
  io.emit('AGENT_ROSTER', payload);
}

async function loadState() {
  try {
    const state = await redis.hgetall('ailcc:state');
    if (Object.keys(state).length > 0) {
      if (state.agentProgress) {
        Object.assign(agentProgress, JSON.parse(state.agentProgress));
      }
      console.log('✅ Dashboard state loaded from Redis.');
    } else if (fs.existsSync(STATE_FILE)) {
      // Migration from file to Redis
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      const fileState = JSON.parse(data);
      Object.assign(agentProgress, fileState.agents || {});
      await saveState();
      console.log('🚚 Migrated dashboard state from file to Redis.');
    }
  } catch (err) {
    console.error('❌ Failed to load dashboard state from Redis:', err);
  }
}

async function saveState() {
  try {
    await redis.hset('ailcc:state', 'agentProgress', JSON.stringify(agentProgress));
    await redis.hset('ailcc:state', 'lastUpdate', new Date().toISOString());
  } catch (err) {
    console.error('❌ Failed to save dashboard state to Redis:', err);
  }
}

function updateProgress(agent, value) {
  if (bars[agent]) {
    bars[agent].update(value);
    agentProgress[agent] = value;
    saveState();
    io.emit('AGENT_PROGRESS', { agent, value });
  }
}

async function synthesizeNarrative(details) {
  if (!process.env.OPENAI_API_KEY) {
    return { narrative: "AI Synthesis unavailable.", why: "Missing API Bridge." };
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are the Executive Narrative Engine. Provide a one-sentence 'narrative' and a 'why' (strategic rationale) in JSON format for the provided task details."
        },
        { role: "user", content: details }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    return { narrative: "Manual synthesis required.", why: "Bridge latency or error." };
  }
}


async function broadcastTasks() {
  try {
    if (fs.existsSync(CONSOLIDATED_TASKS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONSOLIDATED_TASKS_FILE, 'utf8'));
      let tasks = data.registry || [];

      // Proactive Narrative Synthesis for new/live tasks (API Flood Protection)
      let pendingTasks = tasks.filter(t => !t.narrative || t.narrative.includes('Synced'));
      
      // Strict Concurrency Cap: Max 5 API calls per 60s broadcast window to prevent thread starvation
      let synthesisBatch = pendingTasks.slice(0, 5);
      if (synthesisBatch.length > 0) {
          await Promise.all(synthesisBatch.map(async t => {
              const synthesis = await synthesizeNarrative(`Directive: ${t.title} (Priority: ${t.priority})`);
              Object.assign(t, synthesis);
          }));
      }

      io.emit('TASK_UPDATE', tasks);
      console.log('📡 Broadcasted consolidated tasks matrix.');

      // Persist state
      fs.writeFileSync(STATE_FILE, JSON.stringify({ tasks, lastSync: new Date().toISOString() }, null, 2));
    }
  } catch (err) {
    console.error('❌ Failed to broadcast tasks:', err);
  }
}

app.use(express.json());

// API: Search Intelligence Vault
app.get('/api/scholar/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  if (!fs.existsSync(VAULT_PATH)) return res.json([]);

  try {
    const files = fs.readdirSync(VAULT_PATH);
    const results = files
      .filter(f => f.endsWith('.json') || f.endsWith('.md'))
      .map(f => {
        const fullPath = path.join(VAULT_PATH, f);
        const stats = fs.statSync(fullPath);
        let score = 0.5; // Baseline
        if (f.toLowerCase().includes(query)) score += 0.3;

        return {
          document: f,
          score: Math.min(score, 1.0),
          timestamp: stats.mtime.toISOString().split('T')[0]
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// API: Log Skill Drill to Vault
app.post('/api/scholar/log-drill', (req, res) => {
  const drillData = req.body;
  const filename = `drill_${drillData.skill_id}_${Date.now()}.json`;
  const fullPath = path.join(VAULT_PATH, 'Scholar', filename);

  if (!fs.existsSync(path.join(VAULT_PATH, 'Scholar'))) {
    fs.mkdirSync(path.join(VAULT_PATH, 'Scholar'), { recursive: true });
  }

  const payload = {
    ...drillData,
    agent: 'RELAY_MASTER',
    source: 'UX_SKILL_UPLINK',
    indexed: true
  };

  try {
    fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2));
    io.emit('SYSTEM_EVENT', {
      id: `drill-${Date.now()}`,
      type: 'success',
      msg: `🧠 Parallel Mastery archived: ${drillData.skill_name} drill synced to Vault.`,
      timestamp: new Date().toLocaleTimeString()
    });
    res.json({ status: 'success', path: fullPath });
  } catch (err) {
    console.error('❌ Failed to log drill:', err);
    res.status(500).json({ error: 'Vault write failed' });
  }
});

// API: Trigger Audit
app.post('/api/scholar/audit', (req, res) => {
  const { exec } = require('child_process');
  const scriptPath = '/Users/infinite27/AILCC_PRIME/06_System/Execution/scholar_intel_sync.py';

  exec(`python3 ${scriptPath}`, (error, stdout, _stderr) => {
    if (error) {
      console.error(`Audit error: ${error}`);
      return res.status(500).json({ status: 'error', message: error.message });
    }
    res.json({ status: 'success', output: stdout });
  });
});

// API: System Health Check (for OpenClaw)
app.get('/api/system/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
    tier: 'SOVEREIGN',
    redis: redis.status === 'ready' ? 'CONNECTED' : 'LOCAL_ONLY'
  });
});

// API: iOS Concise Health Check (for Apple Shortcuts)
app.get('/api/mobile/health', async (req, res) => {
  const { execSync } = require('child_process');
  let diskFree = "Unknown";
  try {
    diskFree = execSync("df -h / | tail -1 | awk '{print $4}'", { encoding: 'utf8' }).trim();
  } catch (e) {
    // Ignore error and fall back to "Unknown"
  }

  res.json({
    status: 'OPTIMAL',
    disk: diskFree,
    docker: getDockerStatus(),
    redis: redis.status === 'ready' ? 'OK' : 'ERR',
    timestamp: new Date().toLocaleTimeString()
  });
});

function getDockerStatus() {
  const { execSync } = require('child_process');
  try {
    // Check if key containers are up
    const running = execSync("/usr/local/bin/docker ps --format '{{.Names}}'", { encoding: 'utf8' }).trim().split('\n');
    const essential = ['hippocampus-api', 'hippocampus-redis', 'nexus-dashboard', 'valentine-core'];
    const missing = essential.filter(name => !running.includes(name));
    
    return missing.length === 0 ? 'HEALTHY' : `DEGRADED (Missing: ${missing.join(', ')})`;
  } catch (e) {
    return 'UNAVAILABLE';
  }
}

// API: iOS Telemetry Bridge (NEW)
app.post('/api/mobile/telemetry', async (req, res) => {
  const { type, data, context } = req.body;
  const timestamp = new Date().toISOString();

  console.log(`📡 Mobile Telemetry Received: ${type}`);

  // 1. Log to Event Bus
  const logEntry = JSON.stringify({ timestamp, type: `TELEMETRY_${type.toUpperCase()}`, data, context }) + '\n';
  try {
    fs.appendFileSync(EVENT_BUS_LOG, logEntry);

    // 2. Broadcast to Dashboard
    io.emit('MOBILE_TELEMETRY', { type, data, context, timestamp });

    // 3. Update Redis State
    await redis.hset('ailcc:mobile:state', type, JSON.stringify({ data, context, timestamp }));

    // 4. Voice Drop Integration (Specialized handling)
    if (type === 'voice_note' || (data && data.is_voice)) {
      const { exec } = require('child_process');
      const text = data.text || data;
      const scriptPath = '/Users/infinite27/AILCC_PRIME/scripts/mobile_voice_drop.py';
      const safeText = text.replace(/"/g, '\\"');
      exec(`python3 ${scriptPath} "${safeText}" '${JSON.stringify(context || {})}'`, (err) => {
        if (err) console.error('❌ Voice search failed:', err);
      });
    }

    res.json({ status: 'success', message: 'Telemetry ingested' });
  } catch (err) {
    console.error('❌ Failed to ingest mobile telemetry:', err);
    res.status(500).json({ status: 'error', message: 'Ingestion failure' });
  }
});

// API: iOS Morning Briefing (Summarized State)
app.get('/api/mobile/briefing', async (req, res) => {
  try {
    const tasksData = fs.existsSync(CONSOLIDATED_TASKS_FILE)
      ? JSON.parse(fs.readFileSync(CONSOLIDATED_TASKS_FILE, 'utf8'))
      : { registry: [] };

    const { execSync } = require('child_process');
    let strategicInsight = "Synthesis pending...";
    try {
      strategicInsight = execSync('python3 /Users/infinite27/AILCC_PRIME/06_System/Execution/strategic_briefing_gen.py', { encoding: 'utf8' }).trim();
    } catch (e) {
      console.error('❌ Strategic Synthesis Failed:', e);
    }

    const briefing = {
      timestamp: new Date().toISOString(),
      mission_status: "Phase XVI: 5%",
      critical_alerts: [],
      next_directives: tasksData.registry.slice(0, 3).map(t => ({ title: t.title, priority: t.priority })),
      scholar_update: "HLTH-1011 Final Report Prepared",
      strategic_insight: strategicInsight,
      habits: strategicInsight.includes('Focus Habits Today')
        ? strategicInsight.split('Focus Habits Today')[1].split('**Directive**')[0].trim().split('\n').map(h => h.replace('- ', '').trim()).filter(h => h)
        : []
    };

    res.json(briefing);
  } catch (err) {
    res.status(500).json({ error: 'Briefing synthesis failed' });
  }
});

// API: Comet Heartbeat (for health checks)
app.get('/api/comet/heartbeat', (req, res) => {
  res.json({
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    agent: 'RELAY_MASTER'
  });
});

// API: Medical CanMEDS Tracker Local Proxy
app.get('/api/medical/canmeds', async (req, res) => {
  try {
    const rawState = await redis.hget('ailcc:medical:state', 'canmeds_hours');
    if (rawState) {
      res.json(JSON.parse(rawState));
    } else {
      res.json({ "Professional": 0, "Communicator": 0, "Collaborator": 0, "Leader": 0, "Health Advocate": 0 });
    }
  } catch (err) {
    console.error('❌ Failed to fetch CanMEDS state:', err);
    res.status(500).json({ error: 'Failed to access local state array' });
  }
});

// API: Semantic Heat-Map Data
app.get('/api/hippocampus/heatmap', async (req, res) => {
  try {
    const memories = await redis.hgetall('ailcc:memories') || {};
    const coords = Object.values(memories).map(m => {
      const parsed = JSON.parse(m);
      return { x: parsed.x, y: parsed.y, weight: parsed.importance || 0.5 };
    });
    res.json(coords);
  } catch (err) {
    res.status(500).json({ error: 'Heatmap aggregation failed' });
  }
});

app.get('/api/sync', async (req, res) => {
  try {
    await broadcastTasks();
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cross-Platform Clipboard Sync (Phase 27)
app.post('/api/system/clipboard', async (req, res) => {
  const { action, text, source } = req.body;
  if (!action) return res.status(400).json({ error: 'Action required' });

  try {
    if (action === 'set') {
      console.log(`📡 LocalDrop Clipboard Set Received from: ${source}`);
      // 1. Persist to Redis
      await redis.hset('ailcc:state', 'clipboard', text);
      
      // 2. Broadcast to all clients (Socket.io)
      io.emit('CLIPBOARD_SYNC', { text, source, timestamp: new Date().toISOString() });
      res.json({ status: 'broadcasted' });
      
    } else if (action === 'get') {
      const current = await redis.hget('ailcc:state', 'clipboard');
      res.json({ text: current || '' });
    } else {
       res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error('❌ Clipboard sync failed:', err);
    res.status(500).json({ error: 'Clipboard sync failed' });
  }
});

// API: Cross-Device View Sync (Mirror Mode)
app.post('/api/system/sync-view', async (req, res) => {
  const { path } = req.body;
  if (!path) return res.status(400).json({ error: 'Path is required' });

  try {
    await redis.hset('ailcc:state', 'activePath', path);
    io.emit('VIEW_SYNCED', { path, timestamp: new Date().toISOString() });
    res.json({ status: 'success', path });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.get('/api/system/active-view', async (req, res) => {
  try {
    const path = await redis.hget('ailcc:state', 'activePath');
    res.json({ path: path || '/' });
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// API: Orchestrator Daemon Spawning (Phase 33)
app.post('/api/system/agents/spawn', async (req, res) => {
  const { agent_name, script_path, args } = req.body;
  if (!agent_name || !script_path) {
    return res.status(400).json({ error: 'agent_name and script_path are required' });
  }

  try {
    const intent = {
      intent: 'SPAWN_AGENT',
      agent_name,
      script_path,
      args: args || [],
      timestamp: new Date().toISOString()
    };
    
    await redis.publish('NEURAL_SYNAPSE', JSON.stringify(intent));
    console.log(`📡 Broadcasted intent to SPAWN_AGENT: ${agent_name}`);
    res.json({ status: 'intent_broadcasted', agent_name });
  } catch (err) {
    console.error('❌ Failed to broadcast SPAWN_AGENT intent:', err);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

app.post('/api/system/agents/kill', async (req, res) => {
  const { pid } = req.body;
  if (!pid) return res.status(400).json({ error: 'pid is required' });

  try {
    const intent = {
      intent: 'KILL_AGENT',
      pid,
      timestamp: new Date().toISOString()
    };
    
    await redis.publish('NEURAL_SYNAPSE', JSON.stringify(intent));
    console.log(`📡 Broadcasted intent to KILL_AGENT PID: ${pid}`);
    res.json({ status: 'intent_broadcasted', pid });
  } catch (err) {
    console.error('❌ Failed to broadcast KILL_AGENT intent:', err);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

app.get('/api/system/agents/active', async (req, res) => {
  try {
    const agentsJson = await redis.get('ailcc:system:orchestrator:active_agents');
    res.json(agentsJson ? JSON.parse(agentsJson) : {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active agents' });
  }
});

// API: Global System Command Routing (Phase 13)
app.post('/api/system/command', async (req, res) => {
  const { command, data } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });

  console.log(`📡 System Command Received: ${command}`);

  try {
    // 1. Broadcast to all clients
    io.emit('SYSTEM_COMMAND', { command, data, timestamp: new Date().toISOString() });

    // 2. Log to event bus
    const logEntry = JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      type: 'SYSTEM_COMMAND', 
      command, 
      data 
    }) + '\n';
    fs.appendFileSync(EVENT_BUS_LOG, logEntry);

    // 3. Situational Feedback
    const { exec } = require('child_process');
    if (command === 'SWARM_OPTIMIZE') {
      exec('say -v Samantha "System optimization directive received. Purging redundant telemetry."');
    }

    res.json({ status: 'dispatched', command });
  } catch (err) {
    res.status(500).json({ error: 'Command dispatch failed' });
  }
});

// API: Neural Synapse (High-Fidelity Agent Intents)
app.post('/api/system/synapse', async (req, res) => {
  const { agent, intent, confidence, risk_reward, domain } = req.body;
  if (!agent || !intent) return res.status(400).json({ error: 'Agent and Intent are required' });

  const synapse = {
    id: `syn-${Date.now()}`,
    agent,
    intent,
    confidence: confidence || 0.5,
    risk_reward: risk_reward || "NEUTRAL",
    domain: domain || "GENERAL",
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Broadcast to all clients
    io.emit('NEURAL_SYNAPSE', synapse);

    // 2. Log to event bus
    const logEntry = JSON.stringify({ 
      timestamp: synapse.timestamp, 
      type: 'NEURAL_SYNAPSE', 
      ...synapse 
    }) + '\n';
    fs.appendFileSync(EVENT_BUS_LOG, logEntry);

    res.json({ status: 'broadcasted', id: synapse.id });
  } catch (err) {
    res.status(500).json({ error: 'Synapse broadcast failed' });
  }
});

// API: Antigravity Command Channel Bridge
app.post('/api/antigravity/execute', (req, res) => {
  const { command, payload } = req.body;

  if (!command) {
    return res.status(400).json({ status: 'error', message: 'Command is required' });
  }

  // 1. Broadcast the command over WebSocket for any connected interactive agents
  io.emit('ANTIGRAVITY_COMMAND', {
    command,
    payload,
    timestamp: new Date().toISOString()
  });

  // 2. Also log it to the event bus for persistence / asynchronous agents
  const logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ANTIGRAVITY_COMMAND',
    command,
    payload
  }) + '\n';

  try {
    fs.appendFileSync(EVENT_BUS_LOG, logEntry);
    res.json({ status: 'success', message: `Command '${command}' broadcasted across the Overlink` });
  } catch (err) {
    console.error('❌ Failed to log command to Event Bus:', err);
    res.status(500).json({ status: 'error', message: 'Failed to persist command' });
  }
});

// Stream B: Chrome Side-Cart Research Relay
app.post('/api/chrome/research', async (req, res) => {
  const { url, extractionGoal } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Forward to Playwright server for extraction
    const nodeFetch = require('node-fetch');
    const actions = [
      { action: 'navigate', url },
      { action: 'wait', ms: 2000 },
      { action: 'extract', selector: 'body' }
    ];

    const response = await nodeFetch(`${BROWSER_SERVER}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions })
    });

    const result = await response.json();

    // Emit research event to Neural Stream
    io.emit('SYSTEM_EVENT', {
      id: `research-${Date.now()}`,
      type: 'system',
      msg: `🔍 Chrome Side-Cart extracted from ${url.slice(0, 50)}...`,
      timestamp: new Date().toLocaleTimeString()
    });

    // Save extraction to vault
    const filename = `research_chrome_${Date.now()}.json`;
    const fullPath = path.join(VAULT_PATH, filename);
    fs.writeFileSync(fullPath, JSON.stringify({
      agent: 'COMET',
      source: 'CHROME_SIDECART',
      url,
      extractionGoal,
      data: result,
      timestamp: new Date().toISOString()
    }, null, 2));

    res.json({ status: 'success', extraction: result, vaultPath: fullPath });
  } catch (err) {
    console.error('❌ Chrome Side-Cart Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Comet & Gemini ingestion handlers (existing)
app.post('/api/comet/ingest', (req, res) => {
  const { source, data, topic } = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });

  const filename = `research_${topic || 'general'}_${Date.now()}.json`;
  const fullPath = path.join(VAULT_PATH, filename);
  const payload = { agent: 'COMET', timestamp: new Date().toISOString(), source, topic, data };

  try {
    fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2));
    io.emit('VAULT_UPDATE', { filename, agent: 'COMET', topic: topic || 'unsorted' });
    res.status(201).json({ status: 'success', path: fullPath });
  } catch (err) {
    res.status(500).json({ error: 'FileSystem Error' });
  }
});

app.post('/api/gemini/report', (req, res) => {
  const { branch, directive, status, pr_url } = req.body;
  io.emit('CODING_TASK_REPORT', { agent: 'GEMINI', branch, directive, status, pr_url, timestamp: new Date().toISOString() });
  if (status === 'SUCCESS') updateProgress('gemini', 100);
  res.status(200).json({ status: 'reported' });
});

io.on('connection', (socket) => {
  console.log('🔗 Client connected to Neural Uplink');
  broadcastRoster();
  broadcastTasks(); // Initial task sync
  socket.on('disconnect', () => console.log('❌ Client disconnected'));
});

// --- CHOKIDAR EVENT-DRIVEN SYNC (Centurion Tier) ---

// 1. Vault Watcher: Sovereign Results & Node Heartbeats
const vaultWatcher = chokidar.watch(VAULT_PATH, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  depth: 2 // Increased depth to capture project updates
});

// Watch for The Judge v2.0 verdicts
const JUDGE_VERDICT_LOG = '/Users/infinite27/AILCC_PRIME/06_System/Logs/the_judge_verdict.jsonl';
if (fs.existsSync(JUDGE_VERDICT_LOG)) {
  const judgeWatcher = chokidar.watch(JUDGE_VERDICT_LOG, { persistent: true });
  judgeWatcher.on('change', () => {
    try {
      const data = fs.readFileSync(JUDGE_VERDICT_LOG, 'utf8').trim().split('\n');
      const lastLine = data[data.length - 1];
      if (lastLine) {
        const verdict = JSON.parse(lastLine);
        io.emit('SYSTEM_EVENT', {
          id: `judge-${Date.now()}`,
          type: verdict.severity === 'HIGH' || verdict.severity === 'CRITICAL' ? 'error' : 'warning',
          msg: `⚖️ [The Judge] ${verdict.msg}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (e) { /* skip */ }
  });
}

vaultWatcher.on('add', (filePath) => {
  const filename = path.basename(filePath);

  // Handle Sovereign Synthesis Results
  if (filename.startsWith('result_') && filename.endsWith('.json')) {
    try {
      const result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`📡 Sovereign Synthesis Result: ${result.task_id}`);
      io.emit('SYSTEM_EVENT', {
        id: 'sovereign-' + Date.now(),
        msg: `💠 Sovereign Synthesis Complete: ${result.result}`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString()
      });

      // Valentine Situational Voice Alert (Victoria for Whisper, Samantha for Alert)
      const { exec } = require('child_process');
      exec('say -v Victoria -r 150 "Background synthesis complete. Data indexed."'); // Whisper

      // Cleanup
      fs.unlinkSync(filePath);
    } catch (e) { /* skip */ }
  }

  // Handle Dynamic Node Discovery (Heartbeats)
  if (filename.startsWith('status_') && filename.endsWith('.json')) {
    broadcastHeartbeat();
  }

  // Instant broadcast for any vault addition (Distributed Sync 2.0)
  io.emit('VAULT_EVENT', { type: 'ADD', filename, timestamp: new Date().toISOString() });
});

vaultWatcher.on('change', (filePath) => {
  const filename = path.basename(filePath);
  io.emit('VAULT_EVENT', { type: 'CHANGE', filename, timestamp: new Date().toISOString() });
});

vaultWatcher.on('unlink', (filePath) => {
  const filename = path.basename(filePath);
  io.emit('VAULT_EVENT', { type: 'REMOVE', filename, timestamp: new Date().toISOString() });
});

// 2. Event Bus Watcher
if (fs.existsSync(EVENT_BUS_LOG)) {
  const busWatcher = chokidar.watch(EVENT_BUS_LOG, { persistent: true });
  busWatcher.on('change', () => {
    try {
      const data = fs.readFileSync(EVENT_BUS_LOG, 'utf8').trim().split('\n');
      const lastLine = data[data.length - 1];
      if (lastLine) {
        const event = JSON.parse(lastLine);
        console.log(`📡 Event Bus Relay: [${event.type}]`);
        io.emit('SYSTEM_EVENT', event);
      }
    } catch (err) {
      console.error('❌ Event relay error:', err);
    }
  });
}

// 3. Forge Sandbox Watcher (Phase 22)
const SANDBOX_LOGS = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/logic_sandbox/logs';
if (fs.existsSync(SANDBOX_LOGS)) {
  const sandboxWatcher = chokidar.watch(SANDBOX_LOGS, { 
    ignored: /(^|[/\\])\../,
    persistent: true 
  });
  sandboxWatcher.on('add', (filePath) => {
    if (filePath.endsWith('.json')) {
      try {
        const log = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`🔨 Forge Synthesis Detected: ${log.logic_name}`);
        
        const synapse = {
          agent: 'THE_FORGE',
          intent: 'LOGIC_SYNTHESIS_COMPLETE',
          confidence: 1.0,
          domain: 'LOGIC',
          details: { 
            name: log.logic_name, 
            status: log.status, 
            output_snippet: log.output?.substring(0, 200) 
          },
          timestamp: log.timestamp
        };
        
        io.emit('NEURAL_SYNAPSE', synapse);
        io.emit('FORGE_EVENT', log);
      } catch (e) { /* skip */ }
    }
  });
}

async function broadcastHeartbeat() {
  const uptimeMs = Date.now() - SERVER_START_TIME;
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  const uptimeStr = `${days}d ${hours}h ${minutes}m`;

  // Real CPU Load Calculation
  const cpus = os.cpus();
  const load = os.loadavg();
  const cpuUsage = Math.min(100, Math.round((load[0] / cpus.length) * 100));

  // Fetch Redis Namespaces
  const memories = await redis.keys("*:*");
  const namespaces = {};
  memories.forEach(m => {
    const ns = m.split(":")[0];
    namespaces[ns] = (namespaces[ns] || 0) + 1;
  });

  // Simulated Thermals based on load & platform (SMC Monitor Proxy)
  const thermalProxy = Math.round(35 + (cpuUsage * 0.4));

  let vanguardNodes = [];
  try {
    if (fs.existsSync(VAULT_PATH)) {
      const files = fs.readdirSync(VAULT_PATH);
      vanguardNodes = files
        .filter(f => f.startsWith('status_') && f.endsWith('.json'))
        .map(f => {
          try {
            const filePath = path.join(VAULT_PATH, f);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const stats = fs.statSync(filePath);
            
            // Allow 3 minutes of offline buffer before declaring node dead
            const isStale = (Date.now() - stats.mtimeMs) > 180000; 
            return { ...content, status: isStale ? 'offline' : 'online' };
          } catch (e) { return null; }
        }).filter(n => n !== null);
    }
  } catch (e) { /* skip */ }

  io.emit('HEARTBEAT', {
    cpu: cpuUsage,
    memory: Math.round((1 - os.freemem() / os.totalmem()) * 100),
    namespaces: namespaces,
    network: Math.floor(Math.random() * 80),
    thermal: thermalProxy,
    status: cpuUsage > 80 ? 'HIGH_PRESSURE' : 'OPTIMAL',
    uptime: uptimeStr,
    agents: agentProgress,
    vanguard: vanguardNodes
  });
}

// Periodic Heartbeat (for general telemetry update)
setInterval(broadcastHeartbeat, 10000);

// Global Health Pulse (60s broadcast for dashboard grid)
setInterval(async () => {
  const { execSync } = require('child_process');
  try {
    const diskFree = execSync("df -h / | tail -1 | awk '{print $4}'", { encoding: 'utf8' }).trim();
    io.emit('SYSTEM_EVENT', {
      id: `pulse-${Date.now()}`,
      type: 'info',
      msg: `🛰️ Global Health Pulse: SSD Free: ${diskFree} | Docker: ${getDockerStatus()}`,
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (e) {
    // Ignore error and skip pulse update
  }
}, 60000);

// Centurion Task 5: Intelligence Vault indexing (Thermal-Aware Delegation)
const FOUR_HOURS = 4 * 60 * 60 * 1000;
setInterval(async () => {
  const load = os.loadavg();
  const cpuUsage = Math.min(100, Math.round((load[0] / os.cpus().length) * 100));
  const thermalProxy = Math.round(35 + (cpuUsage * 0.4)); // Simulated or real sensor proxy

  console.log(`📦 Pulse: Checking Indexing Schedule... [Thermal: ${thermalProxy}°C]`);

  if (thermalProxy > 75) {
    console.log('🔥 MacBook High Pressure Detected. Offloading Indexing to ThinkPad Node...');
    const task = {
      id: 'idx-' + Date.now(),
      type: 'INDEX_VAULT',
      directive: 'Full Vault Re-Index',
      priority: 'MEDIUM',
      assignedTo: 'VANGUARD'
    };
    await redis.lpush('ailcc:vanguard_queue', JSON.stringify(task));
    io.emit('SYSTEM_EVENT', {
      id: 'thermal-offload-' + Date.now(),
      msg: `🔥 Thermal Offload Active: Indexing delegated to Vanguard node.`,
      type: 'warning',
      timestamp: new Date().toLocaleTimeString()
    });
    const { exec } = require('child_process');
    exec('say -v Victoria "Thermal threshold exceeded. Shifting compute load to Vanguard node."');
  } else {
    console.log('✅ Local Thermals Optimal. Running local batch indexing.');
    const { exec } = require('child_process');
    exec('npm run index:vault', { cwd: path.join(__dirname, '..') }, (error, _stdout) => {
      if (error) console.error('❌ Batch Indexing Failed:', error);
      else console.log('✅ Local Batch Indexing Complete');
    });
  }
}, FOUR_HOURS);

// Periodic Linear fetch (kept as fallback/polling source)
setInterval(async () => {
  try {
    await broadcastTasks();
    console.log('🔄 Periodic task matrix refresh complete');
  } catch (err) {
    console.error('❌ Periodic refresh error:', err.message);
  }
}, 60000);

const PORT = process.env.RELAY_PORT || 3001; // Aligned with Grok MCP extension expectation
const NODE_ID = `node_${os.hostname()}_${PORT}`;

async function registerMeshNode() {
  try {
    const nodeInfo = {
      id: NODE_ID,
      hostname: os.hostname(),
      port: PORT,
      startTime: SERVER_START_TIME,
      status: 'online',
      lastSeen: Date.now()
    };
    await redis.hset('ailcc:mesh:nodes', NODE_ID, JSON.stringify(nodeInfo));
    console.log(`📡 Mesh Discovery: Registered as ${NODE_ID}`);
  } catch (err) {
    console.error('❌ Mesh Registration failed:', err);
  }
}

// Periodic Mesh Heartbeat
setInterval(registerMeshNode, 30000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║         🚀 AILCC NEURAL UPLINK (RELAY)               ║
  ║         Sovereign Tier Architecture Active           ║
  ╚══════════════════════════════════════════════════════╝
  📡 Network: http://localhost:${PORT}
  📁 Vault: ${VAULT_PATH}
  🆔 Node: ${NODE_ID}
  `);
  loadState();
  loadRegistry();
  registerMeshNode();
});

// API: List Mesh Peers
app.get('/api/system/mesh', async (req, res) => {
  try {
    const nodes = await redis.hgetall('ailcc:mesh:nodes');
    const activeNodes = Object.values(nodes).map(n => JSON.parse(n))
      .filter(n => (Date.now() - n.lastSeen) < 90000); // 90s timeout
    res.json(activeNodes);
  } catch (err) {
    res.status(500).json({ error: 'Mesh lookup failed' });
  }
});

// API: Live Academic Matrix (Phase 44)
app.get('/api/system/academics/live', (req, res) => {
  try {
    if (fs.existsSync(ACADEMIC_MATRIX_FILE)) {
      const data = fs.readFileSync(ACADEMIC_MATRIX_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Academic data not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read academic matrix', details: err.message });
  }
});

// API: Live Vault Hydration (Phase 42)
app.get('/api/system/vault', (req, res) => {
  try {
    if (!fs.existsSync(VAULT_PATH)) {
      return res.json([]);
    }
    const files = fs.readdirSync(VAULT_PATH);
    const vaultData = files
      .filter(f => !f.startsWith('.')) // Ignore hidden / .DS_Store
      .map(filename => {
        try {
          const filePath = path.join(VAULT_PATH, filename);
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) return null; // Only flat files for now
          
          return {
            id: filename,
            title: filename.replace(/\.[^/.]+$/, ""), // Strip extension
            type: path.extname(filename).substring(1) || 'unknown',
            size: stats.size,
            updatedAt: stats.mtime.toISOString(),
            status: 'Synced'
          };
        } catch (e) {
             return null;
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Newest first

    res.json(vaultData);
  } catch (err) {
    console.error('❌ API Vault read error:', err);
    res.status(500).json({ error: 'Vault read failed' });
  }
});

io.on('connection', (socket) => {
  console.log('🔌 New client connected to Neural Uplink');
  broadcastRoster();

  socket.on('DISPATCH_VANGUARD_TASK', async (task) => {
    const { exec } = require('child_process');
    console.log(`🚀 Dispatching Vanguard Task: ${task.directive}`);

    try {
      // 1. Persist to Redis Queue
      await redis.lpush('ailcc:vanguard_queue', JSON.stringify(task));

      // 2. Write to Vault for node discovery (Legacy compat)
      const taskPath = path.join(VAULT_PATH, 'tasks', `task_${task.id}.json`);
      if (!fs.existsSync(path.join(VAULT_PATH, 'tasks'))) {
        fs.mkdirSync(path.join(VAULT_PATH, 'tasks'), { recursive: true });
      }
      fs.writeFileSync(taskPath, JSON.stringify(task));

      io.emit('SYSTEM_EVENT', {
        id: 'dispatch-' + Date.now(),
        msg: `🛰️ Offloading Task to ThinkPad: ${task.directive}`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString()
      });

      exec('say -v Samantha "Sovereign protocol engaged. Delegating directive to Vanguard mule."');
    } catch (err) {
      console.error('❌ Task dispatch failed:', err);
    }
  });

  socket.on('BROWSER_PROFILE_SWITCH', (data) => {
    console.log(`🔄 Shifting Browser Context: ${data.profile}`);
    // Relay to Playwright Server
    const axios = require('axios');
    axios.post(`${BROWSER_SERVER}/api/browser/profile`, { profile: data.profile })
      .catch(err => console.error('❌ Browser Profile Switch Error:', err.message));

    io.emit('SYSTEM_EVENT', {
      id: 'profile-' + Date.now(),
      msg: `🌉 Shifting to ${data.profile === 'COMET' ? 'Comet.app' : 'Chrome Assist'} Profile`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    });
  });

  socket.on('AGENT_HANDOFF', (data) => {
    console.log(`🤝 Agent Handoff: Antigravity -> ${data.target}`);
    io.emit('SYSTEM_EVENT', {
      id: 'handoff-' + Date.now(),
      msg: `🤝 Handoff active: context relayed to ${data.target}`,
      type: 'success',
      timestamp: new Date().toLocaleTimeString()
    });
  });

  socket.on('TELEMETRY_LOG', async (event) => {
    // Similar logic to POST endpoint for internal socket-based agents
    const logEntry = {
      ...event,
      id: event.id || `evt_${Date.now()}`,
      timestamp: event.timestamp || new Date().toISOString()
    };
    await redis.lpush(TELEMETRY_KEY, JSON.stringify(logEntry));
    await redis.ltrim(TELEMETRY_KEY, 0, 999);
    io.emit('TELEMETRY_EVENT', logEntry);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});
