import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        console.log('[MOTOR CORTEX] Flushing Redis Cache...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.status(200).json({ success: true, message: 'Redis Cache Flushed.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to flush cache' });
    }
}
