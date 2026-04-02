import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

const OMNI_QUEUE = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage/nexus_state/active_tasks.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        if (!fs.existsSync(OMNI_QUEUE)) {
            return res.status(200).json({ error: "Master ledger offline. Awaiting Swarm initialization." });
        }

        const data = fs.readFileSync(OMNI_QUEUE, 'utf-8');
        const tasks = JSON.parse(data);

        // Find the most recent standup injection
        const standupTask = tasks.find((t: any) => t.source === 'STANDUP_DAEMON' && t.priority === 'ALPHA');

        if (!standupTask) {
            return res.status(200).json({ error: "No priority Standup mandates registered today." });
        }

        return res.status(200).json({
            title: standupTask.title,
            directive: standupTask.directive,
            why: standupTask.why,
            timestamp: standupTask.id.replace('STANDUP-', '')
        });
        
    } catch (error: any) {
        console.error('[Standup API] Parse Error:', error);
        return res.status(500).json({ error: 'Chronicle extraction fault.' });
    }
}
