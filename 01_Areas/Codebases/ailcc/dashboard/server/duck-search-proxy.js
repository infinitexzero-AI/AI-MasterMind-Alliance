const http = require('http');

// A free web search proxy that uses the Playwright Server (Port 3333) to drive a real browser
const PORT = 3334;
const PLAYWRIGHT_URL = 'http://127.0.0.1:3333/execute';

async function performSearch(query) {
    console.log(`[DuckProxy] Performing browser search for: "${query}"`);

    try {
        // 1. Navigate to DuckDuckGo Lite (extremely fast, low noise, text-heavy)
        const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;

        await sendPlaywrightAction({
            actions: [
                { action: 'navigate', url: searchUrl },
                { action: 'wait', ms: 2000 }
            ]
        });

        // 2. Extract results from DDG Lite page
        const response = await sendPlaywrightAction({
            actions: [
                { action: 'extract', selector: 'body' }
            ]
        });

        // Playwright server returns { success: true, actionLog: [...] }
        if (response.success && response.actionLog && response.actionLog.length > 0) {
            const extractionResult = response.actionLog[response.actionLog.length - 1];
            const text = extractionResult.extracted || "";

            if (text && text !== '(not found)') {
                console.log(`[DuckProxy] Extraction successful. Text length: ${text.length}`);
                return { text: "Web Results (via DuckDuckGo Lite):\n\n" + text.slice(0, 4000), citations: [] };
            }
        }

        console.warn(`[DuckProxy] Extraction returned no content. Response:`, JSON.stringify(response));
        return { text: "No search results found.", citations: [] };

    } catch (e) {
        console.error('[DuckProxy] Browser search error:', e);
        return { text: `Error performing browser search: ${e.message}`, citations: [] };
    }
}

async function sendPlaywrightAction(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request(PLAYWRIGHT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// The server must perfectly impersonate the Perplexity Chat Completions endpoint
const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const json = JSON.parse(body);
                const query = json.messages?.[json.messages.length - 1]?.content || 'Empty search';

                const { text, citations } = await performSearch(query);

                const responsePayload = {
                    id: "duckproxy-" + Date.now(),
                    model: json.model || "duckduckgo",
                    object: "chat.completion",
                    created: Math.floor(Date.now() / 1000),
                    choices: [
                        {
                            index: 0,
                            finish_reason: "stop",
                            message: {
                                role: "assistant",
                                content: text
                            }
                        }
                    ],
                    citations: citations || []
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(responsePayload));
            } catch (e) {
                console.error('[DuckProxy] Request generic error', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: { message: "Internal Proxy Error" } }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[DuckProxy] 🦆 Free browser-based search proxy running at http://127.0.0.1:${PORT}`);
});
