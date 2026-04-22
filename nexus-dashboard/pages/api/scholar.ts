import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
/**
 * Protocol: 4.2
 * Context: '01_Areas'
 * Operational 'modes': [Academic, Financial]
 */

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const VAULT_ROUTING = path.join(process.cwd(), '..', '..', '..', '..', '04_Intelligence_Vault');
    const VAULT_PATH = fs.realpathSync(VAULT_ROUTING);
    const dataPath = path.join(VAULT_PATH, 'scholar_data.json');

    try {
        if (req.method === 'GET') {
            const query = req.query.q as string;

            if (!fs.existsSync(dataPath)) {
                return res.status(200).json([]);
            }

            const fileContents = fs.readFileSync(dataPath, 'utf8');
            const data = JSON.parse(fileContents);

            if (query) {
                // Basic keyword search for the portal signals
                const results = data.filter((item: any) =>
                    item.title?.toLowerCase().includes(query.toLowerCase()) ||
                    item.tags?.some((t: string) => t.toLowerCase().includes(query.toLowerCase())) ||
                    item.abstract?.toLowerCase().includes(query.toLowerCase())
                );
                return res.status(200).json(results);
            }

            return res.status(200).json(data);
        }
    } catch (error) {
        console.error('Error handling scholar data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
