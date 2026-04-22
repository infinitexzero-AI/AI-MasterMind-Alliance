import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

type Data = {
    message: string;
    output?: string;
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { intent, target } = req.body;

    if (intent === 'OPTIMIZE_VAULT') {
        // Default to the Intelligence Vault if no target provided
        const vaultPath = target || '/Users/infinite27/AILCC_PRIME/03_Intelligence_Vault';
        const scriptPath = path.resolve(process.cwd(), '../automations/organize_vault.js');

        // Security check: ensure scriptPath stays within allowed bounds (basic check)
        if (!scriptPath.includes('AILCC_PRIME')) {
            return res.status(403).json({ message: 'Security Alert: Unauthorized script path.' });
        }

        // Execute the Node script
        const command = `node "${scriptPath}" "${vaultPath}"`;

        console.log(`[Siri-Bridge] Executing: ${command}`);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Siri-Bridge] Error: ${error.message}`);
                return res.status(500).json({ message: 'Execution failed', error: error.message });
            }
            if (stderr) {
                console.warn(`[Siri-Bridge] Stderr: ${stderr}`);
            }

            console.log(`[Siri-Bridge] Success: ${stdout}`);
            return res.status(200).json({
                message: 'Vault Optimized Successfully',
                output: stdout
            });
        });

    } else {
        // Handle other intents or return 400
        res.status(400).json({ message: 'Unknown Intent. Supported: OPTIMIZE_VAULT' });
    }
}
