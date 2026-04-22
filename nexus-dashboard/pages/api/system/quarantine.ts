import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🧊 AILCC Agent Quarantine System (Phase 25)
 *
 * Allows operators to "freeze" a misbehaving agent node.
 * Quarantined agents are blocked from executing commands until
 * manually unquarantined. State is persisted and visible on the Cortex Map.
 */

const QUARANTINE_FILE = path.join(process.cwd(), '.quarantine.json');

interface QuarantineState {
    [agentId: string]: {
        name: string;
        quarantinedAt: string;
        reason: string;
        active: boolean;
    };
}

function readQuarantineState(): QuarantineState {
    if (!fs.existsSync(QUARANTINE_FILE)) return {};
    try { return JSON.parse(fs.readFileSync(QUARANTINE_FILE, 'utf-8')); }
    catch { return {}; }
}

function saveQuarantineState(state: QuarantineState): void {
    fs.writeFileSync(QUARANTINE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function emitEvent(message: string, severity: 'info' | 'warning' | 'error') {
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'Quarantine', message, severity, timestamp: new Date().toISOString() })
        });
    } catch { /* suppress */ }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET — return full quarantine state
    if (req.method === 'GET') {
        const state = readQuarantineState();
        const quarantined = Object.entries(state)
            .filter(([, v]) => v.active)
            .map(([id, v]) => ({ id, ...v }));
        return res.status(200).json({ quarantined, total: quarantined.length });
    }

    // POST — quarantine an agent
    if (req.method === 'POST') {
        const { agentId, name, reason } = req.body as {
            agentId: string; name: string; reason?: string;
        };
        if (!agentId || !name) return res.status(400).json({ error: 'agentId and name required' });

        const state = readQuarantineState();
        state[agentId] = {
            name,
            quarantinedAt: new Date().toISOString(),
            reason: reason ?? 'Manual quarantine',
            active: true
        };
        saveQuarantineState(state);

        await emitEvent(
            `[AGENT_QUARANTINED] 🧊 Agent ${name} (${agentId}) has been quarantined. Reason: ${reason ?? 'Manual'}`,
            'warning'
        );
        return res.status(200).json({ success: true, agentId, name });
    }

    // DELETE — release an agent from quarantine
    if (req.method === 'DELETE') {
        const { agentId } = req.body as { agentId: string };
        if (!agentId) return res.status(400).json({ error: 'agentId required' });

        const state = readQuarantineState();
        if (state[agentId]) {
            state[agentId].active = false;
            saveQuarantineState(state);
            await emitEvent(
                `[AGENT_RELEASED] 🟢 Agent ${state[agentId].name} (${agentId}) has been released from quarantine.`,
                'info'
            );
        }
        return res.status(200).json({ success: true, agentId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Utility: Check if a specific agent is currently quarantined.
 */
export function isAgentQuarantined(agentId: string): boolean {
    const state = readQuarantineState();
    return state[agentId]?.active === true;
}
