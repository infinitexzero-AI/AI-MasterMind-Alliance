import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const config = {
    api: {
        bodyParser: false, // Disallow Next.js body parser to handle formidable multipart
    },
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Parse multipart form
    const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        uploadDir: path.join(process.cwd(), '../tmp'), // Temporary upload dir
        keepExtensions: true,
    });

    try {
        // 1. Ensure temp dir exists
        const tmpDir = path.join(process.cwd(), '../tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const { _fields, files } = await new Promise<{ _fields: formidable.Fields, files: formidable.Files }>((resolve, reject) => {
            form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
                if (err) reject(err);
                resolve({ _fields: fields, files });
            });
        });

        // Extract file
        const fileArray = files.file;
        if (!fileArray || fileArray.length === 0) {
            return res.status(400).json({ message: 'No audio file uploaded.' });
        }
        const uploadedFile = fileArray[0];

        // 2. Transcribe Audio (Whisper)
        console.log(`[Voice API] Transcribing audio from ${uploadedFile.filepath}...`);
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(uploadedFile.filepath),
            model: 'whisper-1',
        });

        // Cleanup temporary file
        fs.unlinkSync(uploadedFile.filepath);

        const userText = transcription.text;
        const lowerText = userText.toLowerCase();
        console.log(`[Voice API] Trancription: "${userText}"`);

        let aiText = '';

        // 3. Route to Vanguard Swarm or Comet Bridge
        if (lowerText.includes('comet') || lowerText.includes('claw') || lowerText.includes('research')) {
            console.log(`[Voice API] Comet Protocol Triggered! Sideloading AppleScript bridge...`);

            const pyPath = path.join(process.cwd(), '../../.venv/bin/python');
            const scriptPath = path.join(process.cwd(), '../automations/integrations/comet_native_bridge.py');

            // Execute natively in the background (fire and forget)
            exec(`${pyPath} ${scriptPath} --query "${userText.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[Comet Bridge] exec error: ${error}`);
                    return;
                }
                if (stdout) console.log(`[Comet Bridge] stdout: ${stdout}`);
                if (stderr) console.error(`[Comet Bridge] stderr: ${stderr}`);
            });

            aiText = "Comet Native Bridge engaged. Transferring your visual request to Open Claw.";
        } else if (lowerText.includes('focus time') || lowerText.includes('focus mode')) {
            console.log(`[Voice API] Physical Focus Manifest requested.`);

            const pyPath = path.join(process.cwd(), '../../.venv/bin/python');
            const scriptPath = path.join(process.cwd(), '../automations/physical/home_bridge.py');

            exec(`${pyPath} ${scriptPath} --mode focus`);
            aiText = "Focus mode protocol initiated. Environmental synchronization complete.";
        } else if (lowerText.includes('friday') || lowerText.includes('twin')) {
            console.log(`[Voice API] Grounded Digital Twin requested. Invoking truth-check engine...`);

            const pyPath = path.join(process.cwd(), '../../.venv/bin/python');
            const scriptPath = path.join(process.cwd(), '../automations/intelligence/digital_twin_engine.py');

            // Execute synchronously to get the grounded response for TTS
            const groundedResult = await new Promise<string>((resolve) => {
                exec(`${pyPath} ${scriptPath} --query "${userText.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
                    if (error || stderr) {
                        console.error(`[Digital Twin] error: ${error || stderr}`);
                        resolve('Cognitive link degraded. Defaulting to safe-mode response.');
                    } else {
                        resolve(stdout.trim());
                    }
                });
            });

            aiText = groundedResult;
        } else {
            // Maintain standard contextual conversation with Friday via OpenAI for non-critical chat
            const chatResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are the Vanguard Swarm, specifically the persona "Friday". Answer Joel concisely and tactically in 1-2 sentences. Keep it punchy as it will be read aloud via TTS.' },
                    { role: 'user', content: userText }
                ],
                max_tokens: 100
            });
            aiText = chatResponse.choices[0].message.content || 'Acknowledged.';
        }

        console.log(`[Voice API] AI Response: "${aiText}"`);

        // 4. Synthesize Audio (TTS)
        console.log('[Voice API] Generating TTS audio...');
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'onyx', // Deep, authoritative voice
            input: aiText,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // 5. Stream back to client
        // We send the transcript in a custom header so the frontend can display what was heard
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('x-transcript', encodeURIComponent(userText)); // URL encode safely

        res.status(200).send(buffer);

    } catch (error: any) {
        console.error("[Voice API] Error processing request:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
