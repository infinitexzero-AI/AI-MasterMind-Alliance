/**
 * Mode 6 Entry Point
 * Exports core orchestration components and agent adapters
 * 
 * Usage:
 * import { Mode6Orchestrator, ClaudeAdapter, AdapterRegistry } from './automations/mode6';
 * const orchestrator = new Mode6Orchestrator();
 */

import { IntentRouter } from './intent-router/intent-router';
import { AgentDispatcher } from './agent-routing/agent-dispatcher';
import { MemoryManager } from './memory/memory-manager';

export { IntentRouter } from './intent-router/intent-router';
export type {
  TaskIntent,
  RoutingDecision,
  HandoffContext,
  ExecutionResult,
  MemoryEntry,
  AgentCapabilities,
  DispatchResult,
} from './intent-router/types';

export { AgentDispatcher } from './agent-routing/agent-dispatcher';
export { MemoryManager } from './memory/memory-manager';

// Agent Adapters
export { default as ClaudeAdapter, type ClaudeAdapterConfig } from './agents/claude-adapter';
export { default as OpenAIAdapter, type OpenAIAdapterConfig } from './agents/openai-adapter';
export { default as GrokAdapter, type GrokAdapterConfig } from './agents/grok-adapter';
export { AdapterRegistry, type AgentAdapter } from './agents/adapter-registry';

/**
 * Mode6Orchestrator
 * Main orchestration class that coordinates all components
 */
export class Mode6Orchestrator {
  private dispatcher: AgentDispatcher;
  private memory: MemoryManager;
  private router: IntentRouter;

  constructor() {
    this.dispatcher = new AgentDispatcher();
    this.memory = new MemoryManager();
    this.router = new IntentRouter();
  }

  /**
   * Main entry point for task orchestration
   */
  async processTask(intent: any): Promise<any> {
    // 1. Route intent to appropriate agent(s)
    const handoff = await this.router.routeIntent(intent);

    // 2. Dispatch to primary agent
    const result = await this.dispatcher.dispatchToAgent(handoff);

    // 3. Store result in memory
    await this.memory.storeExecutionResult({
      taskId: handoff.taskId,
      agentUsed: result.agentUsed,
      success: result.success,
      output: result.output,
      duration: result.metadata?.duration || 0,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Get system statistics for monitoring
   */
  getSystemStats(): Record<string, any> {
    return {
      routing: this.router.getRoutingStats(),
      dispatcher: this.dispatcher.getDispatcherStats(),
      memory: this.memory.getMemoryStats(),
    };
  }

  /**
   * Get execution result by task ID
   */
  getResult(taskId: string): any {
    return this.dispatcher.getExecutionResult(taskId);
  }

  /**
   * Trigger memory cleanup
   */
  async cleanup(): Promise<Record<string, any>> {
    return this.memory.applyRetentionPolicy();
  }
}
