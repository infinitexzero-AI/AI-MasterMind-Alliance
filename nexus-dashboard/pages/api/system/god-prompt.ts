import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { directive } = req.body;
    
    if (!directive) {
        return res.status(400).json({ message: 'Empty Archon input.' });
    }

    try {
        const scriptPath = path.resolve(process.cwd(), 'core/god_prompt_dispatcher.py');
        const pythonProcess = spawn('python3', [scriptPath, directive]);

        // Non-blocking architecture. Returning 200 before the 5-day cascade finishes.
        return res.status(200).json({ status: 'Cascade Executed', message: 'Vanguard Swarm parallelized successfully.' });
    } catch (error) {
        console.error('God-Prompt Collision:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
