// ============================================================================
// FILE: types/api.types.ts
// Core TypeScript type definitions for NEXUS API
// ============================================================================

export type Priority = "low" | "medium" | "high" | "urgent";
export type AgentName = "OmniRouter" | "ResearchUnit" | "DevModule";
export type TaskSource = "touchbar" | "iphone" | "grok" | "web";
export type TaskStatus = "queued" | "active" | "completed" | "failed";
export type AgentAction = "spawn" | "pause" | "resume" | "kill";
export type AgentStatus = "idle" | "active" | "paused" | "offline";

export interface CreateTaskRequest {
  title: string;
  context: string;
  priority: Priority;
  targetAgent: AgentName;
  source: TaskSource;
  metadata?: Record<string, any>;
}

export interface Task {
  taskId: string;
  title: string;
  context: string;
  priority: Priority;
  targetAgent: AgentName;
  source: TaskSource;
  status: TaskStatus;
  progress: number;
  result?: any;
  startTime?: string;
  endTime?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AgentInfo {
  name: AgentName;
  status: AgentStatus;
  uptime: number;
  completed: number;
}

export interface SystemHealth {
  agents: AgentInfo[];
  queue: {
    active: number;
    pending: number;
    done: number;
  };
  systemLoad: number;
}

export interface WebhookPayload {
  source: string;
  payload: Record<string, any>;
  signature: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// FILE: lib/apiAuth.ts
// Authentication middleware for NEXUS API
// ============================================================================

import { NextApiRequest, NextApiResponse } from 'next';

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.NEXUS_API_KEY || 'nexus-dev-key-change-in-production';

    if (!apiKey || apiKey !== validKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid or missing API key',
        timestamp: new Date().toISOString()
      });
    }

    return handler(req, res);
  };
}

// ============================================================================
// FILE: lib/rateLimiter.ts
// Rate limiting middleware - 10 requests per minute per IP
// ============================================================================

import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms
const MAX_REQUESTS = 10;

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 300000);

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = (req.headers['x-forwarded-for'] as string) || 
               req.socket.remoteAddress || 
               'unknown';

    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      });
      return handler(req, res);
    }

    if (entry.count >= MAX_REQUESTS) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Try again in ${resetIn} seconds`,
        timestamp: new Date().toISOString()
      });
    }

    entry.count++;
    return handler(req, res);
  };
}

// ============================================================================
// FILE: lib/cors.ts
// CORS configuration for cross-device access
// ============================================================================

import { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.*', // Local network pattern
];

export function corsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '';
  
  // Check if origin matches allowed patterns
  const isAllowed = ALLOWED_ORIGINS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(origin);
    }
    return origin === pattern;
  });

  if (isAllowed || origin.startsWith('http://192.168.')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ============================================================================
// FILE: lib/taskQueue.ts
// Task queue management system (integrates with your existing system)
// ============================================================================

import { Task, CreateTaskRequest, TaskStatus } from '../types/api.types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store (replace with your actual database/Redis)
const taskQueue: Task[] = [];

export class TaskQueue {
  static create(request: CreateTaskRequest): Task {
    const task: Task = {
      taskId: uuidv4(),
      title: request.title,
      context: request.context,
      priority: request.priority,
      targetAgent: request.targetAgent,
      source: request.source,
      status: 'queued',
      progress: 0,
      metadata: request.metadata,
      createdAt: new Date().toISOString()
    };

    taskQueue.push(task);
    
    // Sort by priority (urgent > high > medium > low)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    taskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return task;
  }

  static getById(taskId: string): Task | undefined {
    return taskQueue.find(t => t.taskId === taskId);
  }

  static updateStatus(taskId: string, status: TaskStatus, progress?: number) {
    const task = this.getById(taskId);
    if (task) {
      task.status = status;
      if (progress !== undefined) task.progress = progress;
      if (status === 'active' && !task.startTime) {
        task.startTime = new Date().toISOString();
      }
      if (status === 'completed' || status === 'failed') {
        task.endTime = new Date().toISOString();
      }
    }
  }

  static getQueueStats() {
    return {
      active: taskQueue.filter(t => t.status === 'active').length,
      pending: taskQueue.filter(t => t.status === 'queued').length,
      done: taskQueue.filter(t => t.status === 'completed').length
    };
  }

  static getAllTasks(): Task[] {
    return [...taskQueue];
  }
}

// ============================================================================
// FILE: lib/agentManager.ts
// Agent management system (integrates with your existing agents)
// ============================================================================

import { AgentName, AgentStatus, AgentAction, AgentInfo } from '../types/api.types';

interface Agent extends AgentInfo {
  lastActive: string;
}

const agents: Map<AgentName, Agent> = new Map([
  ['OmniRouter', { name: 'OmniRouter', status: 'idle', uptime: 0, completed: 0, lastActive: new Date().toISOString() }],
  ['ResearchUnit', { name: 'ResearchUnit', status: 'idle', uptime: 0, completed: 0, lastActive: new Date().toISOString() }],
  ['DevModule', { name: 'DevModule', status: 'idle', uptime: 0, completed: 0, lastActive: new Date().toISOString() }]
]);

export class AgentManager {
  static getAgent(name: AgentName): Agent | undefined {
    return agents.get(name);
  }

  static getAllAgents(): AgentInfo[] {
    return Array.from(agents.values());
  }

  static executeAction(name: AgentName, action: AgentAction): AgentStatus {
    const agent = agents.get(name);
    if (!agent) throw new Error(`Agent ${name} not found`);

    switch (action) {
      case 'spawn':
        agent.status = 'active';
        break;
      case 'pause':
        agent.status = 'paused';
        break;
      case 'resume':
        agent.status = 'active';
        break;
      case 'kill':
        agent.status = 'offline';
        break;
    }

    agent.lastActive = new Date().toISOString();
    return agent.status;
  }

  static updateMetrics(name: AgentName, completed?: number) {
    const agent = agents.get(name);
    if (agent) {
      if (completed !== undefined) agent.completed += completed;
      agent.uptime += 1;
      agent.lastActive = new Date().toISOString();
    }
  }
}

// ============================================================================
// FILE: lib/logger.ts
// API request logger
// ============================================================================

export function logApiCall(
  endpoint: string,
  source: string,
  method: string,
  status: number,
  result?: string
) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${method} ${endpoint} | Source: ${source} | Status: ${status} | Result: ${result || 'success'}`
  );
}

// ============================================================================
// FILE: pages/api/tasks/create.ts
// POST /api/tasks/create - Create new task
// ============================================================================

import type { NextApiRequest, NextApiResponse } from 'next';
import { CreateTaskRequest, ApiResponse, Task } from '../../../types/api.types';
import { withAuth } from '../../../lib/apiAuth';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';
import { TaskQueue } from '../../../lib/taskQueue';
import { logApiCall } from '../../../lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<{ taskId: string; status: string }>>) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const body: CreateTaskRequest = req.body;

    // Validate required fields
    if (!body.title || !body.context || !body.priority || !body.targetAgent || !body.source) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, context, priority, targetAgent, source',
        timestamp: new Date().toISOString()
      });
    }

    // Validate enum values
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const validAgents = ['OmniRouter', 'ResearchUnit', 'DevModule'];
    const validSources = ['touchbar', 'iphone', 'grok', 'web'];

    if (!validPriorities.includes(body.priority)) {
      return res.status(400).json({
        success: false,
        error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    if (!validAgents.includes(body.targetAgent)) {
      return res.status(400).json({
        success: false,
        error: `Invalid targetAgent. Must be one of: ${validAgents.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    if (!validSources.includes(body.source)) {
      return res.status(400).json({
        success: false,
        error: `Invalid source. Must be one of: ${validSources.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Create task
    const task = TaskQueue.create(body);

    logApiCall('/api/tasks/create', body.source, 'POST', 200, task.taskId);

    return res.status(200).json({
      success: true,
      data: {
        taskId: task.taskId,
        status: 'queued'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiCall('/api/tasks/create', 'unknown', 'POST', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(withAuth(handler));

// ============================================================================
// FILE: pages/api/tasks/status/[taskId].ts
// GET /api/tasks/status/:taskId - Get task status
// ============================================================================

import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Task } from '../../../../types/api.types';
import { withAuth } from '../../../../lib/apiAuth';
import { withRateLimit } from '../../../../lib/rateLimiter';
import { corsHeaders } from '../../../../lib/cors';
import { TaskQueue } from '../../../../lib/taskQueue';
import { logApiCall } from '../../../../lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<Task>>) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid taskId parameter',
        timestamp: new Date().toISOString()
      });
    }

    const task = TaskQueue.getById(taskId);

    if (!task) {
      logApiCall(`/api/tasks/status/${taskId}`, 'unknown', 'GET', 404, 'not found');
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date().toISOString()
      });
    }

    logApiCall(`/api/tasks/status/${taskId}`, task.source, 'GET', 200);

    return res.status(200).json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiCall('/api/tasks/status', 'unknown', 'GET', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(withAuth(handler));

// ============================================================================
// FILE: pages/api/agents/trigger/[agentName].ts
// POST /api/agents/trigger/:agentName - Trigger agent action
// ============================================================================

import type { NextApiRequest, NextApiResponse } from 'next';
import { AgentName, AgentAction, AgentStatus, ApiResponse } from '../../../../types/api.types';
import { withAuth } from '../../../../lib/apiAuth';
import { withRateLimit } from '../../../../lib/rateLimiter';
import { corsHeaders } from '../../../../lib/cors';
import { AgentManager } from '../../../../lib/agentManager';
import { logApiCall } from '../../../../lib/logger';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ agentName: AgentName; newStatus: AgentStatus; timestamp: string }>>
) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { agentName } = req.query;
    const { action } = req.body;

    const validAgents = ['OmniRouter', 'ResearchUnit', 'DevModule'];
    const validActions = ['spawn', 'pause', 'resume', 'kill'];

    if (!agentName || !validAgents.includes(agentName as string)) {
      return res.status(400).json({
        success: false,
        error: `Invalid agentName. Must be one of: ${validAgents.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const newStatus = AgentManager.executeAction(agentName as AgentName, action as AgentAction);
    const timestamp = new Date().toISOString();

    logApiCall(`/api/agents/trigger/${agentName}`, 'system', 'POST', 200, `${action} -> ${newStatus}`);

    return res.status(200).json({
      success: true,
      data: {
        agentName: agentName as AgentName,
        newStatus,
        timestamp
      },
      timestamp
    });
  } catch (error) {
    logApiCall('/api/agents/trigger', 'unknown', 'POST', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(withAuth(handler));

// ============================================================================
// FILE: pages/api/dashboard/health.ts
// GET /api/dashboard/health - Get system health metrics
// ============================================================================

import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, SystemHealth } from '../../../types/api.types';
import { withAuth } from '../../../lib/apiAuth';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';
import { AgentManager } from '../../../lib/agentManager';
import { TaskQueue } from '../../../lib/taskQueue';
import { logApiCall } from '../../../lib/logger';
import os from 'os';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SystemHealth>>) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const agents = AgentManager.getAllAgents();
    const queue = TaskQueue.getQueueStats();
    
    // Calculate system load (CPU usage as percentage)
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => 
      acc + cpu.times.idle + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq, 0
    );
    const systemLoad = Math.round(100 - (totalIdle / totalTick) * 100);

    const healthData: SystemHealth = {
      agents,
      queue,
      systemLoad
    };

    logApiCall('/api/dashboard/health', 'system', 'GET', 200);

    return res.status(200).json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiCall('/api/dashboard/health', 'unknown', 'GET', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(withAuth(handler));

// ============================================================================
// FILE: pages/api/webhooks/external.ts
// POST /api/webhooks/external - Receive external webhooks
// ============================================================================

import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, WebhookPayload, CreateTaskRequest } from '../../../types/api.types';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';
import { TaskQueue } from '../../../lib/taskQueue';
import { logApiCall } from '../../../lib/logger';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ received: boolean; taskId: string }>>
) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const webhookData: WebhookPayload = req.body;
    const { source, payload, signature } = webhookData;

    if (!source || !payload || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: source, payload, signature',
        timestamp: new Date().toISOString()
      });
    }

    // Verify HMAC signature
    const secret = process.env.WEBHOOK_SECRET || 'nexus-webhook-secret-change-in-production';
    const payloadString = JSON.stringify(payload);
    
    if (!verifySignature(payloadString, signature, secret)) {
      logApiCall('/api/webhooks/external', source, 'POST', 401, 'invalid signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
        timestamp: new Date().toISOString()
      });
    }

    // Parse payload and create task
    const taskRequest: CreateTaskRequest = {
      title: payload.title || `Webhook from ${source}`,
      context: payload.context || JSON.stringify(payload),
      priority: payload.priority || 'medium',
      targetAgent: payload.targetAgent || 'OmniRouter',
      source: 'grok', // Webhooks typically come from external sources
      metadata: {
        webhookSource: source,
        originalPayload: payload
      }
    };

    const task = TaskQueue.create(taskRequest);

    logApiCall('/api/webhooks/external', source, 'POST', 200, task.taskId);

    return res.status(200).json({
      success: true,
      data: {
        received: true,
        taskId: task.taskId
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiCall('/api/webhooks/external', 'unknown', 'POST', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(handler);

// ============================================================================
// FILE: .env.local
// Environment variables configuration
// ============================================================================

/*
NEXUS_API_KEY=your-secure-api-key-here
WEBHOOK_SECRET=your-webhook-secret-here
*/

// ============================================================================
// FILE: package.json (dependencies to add)
// ============================================================================

/*
{
  "dependencies": {
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0",
    "@types/node": "^20.0.0"
  }
}
*/

// ============================================================================
// INTEGRATION GUIDE
// ============================================================================

/*
NEXUS API INTEGRATION GUIDE
==========================

1. FILE STRUCTURE
   Place files in your Next.js project:
   
   project-root/
   ├── types/
   │   └── api.types.ts
   ├── lib/
   │   ├── apiAuth.ts
   │   ├── rateLimiter.ts
   │   ├── cors.ts
   │   ├── taskQueue.ts
   │   ├── agentManager.ts
   │   └── logger.ts
   └── pages/api/
       ├── tasks/
       │   ├── create.ts
       │   └── status/
       │       └── [taskId].ts
       ├── agents/
       │   └── trigger/
       │       └── [agentName].ts
       ├── dashboard/
       │   └── health.ts
       └── webhooks/
           └── external.ts

2. INSTALL DEPENDENCIES
   npm install uuid
   npm install -D @types/uuid

3. ENVIRONMENT SETUP
   Create .env.local:
   NEXUS_API_KEY=your-secure-api-key-here
   WEBHOOK_SECRET=your-webhook-secret-here

4. INTEGRATION WITH EXISTING NEXUS SYSTEM
   
   A. Replace in-memory stores with your actual data layer:
      - In taskQueue.ts: Replace `taskQueue` array with your database
      - In agentManager.ts: Connect to your agent state management
   
   B. Connect to your existing agent system:
      - Update AgentManager.executeAction() to trigger your real agents
      - Update TaskQueue.create() to dispatch to your pipeline
   
   C. Add real-time updates:
      - Integrate with WebSockets for live task updates
      - Add event emitters when task status changes

5. SECURITY CHECKLIST
   ✓ Change NEXUS_API_KEY in production
   ✓ Change WEBHOOK_SECRET in production
   ✓ Use HTTPS in production
   ✓ Add IP whitelist for sensitive endpoints
   ✓ Enable firewall rules
   ✓ Monitor rate limit violations

6. TESTING ENDPOINTS
   See curl commands below in TESTING GUIDE section
*/

// ============================================================================
// TESTING GUIDE - CURL COMMANDS
// ============================================================================

/*
# 1. CREATE TASK
curl -X POST http://localhost:3000/api/tasks/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: nexus-dev-key-change-in-production" \
  -d '{
    "title": "Test task from curl",
    "context": "This is a test task to verify API integration",
    "priority": "high",
    "targetAgent": "OmniRouter",
    "source": "web",
    "metadata": {"test": true}
  }'

# Expected response:
# {"success":true,"data":{"taskId":"uuid-here","status":"queued"},"timestamp":"..."}

# 2. GET TASK STATUS (replace TASK_ID with actual UUID from step 1)
curl -X GET http://localhost:3000/api/tasks/status/TASK_ID \
  -H "X-API-Key: nexus-dev-key-change-in-production"

# Expected response:
# {"success":true,"data":{"taskId":"...","title":"...","status":"queued",...},"timestamp":"..."}

# 3. TRIGGER AGENT
curl -X POST http://localhost:3000/api/agents/trigger/OmniRouter \
  -H "Content-Type: application/json" \
  -H "X-API-Key: nexus-dev-key-change-in-production" \
  -d '{"action": "spawn"}'

# Expected response:
# {"success":true,"data":{"agentName":"OmniRouter","newStatus":"active","timestamp":"..."},"timestamp":"..."}

# 4. GET SYSTEM HEALTH
curl -X GET http://localhost:3000/api/dashboard/health \
  -H "X-API-Key: nexus-dev-key-change-in-production"

# Expected response:
# {"success":true,"data":{"agents":[...],"queue":{...},"systemLoad":25},"timestamp":"..."}

# 5. SEND WEBHOOK (with signature)
# First, generate signature in Node.js:
# const crypto = require('crypto');
# const payload = JSON.stringify({title: "Webhook task", context: "Test"});
# const secret = 'nexus-webhook-secret-change-in-production';
# const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
# console.log(signature);

curl -X POST http://localhost:3000/api/webhooks/external \
  -H "Content-Type: application/json" \
  -d '{
    "source": "grok",
    "payload": {
      "title": "Webhook task",
      "context": "Test webhook integration",
      "priority": "medium",
      "targetAgent": "ResearchUnit"
    },
    "signature": "GENERATED_SIGNATURE_HERE"
  }'

# Expected response:
# {"success":true,"data":{"received":true,"taskId":"..."},"timestamp":"..."}

# 6. TEST RATE LIMITING (send 11 requests rapidly)
for i in {1..11}; do
  curl -X GET http://localhost:3000/api/dashboard/health \
    -H "X-API-Key: nexus-dev-key-change-in-production"
  echo ""
done

# Expected: First 10 succeed, 11th returns 429 rate limit error

# 7. TEST AUTHENTICATION (no API key)
curl -X GET http://localhost:3000/api/dashboard/health

# Expected response:
# {"success":false,"error":"Unauthorized - Invalid or missing API key","timestamp":"..."}
*/

// ============================================================================
// DEVICE-SPECIFIC INTEGRATION EXAMPLES
// ============================================================================

/*
# MACOS TOUCH BAR (BetterTouchTool)
# ===================================
# Add new button in BetterTouchTool:
# - Action: Execute Shell Script
# - Script:
curl -X POST http://localhost:3000/api/tasks/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"title":"Quick Research","context":"Touch Bar initiated","priority":"high","targetAgent":"ResearchUnit","source":"touchbar"}'

# IPHONE SHORTCUTS + APPLE INTELLIGENCE
# =====================================
# 1. Create new Shortcut
# 2. Add "Get Contents of URL" action
# 3. Configure:
#    - URL: http://YOUR_MAC_IP:3000/api/tasks/create
#    - Method: POST
#    - Headers: X-API-Key: YOUR_KEY
#    - Request Body: JSON (see create task example)
# 4. Add "Show Result" to display taskId
# 5. Enable Siri: "Hey Siri, create NEXUS task"

# GROK MOBILE + VALENTINE COMPANION
# ==================================
# Configure webhook URL in Grok:
# POST http://YOUR_MAC_IP:3000/api/webhooks/external
# Include signature generation in Valentine companion app
*/