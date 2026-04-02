import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({
        agents: [
            { agentName: 'Orchestrator', status: 'active', uptime: 100, successCount: 1, errorCount: 0, lastHeartbeat: new Date().toISOString() },
            { agentName: 'Researcher', status: 'idle', uptime: 100, successCount: 0, errorCount: 0, lastHeartbeat: new Date().toISOString() }
        ]
    });
}
