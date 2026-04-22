import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Static mapping of the Alliance ecosystem
    const nodes = [
        // Agents
        { id: 'Antigravity', group: 1, label: 'Antigravity (Mac)', size: 40 },
        { id: 'OpenClaw', group: 1, label: 'OpenClaw (Mobile)', size: 35 },
        { id: 'Scholar', group: 1, label: 'Scholar Mode', size: 30 },

        // Services
        { id: 'Ollama', group: 2, label: 'Ollama LPU', size: 25 },
        { id: 'NeuralUplink', group: 2, label: 'Neural Uplink (5005)', size: 20 },
        { id: 'DuckProxy', group: 2, label: 'Duck Search Proxy', size: 15 },
        { id: 'Playwright', group: 2, label: 'Playwright Browser', size: 15 },

        // Storage
        { id: 'IntelligenceVault', group: 3, label: 'Intelligence Vault', size: 20 },
        { id: 'DailyEntries', group: 3, label: 'Daily Entries', size: 15 }
    ];

    const links = [
        { source: 'Antigravity', target: 'NeuralUplink', label: 'Commands' },
        { source: 'OpenClaw', target: 'NeuralUplink', label: 'Sync' },
        { source: 'NeuralUplink', target: 'IntelligenceVault', label: 'Persist' },
        { source: 'Antigravity', target: 'Ollama', label: 'Query' },
        { source: 'OpenClaw', target: 'Ollama', label: 'Query' },
        { source: 'Scholar', target: 'Ollama', label: 'Query' },
        { source: 'Antigravity', target: 'DuckProxy', label: 'Search' },
        { source: 'DuckProxy', target: 'Playwright', label: 'Bypass' },
        { source: 'Antigravity', target: 'DailyEntries', label: 'Track' }
    ];

    res.status(200).json({ nodes, links });
}
