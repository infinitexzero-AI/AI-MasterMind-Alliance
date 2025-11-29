import { AgentAdapter } from '../../automations/mode6/agents/adapter-registry';
import { HandoffContext, DispatchResult } from '../../automations/mode6/intent-router/types';
import { createMockAgent } from './mock-agent';

export interface TestAdapterOptions {
  capabilities?: string[];
  mode?: 'normal' | 'tokenOverflow' | 'timeout' | 'rateLimit' | 'unavailable';
  latency?: number; // ms
}

export class TestAdapter implements AgentAdapter {
  private name: string;
  private mock: any;
  private mode: string;
  private latency: number;

  constructor(name: string, options: TestAdapterOptions = {}) {
    this.name = name;
    this.mock = createMockAgent(name, options.capabilities || []);
    this.mode = options.mode || 'normal';
    this.latency = options.latency || 10;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeTask(handoff: HandoffContext): Promise<DispatchResult> {
    // simulate latency
    await this.sleep(this.latency);

    // Simulate different failure modes deterministically
    if (this.mode === 'unavailable') {
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: this.name,
        error: 'unavailable',
      };
    }

    if (this.mode === 'timeout') {
      // Simulate a thrown timeout
      throw new Error('timeout');
    }

    if (this.mode === 'rateLimit') {
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: this.name,
        error: 'rate-limit',
      };
    }

    if (this.mode === 'tokenOverflow') {
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: this.name,
        error: 'context-overflow: token window exceeded',
      };
    }

    // Normal mode: delegate to MockAgent behavior
    const command = JSON.stringify(handoff.taskData || {});
    const res = await this.mock.execute(command);
    if (res.success) {
      return {
        success: true,
        taskId: handoff.taskId,
        agentUsed: this.name,
        output: res.result,
        metadata: {},
      };
    }

    return {
      success: false,
      taskId: handoff.taskId,
      agentUsed: this.name,
      error: res.error,
    };
  }

  async validateCapability(_capability: string): Promise<boolean> {
    return this.mock.validateCapability(_capability);
  }

  getStats(): Record<string, unknown> {
    return this.mock.getStats();
  }
}
