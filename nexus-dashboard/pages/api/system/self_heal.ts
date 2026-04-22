import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const scriptPath = path.resolve(process.cwd(), '../../scripts/api/self_heal.sh');
        
        if (!fs.existsSync(scriptPath)) {
            // Fallback for Docker or different CWD
            const fallbackPath = '/app/scripts/api/self_heal.sh';
            if (!fs.existsSync(fallbackPath)) {
                 return res.status(404).json({ error: `Maintenance script not found at ${scriptPath}` });
            }
        }

        // Execute the self-healing routine
        const { stdout } = await execAsync(`bash ${scriptPath}`);
        const result = JSON.parse(stdout);

        return res.status(200).json({
            message: 'Autonomous Self-Healing Routine complete',
            actions: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Self-healing failed:', error);
        return res.status(500).json({ 
            error: 'Failed to execute maintenance routine',
            details: (error as Error).message
        });
    }
}
