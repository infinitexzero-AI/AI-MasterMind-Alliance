const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

// Zero-dependency native .env parsing
const envPath = path.join(__dirname, '../../01_Areas/Codebases/ailcc/dashboard/.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.+)$/);
        if (match) process.env[match[1].trim()] = match[2].trim().replace(/(^"|"$)/g, '');
    });
}

const XAI_API_KEY = process.env.XAI_API_KEY;
const PORT = process.env.CLAUDE_PROXY_PORT || 8095;

if (!XAI_API_KEY) {
    console.error("❌ CRITICAL: XAI_API_KEY is missing from Vanguard environment.");
    process.exit(1);
}

// Translate Anthropic message format to OpenAI (Grok) format
function translateAnthropicToOpenAI(anthropicBody) {
    const messages = [];

    // Map system prompt
    if (anthropicBody.system) {
        let systemContent = anthropicBody.system;
        if (Array.isArray(systemContent)) {
            systemContent = systemContent.map(b => b.text).join('\n');
        }
        messages.push({ role: 'system', content: systemContent });
    }

    // Map user/assistant interactions
    if (anthropicBody.messages) {
        for (const msg of anthropicBody.messages) {
            let content = msg.content;
            if (Array.isArray(content)) {
                content = content.filter(b => b.type === 'text').map(b => b.text).join('\n');
            }
            messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: content });
        }
    }

    return {
        model: 'grok-beta', // Defaulting to the active Grok Beta endpoint
        messages: messages,
        temperature: anthropicBody.temperature || 0.7,
        max_tokens: anthropicBody.max_tokens || 4096,
        stream: anthropicBody.stream || false
    };
}

const server = http.createServer((req, res) => {
    // CORS headers for browser-based Claude clients
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    console.log(`[Proxy Traffic] ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    // Strip query parameters for routing logic
    const basePath = req.url.split('?')[0];

    if (req.method === 'POST' && basePath === '/v1/messages') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const anthropicReq = JSON.parse(body);
                const isStream = anthropicReq.stream;
                const grokReq = translateAnthropicToOpenAI(anthropicReq);

                const options = {
                    hostname: 'api.x.ai',
                    path: '/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${XAI_API_KEY}`
                    }
                };

                console.log(`[Proxy] Forwarding to Grok: ${grokReq.messages.length} messages (Stream: ${isStream})`);

                const proxyReq = https.request(options, (proxyRes) => {
                    if (proxyRes.statusCode !== 200) {
                        let errorBody = '';
                        proxyRes.on('data', chunk => errorBody += chunk);
                        proxyRes.on('end', () => {
                            console.error(`[Proxy Upstream HTTP ${proxyRes.statusCode}]:`, errorBody);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                error: {
                                    type: 'api_error',
                                    message: `Grok Upstream Error (${proxyRes.statusCode}): ${errorBody}`
                                }
                            }));
                        });
                        return;
                    }

                    if (!isStream) {
                        // Non-streaming fallback
                        let responseData = '';
                        proxyRes.on('data', chunk => responseData += chunk);
                        proxyRes.on('end', () => {
                            try {
                                const grokJson = JSON.parse(responseData);
                                const anthropicRes = {
                                    id: `msg_${Date.now()}`,
                                    type: 'message',
                                    role: 'assistant',
                                    content: [{ type: 'text', text: grokJson.choices[0].message.content }],
                                    model: anthropicReq.model,
                                    stop_reason: 'end_turn',
                                    stop_sequence: null,
                                    usage: { input_tokens: grokJson.usage?.prompt_tokens || 0, output_tokens: grokJson.usage?.completion_tokens || 0 }
                                };
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(anthropicRes));
                            } catch (e) {
                                res.writeHead(500);
                                res.end(JSON.stringify({ error: { message: 'Translation engine failure', type: 'api_error' }}));
                            }
                        });
                        return;
                    }

                    // Handling Streaming Mode (Required for Claude Desktop)
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    });

                    // Send Anthropic stream initiation
                    res.write(`event: message_start\ndata: ${JSON.stringify({ type: 'message_start', message: { id: `msg_${Date.now()}`, type: 'message', role: 'assistant', model: anthropicReq.model, usage: { input_tokens: 0, output_tokens: 0 } } })}\n\n`);
                    res.write(`event: content_block_start\ndata: ${JSON.stringify({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })}\n\n`);

                    proxyRes.on('data', chunk => {
                        const chunkStr = chunk.toString();
                        if (chunkStr.includes('error')) {
                            console.error("[Proxy Upstream Error]:", chunkStr);
                        }
                        
                        const lines = chunkStr.split('\n').filter(line => line.trim() !== '');
                        for (const line of lines) {
                            if (line === 'data: [DONE]') {
                                res.write(`event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n`);
                                res.write(`event: message_stop\ndata: {"type":"message_stop"}\n\n`);
                                return res.end();
                            }
                            if (line.startsWith('data: ')) {
                                try {
                                    const parsed = JSON.parse(line.slice(6));
                                    const content = parsed.choices[0]?.delta?.content;
                                    if (content) {
                                        // Package OpenAI delta into Anthropic content block delta
                                        const event = {
                                            type: 'content_block_delta',
                                            index: 0,
                                            delta: { type: 'text_delta', text: content }
                                        };
                                        res.write(`event: content_block_delta\ndata: ${JSON.stringify(event)}\n\n`);
                                    }
                                } catch (e) {
                                    // Ignore broken chunks in stream
                                }
                            }
                        }
                    });

                    proxyRes.on('error', (e) => {
                        console.error("[Proxy Stream Error]:", e.message);
                        res.write(`event: error\ndata: {"type": "error", "error": {"type": "api_error", "message": "Grok upstream disruption"}}\n\n`);
                        res.end();
                    });
                });

                proxyReq.on('error', (e) => {
                    console.error("[Proxy Network Error]:", e.message);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: { type: 'api_error', message: 'Failed to reach Grok API' } }));
                });

                proxyReq.write(JSON.stringify(grokReq));
                proxyReq.end();

            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: { message: 'Invalid JSON', type: 'invalid_request_error' } }));
            }
        });
    } else if (req.method === 'GET' && basePath === '/v1/models') {
        // Mock models endpoint so Chatbox API Check succeeds
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            data: [
                { id: 'claude-opus-4-1', type: 'model' },
                { id: 'claude-sonnet-4-5', type: 'model' },
                { id: 'claude-haiku-4-5', type: 'model' }
            ]
        }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint not found. Point client to /v1/messages' }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🧩 [Claude → Grok] Translation Proxy active on PORT ${PORT}`);
    console.log(`=> Point Claude Desktop / APIs to: http://localhost:${PORT}`);
    console.log(`=> Authorized by: Mastermind Alliance`);
});
