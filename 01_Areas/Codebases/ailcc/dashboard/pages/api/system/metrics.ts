import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://hippocampus-api:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const fetchRes = await fetch(`${BACKEND_URL}/system/metrics`);
        if (!fetchRes.ok) {
            throw new Error(`Backend returned ${fetchRes.status}`);
        }
        const data = await fetchRes.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('System Metrics API Error:', error);
        // Fallback to local system info if backend is unreachable
        res.status(500).json({ error: 'Failed to fetch complex metrics from backend', details: String(error) });
    }
}
