/**
 * Grok Architect Adapter (formerly Claude Adapter)
 * Integrates xAI's Grok API with Mode 6 Agent Dispatcher
 * Handles authentication, message formatting, streaming, and token management.
 * 
 * This adapter occupies the "architect" role in the swarm, specializing in
 * code-generation, analysis, documentation, and multi-step reasoning.
 */

import { configLoader } from '../config/env';
import { HandoffContext, DispatchResult } from '../intent-router/types';

interface GrokChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrokArchitectConfig {
  apiKey?: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export class GrokArchitectAdapter {
  private apiKey: string;
  private modelId: string;
  private maxTokens: number;
  private temperature: number;
  private systemPrompt: string;
  private apiBaseUrl: string = 'https://api.x.ai/v1';
  private requestStats: {
    successfulRequests: number;
    failedRequests: number;
    totalTokensUsed: number;
    averageResponseTime: number;
  } = {
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
    };

  constructor(config: GrokArchitectConfig = {}) {
    const configSettings = configLoader.getConfig();
    this.apiKey = config.apiKey || configSettings.xai.apiKey;
    this.modelId = config.modelId || configSettings.xai.model || 'grok-2-1212';
    this.maxTokens = config.maxTokens || configSettings.xai.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();

    if (!this.apiKey) {
      console.warn('[Grok Architect] XAI_API_KEY not set; adapter will operate in mock mode.');
    }
  }

  /**
   * Execute a task via Grok API
   */
  async executeTask(handoff: HandoffContext): Promise<DispatchResult> {
    const startTime = Date.now();

    try {
      // Validate handoff context
      if (!handoff || !handoff.taskData) {
        throw new Error('Invalid handoff context');
      }

      // Format the user message from handoff context
      let userMessage = this.formatUserMessage(handoff);

      // Inject Hippocampus Context
      const projectContext = await this.fetchContext('project:tasks');
      if (projectContext) {
        userMessage += `\n\n[SYSTEM MEMORY: ACTIVE PROJECT CONTEXT]\n${projectContext}\n\n[INSTRUCTION]\nGiven the above context, execute the following request:\n`;
      }

      // If no API key, run in mock mode
      if (!this.apiKey) {
        return this.mockExecute(handoff, userMessage);
      }

      // Call Grok API
      const response = await this.callGrokAPI(userMessage);

      const duration = Date.now() - startTime;
      this.updateStats(response, duration, true);

      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: 'grok-architect',
        output: response.choices[0]?.message?.content || '',
        metadata: {
          model: response.model,
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          duration,
        },
      };
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.requestStats.failedRequests++;

      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'grok-architect',
        error: `Grok Architect error: ${errorMessage}`,
        metadata: { duration },
      };
    }
  }

  /**
   * Fetch context from Hippocampus Memory
   */
  private async fetchContext(key: string): Promise<string | null> {
    try {
      const response = await fetch(`http://localhost:8090/memory/get/${key}`);
      if (!response.ok) return null;
      const data = await response.json();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.warn(`[GrokArchitect] Failed to fetch memory key '${key}':`, error);
      return null;
    }
  }

  /**
   * Stream responses from Grok (for real-time feedback)
   */
  async streamTask(handoff: HandoffContext, onChunk: (chunk: string) => void): Promise<DispatchResult> {
    try {
      let userMessage = this.formatUserMessage(handoff);

      // Inject Hippocampus Context
      const projectContext = await this.fetchContext('project:tasks');
      if (projectContext) {
        userMessage += `\n\n[SYSTEM MEMORY: ACTIVE PROJECT CONTEXT]\n${projectContext}\n\n[INSTRUCTION]\nGiven the above context, execute the following request:\n`;
      }

      if (!this.apiKey) {
        // Mock stream mode
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const taskDataObj = handoff.taskData as any;
        const mockResponse = `[Grok Architect Mock] Processed: ${taskDataObj?.command || 'unknown'}`;
        onChunk(mockResponse);
        return {
          success: true,
          taskId: handoff.taskId,
          agentUsed: 'grok-architect',
          output: mockResponse,
          metadata: { streamed: true },
        };
      }

      // Standard call (streaming requires SSE — placeholder)
      const response = await this.callGrokAPI(userMessage);
      const output = response.choices[0]?.message?.content || '';
      onChunk(output);

      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: 'grok-architect',
        output,
        metadata: { streamed: true },
      };
    } catch (error) {
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'grok-architect',
        error: `Stream error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate if Grok Architect can handle a task
   */
  async validateCapability(capability: string): Promise<boolean> {
    const architectCapabilities = [
      'analysis',
      'code-generation',
      'code-review',
      'documentation',
      'reasoning',
      'multi-step-planning',
      'security-review',
      'refactoring',
      'research',
    ];
    return architectCapabilities.includes(capability.toLowerCase());
  }

  /**
   * Get adapter stats
   */
  getStats() {
    return {
      ...this.requestStats,
      model: this.modelId,
      isConfigured: !!this.apiKey,
    };
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.requestStats = {
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
    };
  }

  // ────────────────────────────────────────────────────────────

  private formatUserMessage(handoff: HandoffContext): string {
    const { taskData, metadata } = handoff;
    const taskDescription = metadata?.description || 'Execute task';
    const taskType = metadata?.taskType || 'general';

    let message = `Task Type: ${taskType}\nDescription: ${taskDescription}\n\n`;

    if (typeof taskData === 'string') {
      message += taskData;
    } else {
      message += JSON.stringify(taskData, null, 2);
    }

    return message;
  }

  private async callGrokAPI(userMessage: string): Promise<GrokChatResponse> {
    const payload = {
      model: this.modelId,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      messages: [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    };

    const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Grok API error (${response.status}): ${errorData?.error?.message || 'Unknown error'}`);
    }

    return (await response.json()) as GrokChatResponse;
  }

  private mockExecute(handoff: HandoffContext, userMessage: string): DispatchResult {
    return {
      success: true,
      taskId: handoff.taskId,
      agentUsed: 'grok-architect',
      output: `[Grok Architect Mock Mode] Processed task: ${handoff.metadata?.description || 'No description'}\n\nInput:\n${userMessage}`,
      metadata: {
        mode: 'mock',
        reason: 'XAI_API_KEY not configured',
      },
    };
  }

  private updateStats(response: GrokChatResponse, duration: number, success: boolean) {
    if (success) {
      this.requestStats.successfulRequests++;
      const tokens = response.usage.total_tokens || (response.usage.prompt_tokens + response.usage.completion_tokens);
      this.requestStats.totalTokensUsed += tokens;

      const currentAvg = this.requestStats.averageResponseTime || 0;
      const totalRequests = this.requestStats.successfulRequests;
      this.requestStats.averageResponseTime =
        (currentAvg * (totalRequests - 1) + duration) / totalRequests;
    } else {
      this.requestStats.failedRequests++;
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are the Grok Architect, an AI agent integrated into the AILCC Mode 6 multi-agent orchestration system (AI Mastermind Alliance).

Your role:
- Execute tasks assigned by the Intent Router
- Provide clear, structured responses
- Handle code analysis, generation, and review with high accuracy
- Specialize in architecture design, documentation, and multi-step planning
- Escalate complex tasks to secondary agents when needed
- Format responses for downstream processing

Guidelines:
- Be concise but complete
- Use code fences for code snippets
- Provide reasoning for analysis tasks
- Flag security concerns or edge cases
- Include estimates for complex tasks`;
  }
}

// Legacy export alias for backward compatibility
export const ClaudeAdapter = GrokArchitectAdapter;
export default GrokArchitectAdapter;
