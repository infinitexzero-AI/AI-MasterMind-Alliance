import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🔌 AILCC Tactical Air-Gap Mode (Phase 25)
 *
 * When enabled, the system switches to local-only operation mode:
 * - Blocks all external HTTP calls from agents
 * - Forces LLM traffic to local Ollama only
 * - Emits a system-wide AIR_GAP_ACTIVE event
 *
 * Air-gap state is persisted to a local state file so it survives restarts.
 */

const STATE_FILE = path.join(process.cwd(), '.air-gap.json');

interface AirGapState {
    enabled: boolean;
    enabledAt?: string;
    enabledBy?: string;
    reason?: string;
}

function readState(): AirGapState {
    if (!fs.existsSync(STATE_FILE)) return { enabled: false };
    try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); }
    catch { return { enabled: false }; }
}

function writeState(state: AirGapState): void {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function emitEvent(message: string, severity: 'info' | 'warning' | 'error') {
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'AirGap', message, severity, timestamp: new Date().toISOString() })
        });
    } catch { /* suppress */ }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return res.status(200).json(readState());
    }

    if (req.method === 'POST') {
        const { enable, reason, enabledBy } = req.body as {
            enable: boolean; reason?: string; enabledBy?: string;
        };

        const newState: AirGapState = {
            enabled: enable,
            enabledAt: enable ? new Date().toISOString() : undefined,
            enabledBy: enabledBy ?? 'DASHBOARD',
            reason: reason ?? (enable ? 'Manual activation' : undefined)
        };

        writeState(newState);

        const msg = enable
            ? `[AIR_GAP_ACTIVE] 🔌 Tactical Air-Gap engaged. All external connections blocked. Local-only mode.`
            : `[AIR_GAP_LIFTED] 🌐 Air-Gap disengaged. External network access restored.`;

        await emitEvent(msg, enable ? 'warning' : 'info');

        return res.status(200).json({ success: true, state: newState });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Utility: Check if air-gap is currently active from any server-side code.
 */
export function isAirGapActive(): boolean {
    return readState().enabled;
}
