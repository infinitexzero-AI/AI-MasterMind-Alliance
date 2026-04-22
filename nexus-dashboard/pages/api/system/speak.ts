import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { text, voice = 'Samantha' } = req.body;
    
    if (!text) {
        return res.status(400).json({ message: 'Missing speech payload.' });
    }

    try {
        const pythonScript = `
import sys
sys.path.append('${path.resolve(process.cwd())}')
from core.speech_engine import SpeechEngine
SpeechEngine.speak("${text.replace(/"/g, '\\"')}", voice="${voice}", block=False)
`;
        
        const pythonProcess = spawn('python3', ['-c', pythonScript]);

        return res.status(200).json({ status: 'Processing', message: 'Vanguard TTS hardware synthesized successfully.' });
    } catch (error) {
        console.error('Failed to trigger native TTS:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
