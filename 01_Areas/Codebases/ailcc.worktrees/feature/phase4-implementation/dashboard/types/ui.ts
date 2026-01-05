export interface TelemetryData {
  timestamp: string;
  overallStatus: string;
  tasksInFlight: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageLatency: number;
  recentTasks: Task[];
}

export interface Task {
  taskId: string;
  taskType: string;
  status: string;
  agentAssigned: string;
  duration?: number;
  successIndicator?: boolean;
}

export interface ChronicleEvent {
  title: string;
  date: string;
  description: string;
}
