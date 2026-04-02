import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filePath } = req.query;

    if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({ error: 'filePath is required' });
    }

    // Security check: Ensure the file is within the AILCC_PRIME directory
    const absolutePath = path.resolve(filePath);
    if (!absolutePath.startsWith('/Users/infinite27/AILCC_PRIME')) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(absolutePath, 'utf8');
        res.status(200).json({ content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read file' });
    }
}
