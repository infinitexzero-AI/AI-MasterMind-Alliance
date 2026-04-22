import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { action, proposal } = req.body;
    
    if (action === 'MERGE') {
        try {
            // Absolute validation
            if (!proposal.file_path || !proposal.proposed_content) {
                throw new Error("Missing absolute path or payload");
            }
            
            // Execute the physical OS write
            fs.writeFileSync(proposal.file_path, proposal.proposed_content, 'utf-8');
            return res.status(200).json({ success: true, message: 'Singularity matrix successfully mounted to physical core.' });
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    } else if (action === 'REJECT') {
        // Pinging rejection loop
        return res.status(200).json({ success: true, message: 'Proposal mathematically immolated from the staging array.' });
    }
    
    res.status(400).json({ error: 'Unknown directive command' });
}
