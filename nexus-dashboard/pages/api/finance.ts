import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const filePath = path.join(process.cwd(), '../../../../06_System/State/finance_data.json');

    if (req.method === 'POST') {
        const { amount, ticker } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        console.log(`[Finance API] Capital Deployment Requested: $${amount} into ${ticker || 'VOO'}`);

        const pyPath = path.join(process.cwd(), '../../.venv/bin/python');
        const scriptPath = path.join(process.cwd(), '../automations/finance/tycoon_broker_bridge.py');

        // Execute asynchronously
        exec(`${pyPath} ${scriptPath} --deploy ${amount} --ticker "${ticker || 'VOO'}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Tycoon Bridge] Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`[Tycoon Bridge] Stderr: ${stderr}`);
                return;
            }
            console.log(`[Tycoon Bridge] Success: ${stdout}`);
        });

        return res.status(202).json({
            message: 'Capital deployment initiated.',
            payload: { amount, ticker: ticker || 'VOO' }
        });
    }

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Finance data not found' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read finance data' });
    }
}
