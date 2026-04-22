import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const filePath = path.join(process.cwd(), '../../../06_System/State/current_context.json');

    try {
        if (!fs.existsSync(filePath)) {
            // If not found, run the orchestrator once to generate it
            return res.status(200).json({ active_mode: "REST", mode_info: { name: "System Standby" } });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read context data' });
    }
}
