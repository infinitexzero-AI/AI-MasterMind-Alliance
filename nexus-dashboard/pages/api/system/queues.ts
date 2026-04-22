import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Simulate swarm task data
    const tasks = [
        {
            id: 'task-1024',
            label: 'Vector Embedding Generation',
            status: 'active',
            priority: 'high',
            agent: 'GEMINI-CRAFT',
            progress: 65,
            createdAt: new Date(Date.now() - 300000).toISOString(),
        },
        {
            id: 'task-1025',
            label: 'Aesthetic CSS Refactoring',
            status: 'active',
            priority: 'medium',
            agent: 'VALENTINE',
            progress: 42,
            createdAt: new Date(Date.now() - 600000).toISOString(),
        },
        {
            id: 'task-1026',
            label: 'Security Audit: OpenClaw Keys',
            status: 'pending',
            priority: 'critical',
            agent: null,
            progress: 0,
            createdAt: new Date(Date.now() - 10000).toISOString(),
        },
        {
            id: 'task-1027',
            label: 'Log Analysis: Synapse Delay',
            status: 'pending',
            priority: 'low',
            agent: null,
            progress: 0,
            createdAt: new Date(Date.now() - 50000).toISOString(),
        },
        {
            id: 'task-1020',
            label: 'Dashboard Hydration Fix',
            status: 'completed',
            priority: 'high',
            agent: 'ANTIGRAVITY',
            progress: 100,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
        }
    ];

    res.status(200).json({
        success: true,
        queues: {
            pending: tasks.filter(t => t.status === 'pending'),
            active: tasks.filter(t => t.status === 'active'),
            completed: tasks.filter(t => t.status === 'completed'),
        },
        stats: {
            total: tasks.length,
            throughput: '12 tasks/hr',
            latency: '450ms'
        },
        timestamp: new Date().toISOString()
    });
}
