import type { NextApiRequest, NextApiResponse } from 'next';

export interface SwarmStep {
    id: string;
    description: string;
    targetAgent: string;
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'awaiting_approval';
    requiresApproval: boolean;
    metrics?: {
        tokensUsed: number;
        cost: number;
        latency: number;
    };
}

export interface SwarmSession {
    id: string;
    goal: string;
    status: 'PENDING' | 'PLANNING' | 'EXECUTING' | 'AWAITING_REVIEW' | 'COMPLETED' | 'FAILED';
    steps: SwarmStep[];
    currentStepId?: string;
    metrics: {
        totalCost: number;
        dailyBudget: number;
        agentCosts: {
            agent: string;
            cost: number;
            tokens: number;
            percentage: number;
        }[];
        workloads: {
            agent: string;
            activeSteps: number;
            pendingSteps: number;
            completedSteps: number;
            capacity: number;
            latency: number;
            efficiency: number;
            tokensUsed: number;
            tokenLimit: number;
        }[];
    };
    errors: {
        stepId: string;
        agent: string;
        error: string;
        timestamp: string;
        retryCount: number;
        maxRetries: number;
        details?: string;
    }[];
}

// In-memory session store (replace with Redis/DB in production)
let currentSession: SwarmSession = {
    id: 'swarm-session-001',
    goal: 'Research agent observability patterns and build /api/swarm endpoints',
    status: 'EXECUTING',
    steps: [
        {
            id: 'step-001',
            description: 'Send research directive to Comet (Perplexity)',
            targetAgent: 'comet',
            status: 'completed',
            requiresApproval: false,
            metrics: { tokensUsed: 450, cost: 0.12, latency: 4500 }
        },
        {
            id: 'step-002',
            description: 'Build /api/swarm/session endpoint',
            targetAgent: 'grok',
            status: 'executing',
            requiresApproval: false,
            metrics: { tokensUsed: 1200, cost: 0.45, latency: 1200 }
        },
        {
            id: 'step-003',
            description: 'Implement approval workflow handlers',
            targetAgent: 'grok',
            status: 'pending',
            requiresApproval: false,
        },
        {
            id: 'step-004',
            description: 'Review Comet research findings',
            targetAgent: 'human',
            status: 'awaiting_approval',
            requiresApproval: true,
        },
        {
            id: 'step-005',
            description: 'Implement observability enhancements',
            targetAgent: 'grok',
            status: 'pending',
            requiresApproval: true,
        },
    ],
    currentStepId: 'step-002',
    metrics: {
        totalCost: 1.57,
        dailyBudget: 10.0,
        agentCosts: [
            { agent: 'comet', cost: 0.12, tokens: 450, percentage: 8 },
            { agent: 'grok', cost: 1.45, tokens: 2800, percentage: 92 }
        ],
        workloads: [
            {
                agent: 'comet',
                activeSteps: 0,
                pendingSteps: 0,
                completedSteps: 1,
                capacity: 5,
                latency: 4500,
                efficiency: 98,
                tokensUsed: 450,
                tokenLimit: 50000
            },
            {
                agent: 'grok',
                activeSteps: 1,
                pendingSteps: 2,
                completedSteps: 0,
                capacity: 45,
                latency: 1200,
                efficiency: 92,
                tokensUsed: 2800,
                tokenLimit: 100000
            }
        ]
    },
    errors: [
        {
            stepId: 'step-001',
            agent: 'comet',
            error: 'Rate limit hit on Perplexity API',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            retryCount: 2,
            maxRetries: 5
        }
    ]
};

// Export for use by other API routes
export function getSession(): SwarmSession {
    return currentSession;
}

export function updateSession(session: SwarmSession): void {
    currentSession = session;
}

export function updateStepStatus(stepId: string, status: SwarmStep['status']): SwarmStep | null {
    const step = currentSession.steps.find(s => s.id === stepId);
    if (step) {
        step.status = status;
        // Auto-advance currentStepId if completing current step
        if (status === 'completed' && stepId === currentSession.currentStepId) {
            const nextPending = currentSession.steps.find(s => s.status === 'pending');
            currentSession.currentStepId = nextPending?.id;
        }
    }
    return step || null;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ session: SwarmSession } | { error: string }>
) {
    if (req.method === 'GET') {
        return res.status(200).json({ session: currentSession });
    }

    if (req.method === 'POST') {
        // Update session
        const { goal, status } = req.body;
        if (goal) currentSession.goal = goal;
        if (status) currentSession.status = status;
        return res.status(200).json({ session: currentSession });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

