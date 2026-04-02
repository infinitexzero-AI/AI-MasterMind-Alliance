/**
 * AIMmA MCP Server (v.1)
 * Formal Model Context Protocol server for system telemetry and bridge coordination.
 * Resolves SSE connection issues with MCP SuperAssistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateLiveStatus } from './mcp-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_FILE_PATH = path.resolve(__dirname, '../../06_System/State/conversation_memory.json');

const app = express();
app.use(cors());
const server = new Server(
  {
    name: 'aimma-bridge-server',
    version: '1.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// --- Resources ---
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'memory://conversation/current',
        name: 'Current Conversation Memory',
        mimeType: 'application/json',
        description: 'The shared, cross-agent conversation history.',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'memory://conversation/current') {
    const memoryContent = fs.existsSync(MEMORY_FILE_PATH) ? fs.readFileSync(MEMORY_FILE_PATH, 'utf-8') : '[]';
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: memoryContent,
        },
      ],
    };
  }
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// --- Tools ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'append_memory',
        description: 'Append a new message to the shared cross-agent conversation memory stream.',
        inputSchema: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['user', 'assistant', 'system'], description: 'Role of the message author' },
            agent: { type: 'string', description: 'Name of the agent or user contributing the message' },
            content: { type: 'string', description: 'The message content' },
          },
          required: ['role', 'agent', 'content'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'append_memory') {
    const { role, agent, content } = request.params.arguments;

    let memory = [];
    if (fs.existsSync(MEMORY_FILE_PATH)) {
      try {
        memory = JSON.parse(fs.readFileSync(MEMORY_FILE_PATH, 'utf-8'));
      } catch (e) { console.error("Could not parse existing memory"); }
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      role,
      agent,
      content
    };

    memory.push(newMessage);

    // Keep last 100 messages max to prevent infinite growth
    if (memory.length > 100) {
      memory = memory.slice(-100);
    }

    fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(memory, null, 2));

    return {
      content: [{ type: 'text', text: `Message appended successfully by ${agent}.` }],
    };
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

let transport;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'mcp-bridge' });
});

app.get('/sse', async (req, res) => {
  console.log('[MCP_SERVER] SSE Connection established');
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  console.log('[MCP_SERVER] Message received');
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(404).send('No active transport');
  }
});

// Periodic bridge sync
setInterval(async () => {
  try {
    await generateLiveStatus();
  } catch (e) {
    console.error('[MCP_SERVER] Bridge sync failed:', e.message);
  }
}, 300000); // 5 minutes

const PORT = process.env.MCP_PORT || 3006;
app.listen(PORT, () => {
  console.log(`[MCP_SERVER] Listening on port ${PORT}`);
  console.log(`[MCP_SERVER] SSE Endpoint: http://localhost:${PORT}/sse`);
});
