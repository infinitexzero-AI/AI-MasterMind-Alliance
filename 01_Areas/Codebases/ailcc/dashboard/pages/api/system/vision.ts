import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST only' });
    }

    const { imagePath } = req.body;
    if (!imagePath) {
        return res.status(400).json({ error: 'imagePath is required' });
    }

    const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);

    if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ error: 'Image not found' });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'ocr-bridge.swift');
    const command = `swift "${scriptPath}" "${absolutePath}"`;

    try {
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.warn(`OCR Warning: ${stderr}`);
        }

        const lines = stdout.split('\n').filter(l => l.trim() !== '');
        res.status(200).json({
            text: stdout.trim(),
            lines,
            count: lines.length
        });
    } catch (error: any) {
        console.error(`OCR Execution Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}
