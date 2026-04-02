import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const METRICS_PATH = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/tycoon_reports/burn_rate_metrics.json';

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let netSurplus = 0;
        if (fs.existsSync(METRICS_PATH)) {
            const metrics = JSON.parse(fs.readFileSync(METRICS_PATH, 'utf-8'));
            netSurplus = metrics.current_month?.net || 0;
        }

        // Generate proposal based on surplus
        if (netSurplus > 500) {
            return res.status(200).json({
                type: 'CAPITAL_DEPLOYMENT',
                amount: Math.floor(netSurplus * 0.8),
                suggestion: 'VFV.TO (S&P 500 Index)',
                reason: 'Sovereign surplus detected. High-efficiency capital stacking recommended.',
                timestamp: new Date().toISOString()
            });
        } else {
            return res.status(204).end();
        }
    } catch (e) {
        return res.status(500).json({ error: 'Failed to generate financial proposal' });
    }
}
