import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const MACROS_FILE = path.join(DATA_DIR, 'custom_macros.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (req.method === 'GET') {
        if (!fs.existsSync(MACROS_FILE)) {
            return res.status(200).json([]);
        }
        const data = fs.readFileSync(MACROS_FILE, 'utf8');
        return res.status(200).json(JSON.parse(data));
    }

    if (req.method === 'POST') {
        const { label, prompt, icon, color } = req.body;

        let macros = [];
        if (fs.existsSync(MACROS_FILE)) {
            macros = JSON.parse(fs.readFileSync(MACROS_FILE, 'utf8'));
        }

        const newMacro = {
            id: `macro_${Date.now()}`,
            label,
            prompt,
            icon: icon || 'terminal',
            color: color || 'hover:bg-indigo-500/20 text-indigo-400',
            createdAt: new Date().toISOString()
        };

        macros.push(newMacro);
        fs.writeFileSync(MACROS_FILE, JSON.stringify(macros, null, 2));

        return res.status(201).json(newMacro);
    }

    res.status(405).json({ message: 'Method not allowed' });
}
