export type Priority = "low" | "medium" | "high" | "urgent";
export type AgentName = "OmniRouter" | "ResearchUnit" | "DevModule";
export type TaskSource = 'dashboard' | 'touchbar' | 'iphone' | 'grok' | 'system' | 'linear';
export type TaskStatus = "queued" | "active" | "completed" | "failed";
export type AgentAction = "spawn" | "pause" | "resume" | "kill";
export type AgentStatus = "idle" | "active" | "paused" | "offline";
export type ParaBucket = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';

export interface CreateTaskRequest {
  title: string;
  context: string;
  priority: Priority;
  targetAgent: AgentName;
  source: TaskSource;
  metadata?: Record<string, any>;
}

export interface Task {
  taskId: string;
  title: string;
  context: string;
  priority: Priority;
  targetAgent: AgentName;
  source: TaskSource;
  status: TaskStatus;
  progress: number;
  result?: any;
  startTime?: string;
  endTime?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  // -> Phase 154: PARA Omniversal Routing Protocol Integration
  paraBucket?: ParaBucket;
  primaryAreaId?: string;
}

export interface AgentInfo {
  name: AgentName;
  status: AgentStatus;
  uptime: number;
  completed: number;
}

export interface SystemHealth {
  agents: AgentInfo[];
  queue: {
    active: number;
    pending: number;
    done: number;
  };
  systemLoad: number;
}

export interface WebhookPayload {
  source: string;
  payload: Record<string, any>;
  signature: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
