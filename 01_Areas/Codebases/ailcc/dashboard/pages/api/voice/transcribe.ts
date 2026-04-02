import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
    api: {
        bodyParser: false,
    },
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const form = formidable({});

    try {
        const [, files] = await form.parse(req);
        const file = files.file?.[0];

        if (!file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        if (!process.env.OPENAI_API_KEY) {
            // Mock response if no API key for demonstration, but log the warning
            console.warn("OPENAI_API_KEY missing. Falling back to mock transcription.");
            return res.status(200).json({ text: "Deploy Vanguard Swarm to audit the project (MOCK)" });
        }

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(file.filepath),
            model: "whisper-1",
        });

        res.status(200).json({ text: transcription.text });
    } catch (error: any) {
        console.error("Transcription Error:", error);
        res.status(500).json({ error: "Transcription service unavailable" });
    }
}
