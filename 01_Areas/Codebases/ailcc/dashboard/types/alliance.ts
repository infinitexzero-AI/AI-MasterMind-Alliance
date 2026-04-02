/**
 * AI Mastermind Alliance (AIMmA)
 * Unified Task Schema v3.0 — Autonomous Delegation
 */

export type AgentName = 'COMET' | 'ANTIGRAVITY' | 'GROK' | 'GROK_ARCH' | 'GEMINI' | 'JUDGE' | 'VALENTINE';

export type TaskStatus = 'QUEUED' | 'IN_PROGRESS' | 'BLOCKED' | 'SUCCESS' | 'FAILED' | 'REVIEW';

export type TaskSource = 'LINEAR' | 'GITHUB' | 'DASHBOARD' | 'SYSTEM';

export interface UnifiedTask {
    id: string;
    source: TaskSource;
    assignedTo: AgentName;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'RESEARCH' | 'DEVELOPMENT' | 'INTEGRATION' | 'DOCUMENTATION' | 'STRATEGY' | 'BIOPSYCH' | 'OPERATIONS';
    track: 'TECH' | 'LIFE';
    directive: string;
    narrative?: string;
    why?: string;
    description?: string;
    autoRoute?: boolean;
    delegationChain?: AgentName[];
    successCriteria: string[];
    status: TaskStatus;
    context: {
        repo?: string;
        vaultPath?: string;
        filePaths?: string[];
        url?: string;
    };
    telemetry: {
        progress: number; // 0 to 100
        lastEvent?: string;
        startedAt?: string;
        completedAt?: string;
        error?: string;
    };
    artifacts?: {
        name: string;
        path: string;
        type: string;
    }[];
}

export interface AgentRosterItem {
    name: AgentName;
    role: string;
    status: 'online' | 'offline' | 'busy' | 'idle';
    currentTask?: string;
    lastSeen: string;
    metrics: {
        tasksCompleted: number;
        successRate: number;
        latency: number;
    };
}
