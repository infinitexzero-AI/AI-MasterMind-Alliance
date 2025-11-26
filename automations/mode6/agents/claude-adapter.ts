/**
 * Claude API Adapter
 * Integrates Anthropic's Claude API with Mode 6 Agent Dispatcher
 * Handles authentication, message formatting, streaming, and token management.
 */

import { HandoffContext, DispatchResult } from '../index';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
  private requestStats = {
    successfulRequests: 0,
    failedRequests: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
  };

  constructor(config: ClaudeAdapterConfig = {}) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.modelId = config.modelId || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
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
      const userMessage = this.formatUserMessage(handoff);

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
    } catch (error) {
      const duration = Date.now() - startTime;
      this.requestStats.failedRequests++;

      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'claude',
        error: `Claude API error: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { duration },
      };
    }
  }

  /**
   * Stream responses from Claude (for real-time feedback)
   */
  async streamTask(handoff: HandoffContext, onChunk: (chunk: string) => void): Promise<DispatchResult> {
    try {
      const userMessage = this.formatUserMessage(handoff);

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
      const error = await response.json();
      throw new Error(`Claude API error (${response.status}): ${error.error?.message || 'Unknown error'}`);
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
