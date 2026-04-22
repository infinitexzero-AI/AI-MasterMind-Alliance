/**
 * AILCC DASHBOARD COMPONENT SPECIFICATIONS
 * Target: Antigravity (Builder)
 * Context: Phase 3 UI Sprint
 */

// --- 1. CORE TYPES ---

export type TaskClassification =
    | 'TYPE_A_BROWSER'   // Route to Comet (Research/Verify)
    | 'TYPE_B_DESKTOP'   // Route to Antigravity (File/Sys)
    | 'TYPE_C_HYBRID'    // Sequential Handoff
    | 'TYPE_D_PARALLEL'; // Swarm Execution

export type AgentStatus = 'IDLE' | 'THINKING' | 'EXECUTING' | 'OFFLINE';

export interface NeuromorphicContext {
    cellType: string;
    heritage: string;
    archetype: string;
}

export interface Agent {
    id: string;
    name: string; // e.g., "Grok", "Comet"
    role: string; // e.g., "Supervisor", "Architect"
    skills?: string[]; // Granular capabilities
    status: AgentStatus;
    currentTask?: string;
    costSession: number; // Real-time cost tracking
    significance?: number; // 0-100 weight of current task
    throughput?: number; // 0-100 data processing volume
    neuromorphic?: NeuromorphicContext;
    // -> Phase 154: PARA Protocol
    currentBucket?: 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';
}

export interface StorageState {
    active: boolean;
    filesPerSec: number;
    totalFiles: number;
    synced: number;
    lastSync?: string | null;
}

export interface SystemState {
    agents: Agent[];
    telemetry: any;
    storage: {
        icloud: StorageState;
        onedrive: StorageState;
    };
}

// --- 2. COMPONENT PROPS ---

/**
 * Visualizes the 11-agent swarm status.
 * Requirement: Use pulsing indicators for 'EXECUTING' status.
 */
export interface AgentMonitorProps {
    agents: Agent[];
    onAgentSelect(_id: string): void;
    networkStatus: 'CONNECTED' | 'DISCONNECTED';
}

/**
 * The "Brain" view. Shows tasks moving through the Mode 6 loop.
 * Visualizes the Routing -> Execution -> Verification pipeline.
 */
export interface OrchestrationPanelProps {
    currentIntent: string;
    classification: TaskClassification;
    activeStep: 'ROUTER' | 'DISPATCH' | 'EXECUTE' | 'VERIFY' | 'COMPLETE';
    traceLog: string[]; // Last 5 steps
    onDispatch?(_id: string): void;
}

/**
 * Real-time metrics for cost and performance.
 * Requirement: Red alert if cost > budget.
 */
export interface TelemetryChartsProps {
    fps: number;
    latencyMs: number;
    totalCost: number;
    dailyBudget: number;
    gateStatus: {
        research: boolean;
        analysis: boolean;
        codegen: boolean;
        deploy: boolean;
    };
}

/**
 * Raw data stream for debugging.
 * Must render JSON with syntax highlighting.
 */
export interface StateViewerProps {
    logs: Array<{
        timestamp: string;
        source: 'COMET' | 'ANTIGRAVITY' | 'SYSTEM';
        message: string;
        payload?: any;
    }>;
}
