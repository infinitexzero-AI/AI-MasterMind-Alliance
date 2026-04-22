import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8001';
        const response = await fetch(`${BACKEND_URL}/system/graph`);
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch graph data' });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error while proxying graph data' });
    }
}
