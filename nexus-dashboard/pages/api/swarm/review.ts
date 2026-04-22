import { NextApiRequest, NextApiResponse } from 'next';
import { SwarmOrchestrator, SwarmFeedback } from '../../../../automations/mode6';
import { guardDispatch } from '../../../lib/dispatch-guard';

// Use same singleton as dispatch (simplified for this task)
const swarm = new SwarmOrchestrator();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { sessionId, stepId, approved, comment, agentId } = req.body;

    if (!sessionId || !stepId) {
        return res.status(400).json({ message: 'SessionId and StepId are required.' });
    }

    // 🛡️ GUARDIAN DISPATCH GUARD — blocks quarantined agents from swarm review
    const reviewingAgent = (agentId || 'system').toLowerCase();
    const guard = await guardDispatch(reviewingAgent, `Swarm review: session=${sessionId} step=${stepId}`, { skipAudit: false });
    if (!guard.allowed) {
        return res.status(403).json({ blocked: true, blockedBy: guard.blockedBy, reason: guard.reason });
    }

    try {
        const feedback: SwarmFeedback = { stepId, approved, comment };
        const session = await swarm.provideReview(sessionId, feedback);

        res.status(200).json({
            success: true,
            session: session,
            message: approved ? 'Step approved, swarm resuming...' : 'Step rejected, swarm halted.'
        });
    } catch (error: unknown) {
        console.error('Swarm Review Error:', error);
        res.status(500).json({ success: false, error: (error instanceof Error ? error.message : String(error)) });
    }
}
