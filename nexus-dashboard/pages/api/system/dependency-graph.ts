import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const graphPath = path.join(process.cwd(), '.dependency-graph.json');

    if (!fs.existsSync(graphPath)) {
        return res.status(404).json({ error: 'Dependency graph data not found. Run analysis first.' });
    }

    try {
        const data = fs.readFileSync(graphPath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
