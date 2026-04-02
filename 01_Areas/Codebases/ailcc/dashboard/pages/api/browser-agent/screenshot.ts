import type { NextApiRequest, NextApiResponse } from 'next';

const BROWSER_SERVER = 'http://localhost:3333';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        const upstream = await fetch(`${BROWSER_SERVER}/screenshot`);
        if (!upstream.ok) return res.status(upstream.status).end('Browser server error');

        const buffer = await upstream.arrayBuffer();
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store, no-cache');
        res.status(200).end(Buffer.from(buffer));
    } catch (err: unknown) {
        res.status(503).json({ error: 'Browser server unreachable', detail: (err instanceof Error ? err.message : String(err)) });
    }
}
