import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);
const CACHE_FILE = path.join(process.cwd(), '.system_updates.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            return res.status(200).json(JSON.parse(data));
        }
        return res.status(200).json({ message: 'No update data available. Run monitor first.' });
    }

    if (req.method === 'POST') {
        try {
            // Run the monitor script asynchronously
            const scriptPath = path.join(process.cwd(), 'scripts', 'update-monitor.ts');
            exec(`npx ts-node --compiler-options '{"module":"CommonJS"}' "${scriptPath}"`);

            return res.status(202).json({ message: 'Update check initiated' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
