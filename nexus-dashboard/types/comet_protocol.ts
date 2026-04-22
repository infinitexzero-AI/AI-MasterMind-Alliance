/**
 * Comet Protocol
 * Shared definitions for communication between Python Orchestrator and Dashboard
 */

export interface CometMessage {
    type: 'HEARTBEAT' | 'TASK_UPDATE' | 'LOG' | 'ALERT' | 'USER_FEEDBACK';
    timestamp: string;
    payload: any;
}

export interface SystemStats {
    cpu: number;
    memory: number; // in GB or %
    network: number; // MB/s or activity score
    status: 'ONLINE' | 'OFFLINE';
}

export interface TaskUpdate {
    taskId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'WAITING_FOR_INPUT';
    progress: number; // 0-100
    message: string;
    requiredInput?: {
        type: 'CONFIRMATION' | 'TEXT';
        prompt: string;
        options?: string[];
    };
}

export interface MasterCycleData {
    currentMode: string;
    systemStatus: string; // e.g., "●●●●● (5/5 integrations active)"
    reason: string;
    stats: {
        student: string;
        professional: string;
        life: string;
        selfActualized: string;
        automation: string;
    };
    priorities: string[];
    teamStatus: {
        superGrok: string;
        comet: string;
        grok: string;
        perplexity: string;
    };
}

// Example Message:
// {
//   type: "HEARTBEAT",
//   payload: { cpu: 12.5, memory: 45, status: "ONLINE" }
// }
