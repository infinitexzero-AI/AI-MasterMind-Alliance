import type { NextApiRequest, NextApiResponse } from 'next';
import { readVault, patchVault } from '../../../lib/encrypted-vault';

/**
 * GET /api/vault/read  — returns decrypted vault contents
 * POST /api/vault/write — merges partial data into the vault
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const data = readVault();
            return res.status(200).json({ success: true, data });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ success: false, error: msg });
        }
    }

    if (req.method === 'POST') {
        try {
            const partial = req.body as Record<string, unknown>;
            if (!partial || typeof partial !== 'object') {
                return res.status(400).json({ error: 'Body must be a JSON object' });
            }
            patchVault(partial);
            return res.status(200).json({ success: true });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ success: false, error: msg });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
