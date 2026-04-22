import { spawnSync } from 'child_process';
import path from 'path';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const cwdPath = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc';
        
        // Execute git command natively
        const gitProcess = spawnSync('git', ['log', '-n', '10', '--pretty=format:%h|%s|%ar|%an'], {
            cwd: cwdPath,
            encoding: 'utf-8'
        });

        if (gitProcess.error) {
            console.error("Git Log Read Failure:", gitProcess.error);
            return res.status(500).json({ commits: [] });
        }

        const lines = gitProcess.stdout.trim().split('\n');
        const commits = lines.map(line => {
            const [hash, message, time, author] = line.split('|');
            return {
                id: hash,
                message: message || "Unknown Hash",
                timestamp: time || "Unknown",
                is_ai_generated: message ? message.includes('[Auto-Merge]') || message.includes('[Archon Auto-Merge]') : false
            };
        }).filter(c => c.id);

        return res.status(200).json({ commits });
    } catch (error) {
        return res.status(500).json({ commits: [] });
    }
}
