import type { NextApiRequest, NextApiResponse } from 'next';
import { thoughtStream, emitThought } from '../../../lib/thought-stream';

/**
 * GET  /api/singularity/thought-stream  — SSE endpoint for live thought broadcasting
 * POST /api/singularity/thought-stream  — inject a new thought into the swarm
 * GET  /api/singularity/thought-stream?history=1 — returns recent thought history as JSON
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Return history as JSON
    if (req.method === 'GET' && req.query.history === '1') {
        const limit = parseInt((req.query.limit as string) ?? '50', 10);
        return res.status(200).json({
            thoughts: thoughtStream.getRecent(limit),
            total: thoughtStream.count()
        });
    }

    // SSE stream
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        // Send recent history immediately so new clients catch up
        const history = thoughtStream.getRecent(20);
        for (const thought of history) {
            res.write(`data: ${JSON.stringify(thought)}\n\n`);
        }

        // Subscribe to new thoughts
        const unsubscribe = thoughtStream.subscribe((thought) => {
            res.write(`data: ${JSON.stringify(thought)}\n\n`);
        });

        // Heartbeat every 20s to keep connection alive
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 20000);

        req.on('close', () => {
            clearInterval(heartbeat);
            unsubscribe();
        });
        return;
    }

    // POST — inject a thought
    if (req.method === 'POST') {
        const { agentName, agentId, thought, type, confidence, relatesTo } = req.body as {
            agentName: string; agentId: string; thought: string;
            type?: 'intention' | 'observation' | 'question' | 'insight' | 'warning';
            confidence?: number; relatesTo?: string;
        };

        if (!agentName || !agentId || !thought) {
            return res.status(400).json({ error: 'agentName, agentId, and thought required' });
        }

        const entry = emitThought(agentName, agentId, thought, type ?? 'observation', confidence ?? 0.8, relatesTo);
        return res.status(200).json({ success: true, thought: entry });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
