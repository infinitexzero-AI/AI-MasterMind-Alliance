/**
 * Grok API Adapter
 * Integrates xAI's Grok API with Mode 6 Agent Dispatcher
 * Optimized for multi-step reasoning and experimental reasoning patterns
 */

import { HandoffContext, DispatchResult } from '../index';

interface GrokResponse {
  id: string;
  created: number;
  model: string;
  result: {
    output: string;
    reasoning_tokens?: number;
    completion_tokens?: number;
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens?: number;
  };
}

export interface GrokAdapterConfig {
  apiKey?: string;
  modelId?: string;
  maxTokens?: number;
  enableReasoning?: boolean;
}

export class GrokAdapter {
  private apiKey: string;
  private modelId: string;
  private maxTokens: number;
  private enableReasoning: boolean;
  private apiBaseUrl: string = 'https://api.x.ai/v1';
  private requestStats = {
    successfulRequests: 0,
    failedRequests: 0,
    totalTokensUsed: 0,
  };

  constructor(config: GrokAdapterConfig = {}) {
    this.apiKey = config.apiKey || process.env.XAI_API_KEY || '';
    this.modelId = config.modelId || 'grok-2';
    this.maxTokens = config.maxTokens || 4000;
    this.enableReasoning = config.enableReasoning ?? true;

    if (!this.apiKey) {
      console.warn('[Grok Adapter] XAI_API_KEY not set; adapter will operate in mock mode.');
    }
  }

  async executeTask(handoff: HandoffContext): Promise<DispatchResult> {
    const startTime = Date.now();

    try {
      const userMessage = this.formatUserMessage(handoff);

      if (!this.apiKey) {
        return this.mockExecute(handoff, userMessage);
      }

      const response = await this.callGrokAPI(userMessage);
      const duration = Date.now() - startTime;

      this.requestStats.successfulRequests++;
      this.requestStats.totalTokensUsed += response.usage.completion_tokens;

      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: 'grok',
        output: response.result.output,
        metadata: {
          model: response.model,
          tokens: response.usage.completion_tokens,
          reasoningTokens: response.usage.reasoning_tokens || 0,
          duration,
        },
      };
    } catch (error) {
      this.requestStats.failedRequests++;
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'grok',
        error: `Grok error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async validateCapability(capability: string): Promise<boolean> {
    const capabilities = [
      'reasoning',
      'multi-step-planning',
      'code-review',
      'analysis',
      'research',
    ];
    return capabilities.includes(capability.toLowerCase());
  }

  getStats() {
    return {
      ...this.requestStats,
      model: this.modelId,
      reasoningEnabled: this.enableReasoning,
      isConfigured: !!this.apiKey,
    };
  }

  private formatUserMessage(handoff: HandoffContext): string {
    const { taskData, metadata } = handoff;
    const taskDescription = metadata?.description || 'Execute task';

    let message = taskDescription;
    if (metadata?.taskType === 'reasoning' || this.enableReasoning) {
      message = `[Reasoning Task]\n${message}`;
    }

    message += '\n\n';
    if (typeof taskData === 'string') {
      message += taskData;
    } else {
      message += JSON.stringify(taskData, null, 2);
    }

    return message;
  }

  private async callGrokAPI(userMessage: string): Promise<GrokResponse> {
    const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: this.maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Grok error: ${error.error?.message || 'Unknown error'}`);
    }

    return (await response.json()) as GrokResponse;
  }

  private mockExecute(handoff: HandoffContext, userMessage: string): DispatchResult {
    const taskType = handoff.metadata?.taskType || 'general';
    return {
      success: true,
      taskId: handoff.taskId,
      agentUsed: 'grok',
      output: `[Grok Mock Mode - ${taskType}] Reasoning completed for: ${handoff.metadata?.description || 'unknown'}`,
      metadata: { mode: 'mock', reasoningEnabled: this.enableReasoning },
    };
  }
}

export default GrokAdapter;
