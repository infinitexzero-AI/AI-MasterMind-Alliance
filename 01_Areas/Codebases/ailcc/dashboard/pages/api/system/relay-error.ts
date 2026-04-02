import type { NextApiRequest, NextApiResponse } from 'next';
import { Mode6Orchestrator } from '../../../../automations/mode6';
import { TaskIntent } from '../../../../automations/mode6/intent-router/types';

/**
 * Neural Error Relay API
 * Dispatches system errors to a multi-AI swarm for autonomous refinement and resolution.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { errorLog, source, context } = req.body;

    if (!errorLog) {
        return res.status(400).json({ error: 'Missing error log data' });
    }

    try {
        const orchestrator = new Mode6Orchestrator();

        const intent: TaskIntent = {
            id: `relay-${Date.now()}`,
            description: `Analyze and suggest a fix for the following system error encountered in ${source || 'dashboard'}: "${errorLog}"`,
            subtasks: [
                'Identify root cause',
                'Check for visual or logic inconsistencies',
                'Suggest code refinement or self-healing patch'
            ],
            priority: 'high',
            mode: 'automation',
            createdAt: new Date().toISOString(),
            // Adding additional context for the AI router
            metadata: {
                errorSource: source,
                context: context || 'observability_stream'
            }
        };

        // Process via Mode 6 (Routes to Grok by default for complex logic/analysis)
        const result = await orchestrator.processTask(intent);

        res.status(200).json({
            success: true,
            taskId: result.taskId,
            suggestion: result.output,
            agentUsed: result.agent,
            timestamp: result.timestamp
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Relay disruption encountered';
        res.status(500).json({ success: false, error: message });
    }
}
