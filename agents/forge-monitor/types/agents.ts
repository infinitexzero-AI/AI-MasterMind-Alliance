/**
 * Forge Monitor Type Definitions — Agents
 * Defines agent health, status, and capability models
 */

export type StatusLevel = 'ok' | 'warn' | 'error';

export interface AgentHealth {
  agentName: string;
  status: StatusLevel;
  uptime: number; // seconds
  lastHeartbeat: string; // ISO timestamp
  errorCount: number;
  successCount: number;
}

export interface AgentStatus {
  agentName: string;
  availability: 'available' | 'busy' | 'unavailable';
  currentTask?: string;
  queuedTasks: number;
  capabilities: string[];
  latency: number; // ms
}

export interface AgentCapabilityMatrix {
  agent: string;
  capabilities: string[];
  maxContextTokens: number;
  costPerThousandTokens: number; // $
}
