import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const VAULT_PATH = path.join(process.cwd(), '..', '..', '..', '..', '04_Intelligence_Vault');
const DATA_FILE = path.join(fs.realpathSync(VAULT_PATH), 'daily_entries.json');

function ensureFile() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: {} }));
}

function readData(): { entries: Record<string, any> } {
    ensureFile();
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {
        return { entries: {} };
    }
}

function writeData(data: { entries: Record<string, any> }) {
    ensureFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

function calculateStreak(entries: Record<string, any>): number {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const entry = entries[key];

        if (entry && (entry.topTask || entry.shutdownComplete || entry.reflection?.win)) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

function getWeek(entries: Record<string, any>) {
    const week = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const entry = entries[key];
        week.push({
            date: key,
            completed: !!(entry && (entry.topTask || entry.shutdownComplete)),
        });
    }

    return week;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const data = readData();
        const today = getToday();

        return res.json({
            today: data.entries[today] || null,
            streak: calculateStreak(data.entries),
            week: getWeek(data.entries),
        });
    }

    if (req.method === 'POST') {
        const data = readData();
        const today = getToday();
        const entry = req.body;

        data.entries[today] = {
            ...entry,
            date: today,
            updatedAt: new Date().toISOString(),
        };

        writeData(data);

        return res.json({
            success: true,
            streak: calculateStreak(data.entries),
            week: getWeek(data.entries),
        });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
