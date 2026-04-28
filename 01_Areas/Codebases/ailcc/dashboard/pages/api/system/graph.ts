import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Real-world mapping of the Vanguard / AIMmA Ecosystem
    const nodes = [
        // Core Infrastructure
        { id: 'ThinkPad-Prime', type: 'host', label: 'ThinkPad Prime (Vanguard)', val: 45, role: 'Compute Node', status: 'ONLINE' },
        { id: 'OneDrive-Nexus', type: 'storage', label: 'OneDrive Nexus', val: 35, role: 'Central Sync', status: 'SYNCED' },
        { id: 'Vanguard-Dashboard', type: 'interface', label: 'Nexus Dashboard (Port 3000)', val: 30, role: 'Control Surface', status: 'ACTIVE' },

        // Agents (Swarm)
        { id: 'Antigravity', type: 'agent', label: 'Antigravity Ω', val: 25, role: 'Lead Execution', status: 'READY' },
        { id: 'Grok', type: 'agent', label: 'Grok (Strategic)', val: 20, role: 'Audit & Analysis', status: 'READY' },
        { id: 'Valentine', type: 'agent', label: 'Valentine (Cortex)', val: 20, role: 'Orchestrator', status: 'STANDBY' },
        { id: 'Comet', type: 'agent', label: 'Comet (Scout)', val: 15, role: 'Web Research', status: 'READY' },

        // Data Domains / Critical Artifacts
        { id: 'Tax-Crisis-Defense', type: 'memory', label: 'Tax Crisis Defense (2026)', val: 20, role: 'Mission Critical', status: 'ACTIVE' },
        { id: 'Academic-Hub', type: 'memory', label: 'Academic Hub (S26)', val: 18, role: 'B.Sc Biology Path', status: 'TRACKING' },
        { id: 'Wealth-Nexus', type: 'memory', label: 'Wealth Nexus', val: 15, role: 'Capital Surplus', status: 'GATED' },

        // External Links
        { id: 'CRA-Portal', type: 'external', label: 'CRA (My Business)', val: 10, role: 'Target Compliance', status: 'GATED' },
        { id: 'TurboTax-Online', type: 'external', label: 'TurboTax Online', val: 10, role: 'Filing Surface', status: 'ACTIVE' }
    ];

    const links = [
        // Infrastructure Links
        { source: 'ThinkPad-Prime', target: 'OneDrive-Nexus', label: 'UPLINK' },
        { source: 'ThinkPad-Prime', target: 'Vanguard-Dashboard', label: 'RENDER' },
        
        // Agent Assignments
        { source: 'Antigravity', target: 'ThinkPad-Prime', label: 'EXEC' },
        { source: 'Grok', target: 'Tax-Crisis-Defense', label: 'AUDIT' },
        { source: 'Valentine', target: 'ThinkPad-Prime', label: 'ORCH' },
        { source: 'Comet', target: 'ThinkPad-Prime', label: 'RESEARCH' },

        // Data Flow
        { source: 'Tax-Crisis-Defense', target: 'OneDrive-Nexus', label: 'PERSIST' },
        { source: 'Academic-Hub', target: 'OneDrive-Nexus', label: 'PERSIST' },
        { source: 'Tax-Crisis-Defense', target: 'TurboTax-Online', label: 'SUBMIT' },
        { source: 'Tax-Crisis-Defense', target: 'CRA-Portal', label: 'DEFEND' }
    ];

    res.status(200).json({ nodes, links });
}
