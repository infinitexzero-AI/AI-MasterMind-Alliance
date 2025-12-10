import { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import { parse } from 'url';
import WebSocket, { WebSocketServer } from 'ws';

// Next.js API route for WebSocket upgrade (server-side only)
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

const getWSS = (res: NextApiResponse & { socket: any }) => {
  // reuse or create a websocket server on the same underlying server
  const server: HTTPServer = (res.socket as any).server;
  if (!(server as any)._wsServer) {
    const wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
      const { pathname } = parse(req.url || '');
      if (pathname === '/api/forge/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    });
    (server as any)._wsServer = wss;
  }
  return (server as any)._wsServer as WebSocketServer;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only used to signal that ws endpoint exists (the actual upgrade handled above).
  res.status(200).end('WebSocket endpoint');
}
