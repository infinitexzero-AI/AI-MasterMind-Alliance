import { exec } from 'child_process';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    exec('df -k /', (error, stdout, stderr) => {
        if (error) {
            console.error('Storage API Error:', error);
            return res.status(500).json({ error: 'Failed to execute df command' });
        }

        try {
            // Parse output
            // Filesystem 1024-blocks Used Available Capacity ...
            const lines = stdout.trim().split('\n');
            if (lines.length < 2) throw new Error('Invalid df output');

            const parts = lines[1].split(/\s+/);
            // macOS df -k output columns:
            // 0: Filesystem, 1: 1024-blocks, 2: Used, 3: Available, 4: Capacity, ...

            const totalBytes = parseInt(parts[1], 10) * 1024;
            const freeBytes = parseInt(parts[3], 10) * 1024;

            const freeGb = parseFloat((freeBytes / (1024 * 1024 * 1024)).toFixed(1));
            const totalGb = parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(1));
            const freePercent = Math.round((freeBytes / totalBytes) * 100);

            res.status(200).json({
                totalGb,
                freeGb,
                freePercent,
                status: freePercent < 10 ? 'critical' : freePercent < 20 ? 'warning' : 'healthy'
            });
        } catch (e) {
            console.error('Storage Parse Error:', e);
            res.status(500).json({ error: 'Failed to parse storage data' });
        }
    });
}
