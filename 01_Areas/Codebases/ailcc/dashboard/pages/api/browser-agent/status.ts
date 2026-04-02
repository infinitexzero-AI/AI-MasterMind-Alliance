import type { NextApiRequest, NextApiResponse } from 'next';

const BROWSER_SERVER = 'http://localhost:3333';

/**
 * GET /api/browser-agent/status
 * Proxy the Playwright server /status so the page can poll without CORS issues.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();
    try {
        const data = await fetch(`${BROWSER_SERVER}/status`).then(r => r.json());
        res.status(200).json(data);
    } catch {
        res.status(503).json({ url: 'about:blank', status: 'OFFLINE' });
    }
}
