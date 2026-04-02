import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const filePath = path.join(process.cwd(), '../../../../06_System/State/budget_state.json');

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Budget data not found' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read budget data' });
    }
}
