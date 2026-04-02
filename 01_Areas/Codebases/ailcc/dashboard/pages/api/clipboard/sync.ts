import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 📋 AILCC Cross-Device Clipboard Sync (Phase 26)
 *
 * GET  /api/clipboard/sync  — returns current mac clipboard contents
 * POST /api/clipboard/sync  — pushes content into the mac clipboard
 *
 * Designed for the Telegram bot or mobile shortcut to push an error message
 * or URL from a mobile device directly into the Mac clipboard,
 * where it can immediately be used by an agent.
 */

async function getMacClipboard(): Promise<string> {
    const { stdout } = await execAsync('pbpaste', { timeout: 3000 });
    return stdout;
}

async function setMacClipboard(content: string): Promise<void> {
    // Echo to pbcopy — safest approach, handles all content types
    const { exec: execCb } = await import('child_process');
    await new Promise<void>((resolve, reject) => {
        const child = execCb('pbcopy', (err) => {
            if (err) reject(err);
            else resolve();
        });
        child.stdin?.write(content);
        child.stdin?.end();
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Optional: protect with shared secret
    const authHeader = req.headers['x-alliance-token'];
    const expectedToken = process.env.ALLIANCE_BOT_TOKEN;
    if (expectedToken && authHeader !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const content = await getMacClipboard();
            return res.status(200).json({
                success: true,
                content,
                length: content.length,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            return res.status(500).json({ error: String(e) });
        }
    }

    if (req.method === 'POST') {
        const { content } = req.body as { content: string };
        if (typeof content !== 'string') {
            return res.status(400).json({ error: 'content string required' });
        }

        try {
            await setMacClipboard(content);
            // Announce via TTS for immediate feedback
            exec(`say -v Samantha "Clipboard updated from external device" -r 185`);
            return res.status(200).json({
                success: true,
                message: 'Content pushed to Mac clipboard. Ready for agent use.',
                length: content.length
            });
        } catch (e) {
            return res.status(500).json({ error: String(e) });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
