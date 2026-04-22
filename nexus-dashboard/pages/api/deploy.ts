import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        // We use GET for SSE subscription
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Simulation Steps
    const steps = [
        { msg: 'Initializing Build Environment...', delay: 1000 },
        { msg: 'Cloning Repository...', delay: 2000 },
        { msg: 'Running Type Checks...', delay: 3500 },
        { msg: 'Optimizing Static Assets...', delay: 5000 },
        { msg: 'Pushing to Edge Network...', delay: 7000 },
        { msg: 'Verifying Integrity...', delay: 8500 },
        { msg: 'DEPLOYMENT COMPLETE: v2.4.0-rc1', delay: 10000, type: 'success' }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep >= steps.length) {
            clearInterval(interval);
            res.end();
            return;
        }

        const step = steps[currentStep];
        const payload = JSON.stringify({
            message: step.msg,
            progress: Math.round(((currentStep + 1) / steps.length) * 100),
            status: step.type || 'info'
        });

        res.write(`data: ${payload}\n\n`);
        currentStep++;
    }, 1500);

    // Cleanup if client disconnects
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
}
