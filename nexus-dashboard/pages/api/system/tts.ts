import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 🎙️ AILCC High-Fidelity TTS Bridge (Phase 26)
 *
 * POST /api/system/tts
 * Converts text to speech using the best available voice engine:
 * 1. OpenAI TTS (if OPENAI_API_KEY set) — premium quality
 * 2. macOS `say` command — zero-latency local fallback
 *
 * Body: { text: string, voice?: string, rate?: number }
 */

// macOS system voices with great quality
const MAC_VOICES: Record<string, string> = {
    default: 'Samantha',
    alex: 'Alex',
    allison: 'Allison',
    ava: 'Ava',
    karen: 'Karen',
    tom: 'Tom',
};

async function speakWithMacOS(text: string, voice: string, rate: number): Promise<void> {
    const safeText = text.replace(/"/g, '\\"').replace(/`/g, '\\`').slice(0, 500);
    const macVoice = MAC_VOICES[voice.toLowerCase()] ?? MAC_VOICES.default;
    await execAsync(`say -v "${macVoice}" -r ${rate} "${safeText}"`, { timeout: 15000 });
}

async function speakWithOpenAI(text: string, voice: string): Promise<Buffer> {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error('OPENAI_API_KEY not set');

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text.slice(0, 4096),
            voice: voice || 'nova',
            response_format: 'mp3'
        })
    });

    if (!response.ok) throw new Error(`OpenAI TTS failed: ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text, voice = 'default', rate = 185, mode = 'auto' } = req.body as {
        text: string; voice?: string; rate?: number; mode?: 'auto' | 'macos' | 'openai';
    };

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text string required' });
    }

    // OpenAI mode — returns audio buffer to play client-side
    if ((mode === 'openai' || mode === 'auto') && process.env.OPENAI_API_KEY) {
        try {
            const audioBuffer = await speakWithOpenAI(text, voice);
            res.setHeader('Content-Type', 'audio/mpeg');
            return res.status(200).send(audioBuffer);
        } catch (e) {
            if (mode === 'openai') {
                return res.status(500).json({ error: String(e) });
            }
            // Fall through to macOS
        }
    }

    // macOS say — fires and returns immediately (plays on the Mac speaker)
    try {
        speakWithMacOS(text, voice, rate); // fire-and-forget
        return res.status(200).json({
            success: true,
            engine: 'macos-say',
            voice: MAC_VOICES[voice.toLowerCase()] ?? MAC_VOICES.default,
            characters: text.length
        });
    } catch (e) {
        return res.status(500).json({ error: String(e) });
    }
}
