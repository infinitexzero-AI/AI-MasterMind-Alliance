import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({
        ok: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        node: process.version,
    });
}
