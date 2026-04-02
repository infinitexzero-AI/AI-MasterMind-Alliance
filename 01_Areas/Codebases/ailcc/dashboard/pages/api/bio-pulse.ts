import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const filePath = "/Users/infinite27/AILCC_PRIME/data/bio_pulse.json";

    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            res.status(200).json(JSON.parse(data));
        } else {
            // Fallback mock
            res.status(200).json({
                timestamp: new Date().toISOString(),
                hrv: 72,
                resting_hr: 62,
                sleep_score: 85,
                energy_state: 'FOCUS',
                score_rationale: "Default mock pulse. Daemon not yet writing."
            });
        }
    } catch (e) {
        res.status(500).json({ error: "Failed to read bio-pulse data" });
    }
}
