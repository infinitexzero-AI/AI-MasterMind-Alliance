
export interface Task {
  id: string;
  description: string;
  source: 'comet' | 'user' | 'automation' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
  result?: unknown;
}

export type AgentRole = 'orchestrator' | 'coder' | 'researcher' | 'strategist' | 'automation';

export interface AgentResponse {
  success: boolean;
  output: string;
  metadata?: Record<string, unknown>;
}
