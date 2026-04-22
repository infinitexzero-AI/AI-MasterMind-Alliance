import type { NextApiRequest, NextApiResponse } from 'next';

const BROWSER_SERVER = 'http://localhost:3333';

/**
 * POST /api/browser-agent/stop
 * Instructs the Playwright server to halt execution and reset to IDLE.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        const result = await fetch(`${BROWSER_SERVER}/stop`, { method: 'POST' }).then(r => r.json());
        res.status(200).json(result);
    } catch (err: unknown) {
        res.status(503).json({ error: 'Browser server unreachable', detail: (err instanceof Error ? err.message : String(err)) });
    }
}
