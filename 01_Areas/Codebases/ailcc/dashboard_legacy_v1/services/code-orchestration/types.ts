
export type AgentType = 'claude' | 'copilot' | 'gemini';
export type TaskComplexity = 'simple' | 'medium' | 'complex';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface CodeGenerationTask {
  id: string;
  description: string;
  files: string[];
  complexity: TaskComplexity;
  assignedAgent?: AgentType;
  status: TaskStatus;
  code?: string;
  error?: string;
}

export interface OrchestratorState {
  isProcessing: boolean;
  tasks: CodeGenerationTask[];
  originalPrompt: string;
}
