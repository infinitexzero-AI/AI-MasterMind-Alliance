import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Define paths relative to the Windows environment
const VANGUARD_DIR = 'C:/Users/infin/AILCC_PRIME/03_Data_Stores/OneDrive_Nexus/01_Projects/Tax_Crisis_Defense_2026';
const MANIFEST_PATH = path.join(VANGUARD_DIR, 'WEEKLY_TRIAGE_MANIFEST_APRIL2026.md');
const DASHBOARD_PATH = path.join(VANGUARD_DIR, 'MASTER_RESOLUTION_DASHBOARD_2026.md');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        let manifest = '';
        let dashboard = '';

        if (fs.existsSync(MANIFEST_PATH)) {
            manifest = fs.readFileSync(MANIFEST_PATH, 'utf-8');
        }

        if (fs.existsSync(DASHBOARD_PATH)) {
            dashboard = fs.readFileSync(DASHBOARD_PATH, 'utf-8');
        }

        return res.status(200).json({
            manifest,
            dashboard,
            timestamp: new Date().toISOString()
        });
        
    } catch (error: any) {
        console.error('[Vanguard API] Error:', error);
        return res.status(500).json({ error: 'Failed to retrieve Vanguard tactical data.' });
    }
}
