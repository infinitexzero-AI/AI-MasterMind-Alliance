import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 📱 AILCC Telegram Command Shortcuts (Phase 26)
 *
 * POST /api/telegram/shortcuts
 * Accepts a shortcut command name from Telegram and executes it.
 * Designed to be called by the Alliance Bot webhook.
 *
 * Supported commands:
 *   status   — Returns system health summary
 *   reboot   — Restarts the lifecycle (daemons + dashboard)
 *   deploy   — Triggers a production build
 *   airtgap  — Toggles air-gap mode
 *   scout    — Triggers a SCOUT documentation pass
 *   audit    — Returns the last 5 audit log entries
 */

const ALLOWED_COMMANDS = ['status', 'reboot', 'deploy', 'airgap', 'scout', 'audit'] as const;
type ShortcutCommand = typeof ALLOWED_COMMANDS[number];

async function getSystemStatus(): Promise<string> {
    try {
        const res = await fetch('http://localhost:3000/api/system/health');
        if (!res.ok) return '⚠️ Dashboard unreachable';
        const data = await res.json();
        return `✅ System Online\nCPU: ${data.cpu ?? 'N/A'}%\nMemory: ${data.memory ?? 'N/A'}%\nUptime: ${data.uptime ?? 'N/A'}`;
    } catch {
        return '⚠️ Status check failed — dashboard may be offline';
    }
}

async function triggerScout(): Promise<string> {
    try {
        const res = await fetch('http://localhost:3000/api/scout', { method: 'POST' });
        return res.ok ? '🕵️ SCOUT pass triggered — docs indexing in background.' : '⚠️ SCOUT trigger failed.';
    } catch {
        return '⚠️ Could not reach SCOUT endpoint.';
    }
}

async function getAuditTail(): Promise<string> {
    try {
        const res = await fetch('http://localhost:3000/api/system/audit-log?limit=5');
        if (!res.ok) return '⚠️ Audit log unavailable';
        const data = await res.json();
        const lines = (data.entries as Array<{ seq: number; action: string; source: string; timestamp: string }> ?? [])
            .reverse()
            .map(e => `#${e.seq} [${e.action}] ${e.source} @ ${new Date(e.timestamp).toLocaleTimeString()}`)
            .join('\n');
        return `📋 Last 5 Audit Entries:\n${lines || 'No entries yet'}`;
    } catch {
        return '⚠️ Could not read audit log.';
    }
}

async function toggleAirGap(): Promise<string> {
    try {
        const statusRes = await fetch('http://localhost:3000/api/system/air-gap');
        const current = await statusRes.json();
        const next = !current.enabled;
        await fetch('http://localhost:3000/api/system/air-gap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enable: next, enabledBy: 'TELEGRAM', reason: 'Telegram shortcut' })
        });
        return next ? '🔌 Air-Gap ENGAGED — external network blocked.' : '🌐 Air-Gap LIFTED — network restored.';
    } catch {
        return '⚠️ Air-gap toggle failed.';
    }
}

async function triggerDeploy(): Promise<string> {
    // Fire build in background, don't wait for full output
    exec(
        'npm run build > /tmp/deploy.log 2>&1',
        { cwd: '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard' }
    );
    return '🚀 Production build triggered. Check /tmp/deploy.log for output.';
}

async function triggerReboot(): Promise<string> {
    exec('bash /Users/infinite27/AILCC_PRIME/scripts/api/.alliance_lifecycle.sh > /tmp/reboot.log 2>&1 &');
    return '♻️ Alliance lifecycle reboot initiated.';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Basic auth via shared secret
    const authHeader = req.headers['x-alliance-token'];
    const expectedToken = process.env.ALLIANCE_BOT_TOKEN;
    if (expectedToken && authHeader !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { command } = req.body as { command: string };
    const cmd = command?.toLowerCase().trim() as ShortcutCommand;

    if (!ALLOWED_COMMANDS.includes(cmd as ShortcutCommand)) {
        return res.status(400).json({
            error: `Unknown command. Allowed: ${ALLOWED_COMMANDS.join(', ')}`
        });
    }

    let response = '';
    switch (cmd) {
        case 'status': response = await getSystemStatus(); break;
        case 'scout': response = await triggerScout(); break;
        case 'audit': response = await getAuditTail(); break;
        case 'airgap': response = await toggleAirGap(); break;
        case 'deploy': response = await triggerDeploy(); break;
        case 'reboot': response = await triggerReboot(); break;
    }

    return res.status(200).json({ success: true, command: cmd, response });
}
