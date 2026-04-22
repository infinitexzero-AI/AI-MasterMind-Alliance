import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface UpgradeLog {
    timestamp: string;
    tab: string;
    status: string;
    message: string;
}

interface UpgradeStatus {
    lastAudit: string;
    pendingImprovements: number;
    recentLogs: UpgradeLog[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UpgradeStatus | { success: boolean; message: string; error?: string }>
) {
    const LOG_FILE = '/Users/infinite27/AILCC_PRIME/logs/openclaw_upgrades.log';

    if (req.method === 'GET') {
        try {
            // Read last 10 lines of the upgrade log
            const { stdout } = await execAsync(`tail -n 20 ${LOG_FILE} 2>/dev/null || echo ""`);
            const lines = stdout.split('\n').filter(Boolean);

            const recentLogs: UpgradeLog[] = lines.map(line => {
                const match = line.match(/^\[(.+?)\] (.*)$/);
                if (match) {
                    const [, ts, msg] = match;
                    const tabMatch = msg.match(/Tab: \[(.*?)\]/);
                    return {
                        timestamp: ts,
                        tab: tabMatch ? tabMatch[1] : 'SYSTEM',
                        status: msg.includes('✅') ? 'SUCCESS' : msg.includes('🚀') ? 'START' : 'INFO',
                        message: msg
                    };
                }
                return { timestamp: '', tab: 'N/A', status: 'RAW', message: line };
            });

            res.status(200).json({
                lastAudit: recentLogs[0]?.timestamp || 'NEVER',
                pendingImprovements: 0,
                recentLogs
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to retrieve upgrade logs', error: String(err) });
        }
    } else if (req.method === 'POST') {
        // Trigger a manual audit
        try {
            exec('bash /Users/infinite27/AILCC_PRIME/scripts/openclaw_upgrade_engine.sh &');
            res.status(200).json({ success: true, message: 'OpenClaw Upgrade Engine dispatched.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to dispatch upgrade engine', error: String(err) });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
