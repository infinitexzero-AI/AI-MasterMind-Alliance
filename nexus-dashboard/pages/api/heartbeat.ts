import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// LOG PATH MAPPING
// We assume the dashboard is running from AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard
// So we go up 4 levels to get to ROOT
const LOG_FILE = path.resolve(process.cwd(), '../../../../06_System/Logs/system_heartbeat.log');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return res.status(200).json({
                status: "waiting",
                timestamp: new Date().toISOString(),
                log_tail: ["Log file not found yet. System starting?"]
            });
        }

        const content = fs.readFileSync(LOG_FILE, 'utf-8');
        const lines = content.trim().split('\n');
        const tail = lines.slice(-50); // Last 50 lines

        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            log_tail: tail
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to read logs",
            error: String(error)
        });
    }
}
