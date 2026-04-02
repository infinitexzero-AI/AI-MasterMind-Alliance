import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const pythonScriptPath = path.resolve(process.cwd(), 'automations/integrations/neural_memory_pruning.py');
        
        // Use spawn to correctly stream massive AI processing without blocking Event Loop
        const pythonProcess = spawn('python3', [pythonScriptPath, '--run']);
        
        // We will just let it run asynchronously and return a 200 immediately to the UI
        // since pruning could take multiple minutes traversing ChromaDB and Ollama.
        pythonProcess.stdout.on('data', (data) => {
            console.log(`[Memory Pruner]: ${data.toString().trim()}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Memory Pruner ERROR]: ${data.toString().trim()}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`[Memory Pruner] Exhausted with status code ${code}`);
        });

        return res.status(200).json({ status: 'Processing', message: 'Neural memory semantic pruning sequence initialized via PM2 loop wrapper.' });
    } catch (error) {
        console.error('Failed to trigger Memory Pruning:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
