import type { NextApiRequest, NextApiResponse } from 'next';

const BROWSER_SERVER = 'http://localhost:3333';

const SYSTEM_PROMPT = `You are an autonomous browser controller for the AILCC AI Mastermind dashboard.

Given a user task, respond with ONLY a valid JSON array of browser actions. No markdown, no explanation — raw JSON only.

Available actions:
- { "action": "navigate", "url": "https://..." }
- { "action": "click", "selector": "CSS selector" }
- { "action": "type", "selector": "CSS selector", "text": "text to type" }
- { "action": "press", "key": "Enter|Tab|Escape" }
- { "action": "wait", "ms": 1000 }
- { "action": "screenshot", "label": "description" }
- { "action": "extract", "selector": "CSS selector", "label": "what you're extracting" }
- { "action": "scroll", "x": 0, "y": 500 }
- { "action": "hover", "selector": "CSS selector" }

Rules:
1. Always start with navigate unless already on right page
2. Add wait (500-2000ms) after navigation and important clicks
3. Take screenshots at key moments
4. Use specific, robust CSS selectors
5. Plan minimal effective sequences`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { task, context } = req.body;
    if (!task) return res.status(400).json({ error: 'Missing task' });

    // Step 1: Check browser server is alive
    try {
        await fetch(`${BROWSER_SERVER}/status`).then(r => r.json());
    } catch {
        return res.status(503).json({
            error: 'Browser server offline.',
            suggestion: 'Start with: npm run agent'
        });
    }

    // Step 2: Ask Grok to plan the action sequence
    let actionPlan: unknown[] = [];
    try {
        const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'grok-2-1212',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Task: "${task}"\nAdditional context: "${context || 'none'}"\n\nRespond with only the JSON action array.` }
                ],
                temperature: 0.1
            })
        });

        if (!grokRes.ok) {
            throw new Error(`Grok API Error: ${grokRes.statusText}`);
        }

        const data = await grokRes.json();
        const raw = data.choices[0]?.message?.content || '';
        
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Grok did not return valid JSON action plan');
        actionPlan = JSON.parse(jsonMatch[0]);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: `Grok planning failed: ${msg}` });
    }

    // Step 3: Fire-and-forget execution to Playwright server (non-blocking)
    // The client connects to /api/browser-agent/stream for real-time updates
    fetch(`${BROWSER_SERVER}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: actionPlan }),
    }).catch(() => { /* stream will surface errors */ });

    // Return the plan immediately so the client can start streaming
    res.status(200).json({
        success: true,
        task,
        actionPlan,
        timestamp: new Date().toISOString(),
    });
}
