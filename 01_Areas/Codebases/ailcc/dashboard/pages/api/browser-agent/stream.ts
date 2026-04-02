import type { NextApiRequest, NextApiResponse } from 'next';

const BROWSER_SERVER = 'http://localhost:3333';

/**
 * GET /api/browser-agent/stream
 * SSE proxy — forwards real-time action events from the Playwright server.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let upstreamResponse: any = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let retries = 0;
    const MAX_RETRIES = 5;

    const connectUpstream = async (): Promise<boolean> => {
        while (retries < MAX_RETRIES) {
            try {
                const res = await fetch(`${BROWSER_SERVER}/stream`);
                if (res.ok) {
                    upstreamResponse = res;
                    return true;
                }
            } catch (e) {
                console.log(`[SSE Proxy] Upstream connection attempt ${retries + 1} failed...`);
            }
            retries++;
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
        }
        return false;
    };

    try {
        const connected = await connectUpstream();
        if (!connected || !upstreamResponse || !upstreamResponse.body) {
            throw new Error('Failed to connect to browser server after multiple retries.');
        }

        reader = upstreamResponse.body.getReader();
        const decoder = new TextDecoder();

        const heartbeat = setInterval(() => {
            try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
        }, 15000);

        req.on('close', () => {
            clearInterval(heartbeat);
            if (reader) {
                reader.cancel().catch(() => { });
            }
        });

        let streaming = true;
        while (streaming && reader) {
            const { done, value } = await reader.read();
            if (done) { streaming = false; break; }
            res.write(decoder.decode(value, { stream: true }));
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`);
    } finally {
        res.end();
    }
}
