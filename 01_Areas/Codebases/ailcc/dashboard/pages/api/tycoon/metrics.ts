import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const METRICS_PATH = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/tycoon_reports/burn_rate_metrics.json';

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let combinedData = {
            last_updated: new Date().toISOString(),
            current_month: {
                income: 0,
                total_spent: 0,
                net: 0,
                savings_rate_pct: 0,
                burn_rate: 0,
                breakdown: {}
            },
            nslsc: null
        };

        if (fs.existsSync(METRICS_PATH)) {
            combinedData = { ...combinedData, ...JSON.parse(fs.readFileSync(METRICS_PATH, 'utf-8')) };
        }
        
        const NSLSC_PATH = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/tycoon_reports/nslsc_status.json';
        if (fs.existsSync(NSLSC_PATH)) {
            combinedData.nslsc = JSON.parse(fs.readFileSync(NSLSC_PATH, 'utf-8'));
        }

        return res.status(200).json(combinedData);
    } catch (e) {
        return res.status(500).json({ error: 'Failed to read financial metrics' });
    }
}
