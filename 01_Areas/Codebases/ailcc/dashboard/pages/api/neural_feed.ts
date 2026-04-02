import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Define path to the swarm log file
const LOG_FILE_PATH = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/logs/swarm_link.log';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!fs.existsSync(LOG_FILE_PATH)) {
            return res.status(404).json({ error: 'Swarm log file not found' });
        }

        const fileContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        const lines = fileContent.split('\n').filter(Boolean);

        // Get last 50 lines for the feed
        const recentLines = lines.slice(-50).map(line => {
            // Simple parsing to extract basic info if possible
            // Format: [TIMESTAMP] [LEVEL] Message
            const match = line.match(/^\[(.*?)\] \[(.*?)\] (.*)$/);
            if (match) {
                return {
                    raw: line,
                    timestamp: match[1],
                    level: match[2],
                    message: match[3]
                };
            }
            return {
                raw: line,
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: line
            };
        });

        res.status(200).json({ logs: recentLines });
    } catch (error) {
        console.error("Neural Feed API Error:", error);
        res.status(500).json({ error: 'Failed to read neural feed' });
    }
}
