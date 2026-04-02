import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Use environment variable to define intelligence vault path at runtime only
        // This prevents Turbopack from attempting to statically resolve the symlink
        const intelligenceVaultPath = process.env['INTELLIGENCE_VAULT_PATH']
            || path.join(process.env['HOME'] || '', 'Library/Mobile Documents/com~apple~CloudDocs/AILCC_Nexus/04_Intelligence_Vault');

        const reportPath = path.join(intelligenceVaultPath, 'CONSOLIDATED_INTELLIGENCE_REPORT.md');

        if (fs.existsSync(reportPath)) {
            const content = fs.readFileSync(reportPath, 'utf-8');
            res.status(200).json({ content });
        } else {
            res.status(404).json({ error: 'Report not found at ' + reportPath });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read report' });
    }
}
