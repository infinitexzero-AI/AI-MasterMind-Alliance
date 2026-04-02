import { AgentType } from '../intent-router/types';

export type SwarmStatus = 'PENDING' | 'PLANNING' | 'EXECUTING' | 'AWAITING_REVIEW' | 'COMPLETED' | 'FAILED';

export interface SwarmStep {
    id: string;
    description: string;
    targetAgent: AgentType | 'human';
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'awaiting_approval' | 'approved';
    result?: string;
    output?: string;
    requiresApproval: boolean;
    dependencies: string[]; // IDs of steps that must complete first
    metadata?: Record<string, unknown>;
    metrics?: {
        tokensUsed: number;
        cost: number;
        latency: number;
    };
}

export interface SwarmError {
    stepId: string;
    agent: AgentType;
    error: string;
    timestamp: string;
    retryCount: number;
    maxRetries: number;
    stack?: string;
    details?: string;
}

export interface AgentMetrics {
    agent: AgentType;
    activeSteps: number;
    pendingSteps: number;
    completedSteps: number;
    capacity: number;
    latency: number;
    efficiency: number;
    tokensUsed: number;
    tokenLimit: number;
}

export interface SwarmMetrics {
    totalCost: number;
    dailyBudget: number;
    agentCosts: {
        agent: string;
        cost: number;
        tokens: number;
        percentage: number;
    }[];
    workloads: AgentMetrics[];
}

export interface SwarmSession {
    id: string;
    goal: string;
    status: SwarmStatus;
    steps: SwarmStep[];
    currentStepId?: string;
    metrics: SwarmMetrics;
    errors: SwarmError[];
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}

export interface SwarmFeedback {
    stepId: string;
    approved: boolean;
    comment?: string;
    revisedPlan?: Partial<SwarmStep>[];
}
