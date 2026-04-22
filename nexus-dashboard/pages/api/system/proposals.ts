import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const MODE6_DATA_DIR = path.resolve(process.cwd(), 'automations/mode6/data');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        if (!fs.existsSync(MODE6_DATA_DIR)) {
            return res.status(200).json({ proposals: [] });
        }

        const files = fs.readdirSync(MODE6_DATA_DIR).filter(file => file.endsWith('.json') && file.startsWith('decision-SINGULARITY-'));

        const proposals = files.map(file => {
            const raw = fs.readFileSync(path.join(MODE6_DATA_DIR, file), 'utf-8');
            try {
                const parsed = JSON.parse(raw);
                return {
                    id: parsed.taskId,
                    timestamp: parsed.timestamp,
                    primaryAgent: parsed.primaryAgent,
                    objective: parsed.objective,
                    reasoning: parsed.reasoning,
                    status: parsed.status || 'PENDING'
                };
            } catch (e) {
                console.error(`Mode 6 parse failure on ${file}:`, e);
                return null;
            }
        }).filter(Boolean).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return res.status(200).json({ proposals });
    } catch (error) {
        console.error('Failed to hunt Singularity decisions:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
