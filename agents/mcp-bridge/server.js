#!/usr/bin/env node
/**
 * MCP SSE Bridge Server v2
 * Properly handles JSON-RPC request/response cycle for MCP SuperAssistant.
 * 
 * Architecture: 
 * - /sse → SSE stream for server→client notifications
 * - /message → POST endpoint that writes to stdin and waits for stdout response
 */

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

const PORT = process.env.MCP_BRIDGE_PORT || 3006;
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const sessions = new Map();

function createMCPSession() {
    const proc = spawn('npx', ['-y', '@modelcontextprotocol/server-filesystem', '/Users/infinite27/AILCC_PRIME'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env,
    });

    let buffer = '';
    const pendingRequests = new Map();
    const notifications = [];

    proc.stdout.on('data', (chunk) => {
        buffer += chunk.toString();

        // Try to parse complete JSON-RPC messages
        let newlineIdx = buffer.indexOf('\n');
        while (newlineIdx !== -1) {
            const line = buffer.substring(0, newlineIdx).trim();
            buffer = buffer.substring(newlineIdx + 1);

            if (!line) { newlineIdx = buffer.indexOf('\n'); continue; }

            try {
                const msg = JSON.parse(line);

                if (msg.id !== undefined && pendingRequests.has(msg.id)) {
                    const { resolve } = pendingRequests.get(msg.id);
                    pendingRequests.delete(msg.id);
                    resolve(msg);
                } else {
                    notifications.push(msg);
                }
            } catch (e) {
                console.error(`[bridge] Failed to parse stdout: ${line.slice(0, 100)}`);
            }
            newlineIdx = buffer.indexOf('\n');
        }
    });

    proc.stderr.on('data', (d) => {
        console.log(`[mcp] ${d.toString().trim()}`);
    });

    proc.on('exit', (code) => {
        console.log(`[bridge] MCP process exited with code ${code}`);
    });

    return { proc, pendingRequests, notifications };
}

function sendRequest(session, message) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            session.pendingRequests.delete(message.id);
            reject(new Error('Request timed out after 10s'));
        }, 10000);

        session.pendingRequests.set(message.id, {
            resolve: (response) => {
                clearTimeout(timeout);
                resolve(response);
            }
        });

        session.proc.stdin.write(JSON.stringify(message) + '\n');
    });
}

// SSE endpoint
app.get('/sse', (req, res) => {
    const sessionId = randomUUID();
    console.log(`[bridge] New SSE connection: ${sessionId}`);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });

    // Tell the client where to send messages
    const messageUrl = `/message?sessionId=${sessionId}`;
    res.write(`event: endpoint\ndata: ${messageUrl}\n\n`);

    const session = createMCPSession();
    sessions.set(sessionId, { ...session, res });

    // Forward server notifications as SSE events
    const notifInterval = setInterval(() => {
        while (session.notifications.length > 0) {
            const notif = session.notifications.shift();
            try {
                res.write(`event: message\ndata: ${JSON.stringify(notif)}\n\n`);
            } catch { /* client disconnected */ }
        }
    }, 100);

    // Keepalive
    const keepalive = setInterval(() => {
        try { res.write(': keepalive\n\n'); } catch { /* */ }
    }, 15000);

    req.on('close', () => {
        console.log(`[bridge] SSE disconnected: ${sessionId}`);
        clearInterval(notifInterval);
        clearInterval(keepalive);
        session.proc.kill();
        sessions.delete(sessionId);
    });
});

// Message endpoint — handles JSON-RPC request/response
app.post('/message', async (req, res) => {
    const sessionId = req.query.sessionId;
    const session = sessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Session not found' } });
    }

    const message = req.body;
    console.log(`[bridge] → ${message.method || 'response'} (id: ${message.id})`);

    try {
        if (message.id !== undefined && message.method) {
            // This is a request — wait for the response
            const response = await sendRequest(session, message);
            console.log(`[bridge] ← response for ${message.method} (id: ${message.id})`);
            res.json(response);
        } else {
            // This is a notification (no id) — fire and forget
            session.proc.stdin.write(JSON.stringify(message) + '\n');
            res.json({ jsonrpc: '2.0', result: {} });
        }
    } catch (err) {
        console.error(`[bridge] Error: ${err.message}`);
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message } });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '2.0',
        activeSessions: sessions.size,
        port: PORT,
        servers: ['filesystem'],
    });
});

app.listen(PORT, () => {
    console.log(`\n[bridge] MCP SSE Bridge v2 running on http://localhost:${PORT}`);
    console.log(`[bridge] SSE: http://localhost:${PORT}/sse`);
    console.log(`[bridge] Message: http://localhost:${PORT}/message`);
    console.log(`[bridge] Health: http://localhost:${PORT}/health\n`);
});
