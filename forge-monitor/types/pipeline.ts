/**
 * Forge Monitor Type Definitions — Pipeline
 * Defines task execution pipeline telemetry models
 */

import { StatusLevel } from './agents';

export interface PipelineTaskMetrics {
  taskId: string;
  taskType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  agentAssigned: string;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration?: number; // ms
  successIndicator: boolean;
}

export interface PipelineTelemetry {
  timestamp: string; // ISO timestamp
  overallStatus: StatusLevel;
  tasksInFlight: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageLatency: number; // ms
  recentTasks: PipelineTaskMetrics[];
}

export interface PipelineAggregate {
  period: 'hourly' | 'daily';
  totalTasks: number;
  successRate: number; // 0-100
  averageLatency: number; // ms
  agentUtilization: Record<string, number>; // agent -> utilization %
}
