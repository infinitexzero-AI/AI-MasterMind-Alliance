import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let tailProcess: any = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET for SSE
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Determine the log file to tail
    // This could be passed via query string, or default to a known log path.
    // Let's assume there's a file at /tmp/ailcc_backend.log or we can tail the next process logs.
    const projectRoot = path.resolve(process.cwd(), '../..'); // Assuming dashboard is in AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard
    const defaultLogPath = path.join(projectRoot, 'logs/server.log');
    const logPath = req.query.path ? String(req.query.path) : defaultLogPath;

    // We can also just run "pm2 logs --raw" if the system uses PM2, but let's try a simple file tail for resilience
    let procToRun = 'tail';
    let procArgs = ['-n', '100', '-f', logPath];

    // Fallback if the path doesn't exist: simulate system logs
    if (!fs.existsSync(logPath) && !req.query.process) {
        // Send a message stating file not found, then stream simulated data or top output
        res.write(`data: [SYSTEM] Cannot find log file: ${logPath}\n\n`);
        procToRun = 'top';
        procArgs = ['-pid', process.pid.toString(), '-l', '0', '-s', '1']; // Tail top of this node process
    }

    // Start tail process
    try {
        if (tailProcess) {
            tailProcess.kill();
        }

        tailProcess = spawn(procToRun, procArgs);

        tailProcess.stdout.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString(), line })}\n\n`);
                }
            });
            // Try pushing it directly via flush
            if ((res as any).flush) (res as any).flush();
        });

        tailProcess.stderr.on('data', (data: Buffer) => {
            res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString(), line: '[ERROR] ' + data.toString().trim() })}\n\n`);
        });

        tailProcess.on('close', (code: number) => {
            res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString(), line: '[SYSTEM] Log stream ended with code ' + code })}\n\n`);
            res.end();
        });

    } catch (err) {
        res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString(), line: '[ERROR] Failed to start log stream stream.' })}\n\n`);
        res.end();
    }

    // Clean up when client disconnects
    req.on('close', () => {
        if (tailProcess) {
            tailProcess.kill();
            tailProcess = null;
        }
    });
}
