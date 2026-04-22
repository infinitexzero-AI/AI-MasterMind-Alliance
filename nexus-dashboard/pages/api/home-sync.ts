import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * 🏠 Home Sync API
 * 
 * Redirection layer for environmental manifestation commands.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { mode } = req.body;

        if (!mode || !['focus', 'recovery', 'alert', 'neutral'].includes(mode)) {
            return res.status(400).json({ error: 'Invalid or missing mode' });
        }

        console.log(`[HomeSync API] Manifesting ${mode.toUpperCase()} mode...`);

        const pyPath = path.join(process.cwd(), '../../.venv/bin/python');
        const scriptPath = path.join(process.cwd(), '../automations/physical/home_bridge.py');

        // Execute asynchronously
        exec(`${pyPath} ${scriptPath} --mode ${mode}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Home Sync] Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`[Home Sync] Stderr: ${stderr}`);
                return;
            }
            console.log(`[Home Sync] Success: ${stdout}`);
        });

        return res.status(202).json({
            message: `Environmental ${mode} manifest initiated.`,
            status: 'ACCEPTED'
        });
    }

    if (req.method === 'GET') {
        const statusPath = path.join(process.cwd(), '../../../../06_System/State/physical_status.json');

        try {
            if (fs.existsSync(statusPath)) {
                const data = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
                return res.status(200).json(data);
            }
            return res.status(404).json({ error: 'Physical status not found' });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to read physical status' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
