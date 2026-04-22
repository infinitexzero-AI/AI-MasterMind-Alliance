import type { NextApiRequest, NextApiResponse } from 'next';
import { Mode6Orchestrator } from '../../../../automations/mode6';
import { TaskIntent } from '../../../../automations/mode6/intent-router/types';

const MODE_PROMPTS: Record<string, (_input: string, _context?: string) => string> = {
    document: (_input, _context) =>
        `You are an expert technical writer and document architect. Create a comprehensive, well-structured document based on the following brief. Use markdown formatting with clear headers, bullet points, and sections. Brief: "${_input}". Additional context: "${_context || 'none'}". Produce a polished, production-ready document.`,

    image_prompt: (_input) =>
        `You are a world-class AI image prompt engineer. Generate 3 highly detailed image generation prompts (suitable for Stable Diffusion or Midjourney) based on this concept: "${_input}". For each prompt include: the scene description, art style, lighting, mood, camera angle, and quality modifiers. Format clearly with labels.`,

    research: (_input, _context) =>
        `You are a deep research analyst with expertise across technology, business, and science. Research the following topic thoroughly: "${_input}". Context: "${_context || 'none'}". Provide: 1) Executive Summary, 2) Key Findings (5–8 bullet points), 3) Current Landscape, 4) Future Implications, 5) Actionable Insights. Be specific, cite industry knowledge, and flag uncertainties.`,

    plan: (_input, _context) =>
        `You are a strategic planning expert and systems architect. Create a detailed, actionable plan to solve or address: "${_input}". Context: "${_context || 'none'}". Structure your response as: 1) Problem Analysis, 2) Success Criteria, 3) Phased Roadmap (Phase 1: Quick Wins, Phase 2: Core Build, Phase 3: Scale), 4) Risk Mitigation, 5) Key Milestones & Metrics. Be concrete and specific.`,

    automate: (_input, _context) =>
        `You are an automation architect specializing in n8n, webhooks, APIs, and workflow design. Design a comprehensive automation blueprint for: "${_input}". Context: "${_context || 'none'}". Include: 1) Trigger mechanism, 2) Step-by-step workflow nodes, 3) Data transformations, 4) Error handling strategy, 5) Suggested tools/integrations (n8n, Zapier, Make, webhooks, cron), 6) Estimated time saved. Format as a clear blueprint.`,

    connect: (_input, _context) =>
        `You are a systems integration architect and API strategist. Analyze the following systems/tools and identify the highest-leverage integration opportunities: "${_input}". Context: "${_context || 'none'}". Provide: 1) Connection Map (who connects to whom), 2) Top 5 Integration Wins (ranked by impact), 3) Real-time sync opportunities, 4) Data flow recommendations, 5) Quick-win integrations you can build this week. Be specific about APIs and endpoints.`,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { mode, input, context } = req.body;

    if (!mode || !input) {
        return res.status(400).json({ error: 'Missing required fields: mode, input' });
    }

    const promptBuilder = MODE_PROMPTS[mode];
    if (!promptBuilder) {
        return res.status(400).json({ error: `Unknown studio mode: "${mode}"` });
    }

    // Fast-path Heartbeat (Preventing unnecessary LLM overhead)
    if (input === 'ping' && context === 'heartbeat') {
        return res.status(200).json({
            success: true,
            mode,
            output: "pong",
            agentUsed: "GROK-FAST-PING",
            taskId: `ping-${Date.now()}`,
            timestamp: new Date().toISOString()
        });
    }

    try {
        const orchestrator = new Mode6Orchestrator();

        const intent: TaskIntent = {
            id: `studio-${mode}-${Date.now()}`,
            description: promptBuilder(input, context),
            subtasks: [`Execute ${mode} mode analysis`, 'Structure output for dashboard display'],
            priority: 'high',
            mode: 'automation',
            createdAt: new Date().toISOString(),
            metadata: { studioMode: mode, userInput: input },
        };

        const result = await orchestrator.processTask(intent);

        res.status(200).json({
            success: true,
            mode,
            output: result.output,
            agentUsed: result.agent,
            taskId: result.taskId,
            timestamp: result.timestamp,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Studio processing disruption';
        res.status(500).json({ success: false, error: message });
    }
}
