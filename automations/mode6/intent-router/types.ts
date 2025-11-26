/**
 * Mode 6 Type Definitions
 * Shared interfaces for intent routing, agent coordination, and memory management
 */

export type AgentType = 'supergrok' | 'claude' | 'comet' | 'chatgpt' | 'grok' | 'openai';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ModeType = 'student' | 'professional' | 'life' | 'self-actualized' | 'automation' | 'mode-6';

/**
 * Task intent received from Linear or user input
 */
export interface TaskIntent {
  id: string;
  linearId?: string;
  description: string;
  subtasks?: string[];
  priority: TaskPriority;
  mode: ModeType;
  requiredContext?: Record<string, any>;
  createdAt: string;
  createdBy?: string;
}

/**
 * Routing decision made by IntentRouter
 */
export interface RoutingDecision {
  intentId: string;
  primaryAgent: AgentType;
  secondaryAgents: AgentType[];
  reasoning: string;
  escalationPath: string;
  contextWindowRequired: number;
}

/**
 * Handoff context following multi-agent-sop.md protocol
 */
export interface HandoffContext {
  taskId: string;
  sourceMode: string;
  targetAgent?: string;
  secondaryAgents?: string[];
  timestamp: Date;
  metadata?: Record<string, any>;
  taskData?: any;
  escalationPath?: string;
  format?: string; // [SOURCE_AGENT] → [TARGET_AGENT]
  context?: {
    fullTaskDescription?: string;
    subtasks?: string[];
    relatedContext?: Record<string, any>;
    linearTicket?: string;
  };
  expectedOutput?: {
    format?: string;
    includeMetadata?: boolean;
  };
}

/**
 * Dispatch result from agent adapter execution
 */
export interface DispatchResult {
  success: boolean;
  taskId: string;
  agentUsed: string;
  output?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Agent capability matrix for routing decisions
 */
export interface AgentCapabilities {
  agent: AgentType;
  primarySkills: string[];
  secondarySkills: string[];
  contextLimit: number;
  latencyProfile: 'instant' | 'standard' | 'high';
  availableNow: boolean;
}

/**
 * Execution result from agent completion
 */
export interface ExecutionResult {
  taskId: string;
  agent: AgentType;
  status: 'completed' | 'failed' | 'partial' | 'escalated';
  output: any;
  metadata: {
    executionTime: number;
    tokensUsed?: number;
    errors?: string[];
  };
  timestamp: string;
}

/**
 * Memory entry for cross-agent context
 */
export interface MemoryEntry {
  id: string;
  taskId: string;
  sourceAgent?: AgentType;
  content: string;
  timestamp: Date;
  ttl: number; // Time to live in seconds
  context?: Record<string, any>;
  relationshipType?: 'prerequisite' | 'related' | 'follow-up' | 'escalation';
  expiresAt?: string;
  createdAt?: string;
}

/**
 * Mode-specific routing table (from multi-agent-sop.md)
 */
export interface ModeRoutingTable {
  mode: ModeType;
  primaryAgent: AgentType;
  backupAgent: AgentType;
  requiresVerification: boolean;
  escalationThreshold: 'context-overflow' | 'unavailable' | 'conflicting-output';
}
