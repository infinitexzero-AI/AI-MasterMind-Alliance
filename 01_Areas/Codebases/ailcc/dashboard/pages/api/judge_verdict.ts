import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const VERDICT_PATH = '/Users/infinite27/AILCC_PRIME/06_System/State/judge_verdict.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!fs.existsSync(VERDICT_PATH)) {
            // Return a default verdict if none exists
            return res.status(200).json({
                summary: "Passive monitoring active.",
                analysis: "The Judge is standing by for new research inputs.",
                directives: ["Awaiting Comet extraction..."],
                timestamp: new Date().toISOString()
            });
        }

        const fileContents = fs.readFileSync(VERDICT_PATH, 'utf8');
        const data = JSON.parse(fileContents);
        res.status(200).json(data);
    } catch (error) {
        console.error("Verdict API Error:", error);
        res.status(500).json({ error: 'Failed to load Judge verdict' });
    }
}
