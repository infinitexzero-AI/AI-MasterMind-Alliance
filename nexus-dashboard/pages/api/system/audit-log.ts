import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * 📋 AILCC Tamper-Evident Audit Log (Phase 24)
 *
 * Append-only audit log API. Every entry is chained with the SHA-256 hash
 * of the previous entry, making tampering detectable (blockchain-lite principle).
 * Accepts POST to append entries, GET to read the last N entries.
 */

const LOG_PATH = path.join(process.cwd(), 'logs', 'audit.jsonl');
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

interface AuditEntry {
    seq: number;
    timestamp: string;
    agentId?: string;
    action: string;
    source: string;
    details: string;
    prevHash: string;
    hash: string;
}

function hashEntry(entry: Omit<AuditEntry, 'hash'>): string {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(entry))
        .digest('hex');
}

function getLastEntry(): AuditEntry | null {
    if (!fs.existsSync(LOG_PATH)) return null;
    const lines = fs.readFileSync(LOG_PATH, 'utf-8').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    try {
        return JSON.parse(lines[lines.length - 1]) as AuditEntry;
    } catch {
        return null;
    }
}

function appendEntry(action: string, source: string, details: string, agentId?: string): AuditEntry {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const last = getLastEntry();
    const seq = (last?.seq ?? 0) + 1;
    const prevHash = last?.hash ?? GENESIS_HASH;

    const entryWithoutHash = {
        seq,
        timestamp: new Date().toISOString(),
        agentId,
        action,
        source,
        details,
        prevHash
    };
    const hash = hashEntry(entryWithoutHash);
    const entry: AuditEntry = { ...entryWithoutHash, hash };

    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf-8');
    return entry;
}

function readEntries(limit = 50): AuditEntry[] {
    if (!fs.existsSync(LOG_PATH)) return [];
    const lines = fs.readFileSync(LOG_PATH, 'utf-8').split('\n').filter(Boolean);
    return lines.slice(-limit).map(l => {
        try { return JSON.parse(l) as AuditEntry; } catch { return null; }
    }).filter(Boolean) as AuditEntry[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { action, source, details, agentId } = req.body as {
            action: string; source: string; details: string; agentId?: string;
        };
        if (!action || !source) return res.status(400).json({ error: 'action and source required' });
        const entry = appendEntry(action, source, details ?? '', agentId);
        return res.status(200).json({ success: true, entry });
    }

    if (req.method === 'GET') {
        const limit = parseInt((req.query.limit as string) ?? '50', 10);
        const entries = readEntries(limit);

        // Basic tamper check — verify the hash chain is unbroken
        let chainValid = true;
        for (let i = 1; i < entries.length; i++) {
            const prev = entries[i - 1];
            const curr = entries[i];
            if (curr.prevHash !== prev.hash) { chainValid = false; break; }
        }

        return res.status(200).json({ entries, chainValid, total: entries.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
