import type { NextApiRequest, NextApiResponse } from 'next';
import { checkEthics } from '../../../lib/ethics-middleware';

/**
 * POST /api/ethics/check
 * Scans a content string for prompt injection, destructive cmds, and privacy violations.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { content, source } = req.body as { content: string; source?: string };
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'content string required' });
    }

    const result = checkEthics(content);
    return res.status(200).json({
        ...result,
        source: source ?? 'UNKNOWN',
        scannedAt: new Date().toISOString()
    });
}
