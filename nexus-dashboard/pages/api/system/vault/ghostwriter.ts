import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Define the absolute physical path to the Sovereign Vault
const VAULT_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/AILCC_VAULT/Ghostwriter_Outputs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        if (!fs.existsSync(VAULT_DIR)) {
            // If the AI hasn't synthesized anything yet, just return an empty array so UI doesn't crash
            return res.status(200).json([]);
        }

        const files = fs.readdirSync(VAULT_DIR);
        
        const documents = files
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const filePath = path.join(VAULT_DIR, file);
                const stats = fs.statSync(filePath);
                const content = fs.readFileSync(filePath, 'utf-8');
                
                // Extract the first H1 tag as the title, or fallback to filename
                const titleMatch = content.match(/^#\s+(.*)/m);
                const title = titleMatch ? titleMatch[1] : file.replace('.md', '').replace(/_/g, ' ');

                return {
                    name: file,
                    title: title,
                    path: filePath,
                    content: content,
                    modified: stats.mtime.toLocaleString('en-US', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }),
                    timestamp: stats.mtime.getTime()
                };
            })
            // Sort by newest first
            .sort((a, b) => b.timestamp - a.timestamp);

        return res.status(200).json(documents);
        
    } catch (error: any) {
        console.error('[Ghostwriter API] Failed to parse vault:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
