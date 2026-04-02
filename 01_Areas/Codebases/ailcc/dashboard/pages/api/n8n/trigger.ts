import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    corsHeaders(req, res);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { workflowId, webhookUrl, label, data } = req.body;

    // For this prototype, we'll allow either a direct URL or ID lookup
    // In prod, map IDs to env vars to hide URLs from client

    let targetUrl = webhookUrl;
    if (!targetUrl && workflowId) {
        // Todo: Lookup ENV vars based on ID
        // targetUrl = process.env[`N8N_${workflowId}`];
    }

    if (!targetUrl) {
        // Mock success for UI demo if no real URL provided
        console.log(`[Mock] Triggered N8N Action: ${label || workflowId}`);
        await new Promise(r => setTimeout(r, 800)); // Fake latency
        return res.status(200).json({ success: true, mock: true });
    }

    try {
        const n8nRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || { triggeredBy: 'AILCC Dashboard', timestamp: new Date().toISOString() })
        });

        if (!n8nRes.ok) {
            throw new Error(`N8N responded with ${n8nRes.status}`);
        }

        return res.status(200).json({ success: true });
    } catch (err: unknown) {
        console.error('N8N Trigger Error:', err);
        return res.status(502).json({ success: false, error: (err instanceof Error ? err.message : String(err)) });
    }
}

export default withRateLimit(handler);
