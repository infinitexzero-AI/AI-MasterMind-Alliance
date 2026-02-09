/**
 * Claude API Adapter
 * Integrates Anthropic's Claude API with Mode 6 Agent Dispatcher
 * Handles authentication, message formatting, streaming, and token management.
 */

import { configLoader } from '../config/env';
import { HandoffContext, DispatchResult } from '../intent-router/types';

interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeAdapterConfig {
  apiKey?: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export class ClaudeAdapter {
  private apiKey: string;
  private modelId: string;
  private maxTokens: number;
  private temperature: number;
  private systemPrompt: string;
  private apiBaseUrl: string = 'https://api.anthropic.com/v1';
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

  constructor(config: ClaudeAdapterConfig = {}) {
    const configSettings = configLoader.getConfig();
    this.apiKey = config.apiKey || configSettings.anthropic.apiKey;
    this.modelId = config.modelId || configSettings.anthropic.model;
    this.maxTokens = config.maxTokens || configSettings.anthropic.maxTokens;
    this.temperature = config.temperature || configSettings.anthropic.temperature;
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();

    if (!this.apiKey) {
      console.warn('[Claude Adapter] ANTHROPIC_API_KEY not set; adapter will operate in mock mode.');
    }
  }

  /**
   * Execute a task via Claude API
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

      // Call Claude API
      const response = await this.callClaudeAPI(userMessage);

      const duration = Date.now() - startTime;
      this.updateStats(response, duration, true);

      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: 'claude',
        output: response.content[0].text,
        metadata: {
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          stopReason: response.stop_reason,
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
        agentUsed: 'claude',
        error: `Claude API error: ${errorMessage}`,
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
      console.warn(`[ClaudeAdapter] Failed to fetch memory key '${key}':`, error);
      return null;
    }
  }

  /**
   * Stream responses from Claude (for real-time feedback)
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
        const mockResponse = `[Claude Mock] Processed: ${handoff.taskData.command || 'unknown'}`;
        onChunk(mockResponse);
        return {
          success: true,
          taskId: handoff.taskId,
          agentUsed: 'claude',
          output: mockResponse,
          metadata: { streamed: true },
        };
      }

      // Note: Actual streaming requires SSE support; placeholder for now
      const response = await this.callClaudeAPI(userMessage);
      onChunk(response.content[0].text);

      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: 'claude',
        output: response.content[0].text,
        metadata: { streamed: true },
      };
    } catch (error) {
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'claude',
        error: `Stream error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate if Claude can handle a task
   */
  async validateCapability(capability: string): Promise<boolean> {
    const claudeCapabilities = [
      'analysis',
      'code-generation',
      'code-review',
      'documentation',
      'reasoning',
      'multi-step-planning',
      'security-review',
      'refactoring',
    ];
    return claudeCapabilities.includes(capability.toLowerCase());
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

  private async callClaudeAPI(userMessage: string): Promise<ClaudeResponse> {
    const payload = {
      model: this.modelId,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    };

    const response = await fetch(`${this.apiBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Claude API error (${response.status}): ${errorData?.error?.message || 'Unknown error'}`);
    }

    return (await response.json()) as ClaudeResponse;
  }

  private mockExecute(handoff: HandoffContext, userMessage: string): DispatchResult {
    return {
      success: true,
      taskId: handoff.taskId,
      agentUsed: 'claude',
      output: `[Claude Mock Mode] Processed task: ${handoff.metadata?.description || 'No description'}\n\nInput:\n${userMessage}`,
      metadata: {
        mode: 'mock',
        reason: 'ANTHROPIC_API_KEY not configured',
      },
    };
  }

  private updateStats(response: ClaudeResponse, duration: number, success: boolean) {
    if (success) {
      this.requestStats.successfulRequests++;
      const tokens = response.usage.input_tokens + response.usage.output_tokens;
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
    return `You are Claude, an AI assistant integrated into the AILCC Mode 6 multi-agent orchestration system.

Your role:
- Execute tasks assigned by the Intent Router
- Provide clear, structured responses
- Handle code analysis, generation, and review with high accuracy
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

export default ClaudeAdapter;
