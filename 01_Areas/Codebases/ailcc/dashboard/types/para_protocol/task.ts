// task.ts

import { ParaBucket, ParaMeta } from './para';

export type TaskDomain = 'TECH' | 'LIFE' | 'ALL';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AgentAttribution {
  id: string;                // agent id in your registry
  name: string;              // e.g. 'COMET', 'CLAUDE', 'GROK', 'ANTIGRAVITY'
  role?: string;             // e.g. 'RESEARCH', 'PLANNER', 'EXECUTOR'
  confidence?: number;       // 0-1, how confident this agent is in its action
  lastTouchedAt?: string;    // ISO timestamp
}

export interface TaskTimebox {
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
  dueAt?: string;            // ISO, optional
  completedAt?: string;      // ISO, optional
}

export interface UnifiedTask extends ParaMeta {
  id: string;
  title: string;
  description?: string;

  domain: TaskDomain;
  status: TaskStatus;
  priority: TaskPriority;

  // PARA: enforce allowed buckets at the task level
  paraBucket: ParaBucket;       // should be 'PROJECT' or 'AREA' in most cases

  // Linkage
  parentId?: string;            // parent task (for subtasks)
  areaId?: string;              // convenience field mirroring primaryAreaId
  projectId?: string;           // if this is a subtask of a project
  resourceIds?: string[];       // linked Resource ids (docs, notes, etc.)

  // Agents
  createdBy: string;            // 'HUMAN' or Agent id
  ownerId?: string;             // primary responsible agent or human
  attribution?: AgentAttribution[];

  // Metrics
  estimateMinutes?: number;
  actualMinutes?: number;

  // Time
  timebox: TaskTimebox;

  // Free-form extensions for future agents
  tags?: string[];
  metadata?: Record<string, unknown>;
}
