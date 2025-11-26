/**
 * OpenAI API Adapter
 * Integrates OpenAI's GPT models and Assistants API with Mode 6 Agent Dispatcher
 */

import { HandoffContext, DispatchResult } from '../index';

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    text: string;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIAdapterConfig {
  apiKey?: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIAdapter {
  private apiKey: string;
  private modelId: string;
  private maxTokens: number;
  private temperature: number;
  private apiBaseUrl: string = 'https://api.openai.com/v1';
  private requestStats = {
    successfulRequests: 0,
    failedRequests: 0,
    totalTokensUsed: 0,
  };

  constructor(config: OpenAIAdapterConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.modelId = config.modelId || 'gpt-4-turbo';
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature || 0.7;

    if (!this.apiKey) {
      console.warn('[OpenAI Adapter] OPENAI_API_KEY not set; adapter will operate in mock mode.');
    }
  }

  async executeTask(handoff: HandoffContext): Promise<DispatchResult> {
    const startTime = Date.now();

    try {
      const userMessage = this.formatUserMessage(handoff);

      if (!this.apiKey) {
        return this.mockExecute(handoff, userMessage);
      }

      const response = await this.callOpenAIAPI(userMessage);
      const duration = Date.now() - startTime;

      this.requestStats.successfulRequests++;
      this.requestStats.totalTokensUsed += response.usage.total_tokens;

      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: 'openai',
        output: response.choices[0].text.trim(),
        metadata: {
          model: response.model,
          tokens: response.usage.total_tokens,
          duration,
        },
      };
    } catch (error) {
      this.requestStats.failedRequests++;
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'openai',
        error: `OpenAI error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async validateCapability(capability: string): Promise<boolean> {
    const capabilities = [
      'code-generation',
      'documentation',
      'quick-tasks',
      'code-review',
      'summarization',
    ];
    return capabilities.includes(capability.toLowerCase());
  }

  getStats() {
    return {
      ...this.requestStats,
      model: this.modelId,
      isConfigured: !!this.apiKey,
    };
  }

  private formatUserMessage(handoff: HandoffContext): string {
    const { taskData, metadata } = handoff;
    const taskDescription = metadata?.description || 'Execute task';

    let message = `${taskDescription}\n\n`;
    if (typeof taskData === 'string') {
      message += taskData;
    } else {
      message += JSON.stringify(taskData, null, 2);
    }
    return message;
  }

  private async callOpenAIAPI(userMessage: string): Promise<OpenAICompletionResponse> {
    const response = await fetch(`${this.apiBaseUrl}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelId,
        prompt: userMessage,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI error: ${error.error?.message || 'Unknown error'}`);
    }

    return (await response.json()) as OpenAICompletionResponse;
  }

  private mockExecute(handoff: HandoffContext, userMessage: string): DispatchResult {
    return {
      success: true,
      taskId: handoff.taskId,
      agentUsed: 'openai',
      output: `[OpenAI Mock Mode] Quick task completed for: ${handoff.metadata?.description || 'unknown'}`,
      metadata: { mode: 'mock' },
    };
  }
}

export default OpenAIAdapter;
