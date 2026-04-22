import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Poll common system event files/queues and push to client
    const interval = setInterval(async () => {
        try {
            // In a real system, we'd pull from Redis or a Message Queue here
            // For now, we simulate swarm activity pulses
            const event = {
                type: 'swarm_event',
                agent: 'CORTEX',
                msg: 'Neural synchronization heartbeat',
                timestamp: new Date().toISOString()
            };
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        } catch (e) {
            console.error('SSE Error:', e);
        }
    }, 5000);

    // Clean up when client disconnects
    req.on('close', () => {
        clearInterval(interval);
    });
}
