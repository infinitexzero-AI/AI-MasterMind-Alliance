import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
    success: boolean;
    message?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { command, payload } = req.body;

    if (!command) {
        return res.status(400).json({ success: false, error: 'Command is required' });
    }

    try {
        // Send command directly to the Neural Uplink bridge so Antigravity can intercept it
        const uplinkUrl = process.env.NEURAL_UPLINK_URL || 'http://localhost:5005';

        // We send this to the /api/antigravity/execute endpoint on the uplink server (Valentine/Relay)
        const response = await fetch(`${uplinkUrl}/api/antigravity/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command, payload }),
        });

        if (!response.ok) {
            throw new Error(`Uplink responded with status: ${response.status}`);
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            message: 'Command dispatched to Antigravity',
            ...data
        });

    } catch (error) {
        console.error('[API] Failed to dispatch Antigravity command:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to communicate with Neural Uplink. Ensure port 5005 is active.'
        });
    }
}
