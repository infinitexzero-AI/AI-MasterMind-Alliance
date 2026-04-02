import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch processes related to AILCC, Ollama, and automation
        const { stdout } = await execAsync("ps -eo pid,ppid,%cpu,%mem,command | grep -E 'ollama|next|playwright|python|node|bash' | grep -v 'grep'");

        const lines = stdout.trim().split('\n');
        const processes = lines.map(line => {
            const parts = line.trim().split(/\s+/);
            return {
                pid: parts[0],
                ppid: parts[1],
                cpu: parts[2],
                mem: parts[3],
                cmd: parts.slice(4).join(' ')
            };
        });

        // Filter and structure into a tree (simple flat list for now)
        const filtered = processes.filter(p =>
            !p.cmd.includes('ps -eo') &&
            !p.cmd.includes('process-tree.ts')
        );

        res.status(200).json({ processes: filtered });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}
