
import WebSocket from 'ws';
import { ToolDefinition } from './registry';
import { z } from 'zod';

// WebSocket Client for Tools
// This singleton ensures we reuse the connection
class WebSocketClient {
    private static instance: WebSocketClient;
    private ws: WebSocket | null = null;
    private queue: string[] = [];
    private isConnected = false;

    private constructor() { }

    static getInstance() {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

        this.ws = new WebSocket('ws://localhost:3001');

        this.ws.on('open', () => {
            console.log('[Tool] Connected to Relay');
            this.isConnected = true;
            this.flushQueue();
        });

        this.ws.on('error', (err) => {
            console.warn('[Tool] Relay connection error (is backend running?):', err.message);
            this.isConnected = false;
        });

        this.ws.on('close', () => {
            this.isConnected = false;
        });
    }

    send(data: any) {
        if (!this.ws) this.connect();

        const msg = JSON.stringify(data);
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
        } else {
            this.queue.push(msg);
        }
    }

    private flushQueue() {
        while (this.queue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(this.queue.shift()!);
        }
    }
}

export const NavigateTool: ToolDefinition = {
    name: 'browser_navigate',
    description: 'Navigate the Comet browser to a URL',
    parameters: z.object({
        url: z.string().url()
    }),
    execute: async ({ url }) => {
        WebSocketClient.getInstance().send({
            type: 'COMET_COMMAND',
            payload: { action: 'navigate', url }
        });
        return { success: true, message: `Navigating to ${url}` };
    }
};

export const BroadcastStatusTool: ToolDefinition = {
    name: 'broadcast_status',
    description: 'Broadcast agent thought or status to the Dashboard',
    parameters: z.object({
        status: z.string(),
        thought: z.string().optional()
    }),
    execute: async ({ status, thought }) => {
        WebSocketClient.getInstance().send({
            type: 'AGENT_UPDATE',
            payload: { status, thought, timestamp: new Date() }
        });
        return { success: true };
    }
};
