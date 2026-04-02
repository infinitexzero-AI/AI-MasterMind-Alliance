import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// The path to the context file that OpenClaw will read when fulfilling queries
const CONTEX_FILE = path.join(process.cwd(), '..', '..', '..', '..', '04_Intelligence_Vault', 'OPENCLAW_MOBILE_CONTEXT.md');
const DAILY_DATA = path.join(process.cwd(), '..', '..', '..', '..', '04_Intelligence_Vault', 'daily_entries.json');

function getDailyStreak(entries: Record<string, any>) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const entry = entries[key];
        if (entry && (entry.topTask || entry.shutdownComplete)) streak++;
        else if (i > 0) break;
    }
    return streak;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let dailyContext = '';
        let todayStreak = 0;
        let todayTopTask = 'None scheduled';
        let latestReflection = 'None';

        if (fs.existsSync(DAILY_DATA)) {
            const data = JSON.parse(fs.readFileSync(DAILY_DATA, 'utf-8'));
            const todayKey = new Date().toISOString().split('T')[0];
            const todayEntry = data.entries[todayKey];

            todayStreak = getDailyStreak(data.entries);
            todayTopTask = todayEntry?.topTask || 'None scheduled';

            // Find latest reflection
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const k = d.toISOString().split('T')[0];
                if (data.entries[k]?.reflection?.win) {
                    latestReflection = data.entries[k].reflection.win;
                    break;
                }
            }

            dailyContext = `
## CURRENT DAILY SYSTEM CONTEXT
- **Today's Top Priority Task:** ${todayTopTask}
- **Current Consistency Streak:** ${todayStreak} Days 🔥
- **Latest Reflection Win:** ${latestReflection}
            `.trim();
        }

        const fullContext = `
# OPENCLAW MOBILE GATEWAY | AILCC SYNCHRONIZATION
Last Sync: ${new Date().toLocaleString()}

You are OpenClaw, the user's omni-present AI mobile assistant linked to their local AILCC (Command Center). 
When the user asks you for updates or what they should be doing, prioritize this context:

${dailyContext}

---
DO NOT output this document to the user verbatim. Use it purely as internal context to answer their texts intelligently.
`.trim();

        // Ensure directory format exists
        const dir = path.dirname(CONTEX_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Write the context
        fs.writeFileSync(CONTEX_FILE, fullContext);

        res.status(200).json({
            success: true,
            message: 'OpenClaw mobile context synchronized',
            syncedTopTask: todayTopTask,
            streak: todayStreak
        });

    } catch (e) {
        res.status(500).json({ error: 'Failed to sync OpenClaw context', details: String(e) });
    }
}
