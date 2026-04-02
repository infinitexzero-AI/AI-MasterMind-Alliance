import { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import { parse } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

// Next.js API route for WebSocket upgrade (server-side only)
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true
    }
};

interface SocketWithServer extends NetSocket {
    server: HTTPServer & {
        _wsServer?: WebSocketServer;
    };
}

interface ResponseWithSocket extends NextApiResponse {
    socket: SocketWithServer;
}

const getWSS = (res: ResponseWithSocket) => {
    // reuse or create a websocket server on the same underlying server
    const server = res.socket.server;

    if (!server._wsServer) {
        console.log('Initializing WebSocket Server...');
        // @ts-ignore - WebSocketServer type mismatch workaround if needed, but 'ws' updated imports should fix it.
        const wss = new WebSocketServer({ noServer: true });

        server.on('upgrade', (req, socket, head) => {
            const { pathname } = parse(req.url || '', true);

            if (pathname === '/api/ws') {
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            }
        });

        wss.on('connection', (ws) => {
            console.log('Client connected to WebSocket');

            ws.on('message', (message) => {
                const msgString = message.toString();
                // Broadcast to all connected clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(msgString);
                    }
                });
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });

        server._wsServer = wss;
    }

    return server._wsServer;
};

export default async function handler(req: NextApiRequest, res: ResponseWithSocket) {
    // Initialize the WS server if not already up
    getWSS(res);

    // Only used to signal that ws endpoint exists (the actual upgrade handled above).
    res.status(200).end('WebSocket endpoint active');
}
