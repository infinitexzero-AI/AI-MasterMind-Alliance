import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://hippocampus-api:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { action, q } = req.query;

    try {
        if (action === 'search') {
            const fetchRes = await fetch(`${BACKEND_URL}/vault/search?q=${encodeURIComponent(q as string)}`);
            const data = await fetchRes.json();
            return res.status(200).json(data);
        }

        if (action === 'index') {
            const fetchRes = await fetch(`${BACKEND_URL}/vault/index`);
            const data = await fetchRes.json();
            return res.status(200).json(data);
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Vault API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: String(error) });
    }
}
