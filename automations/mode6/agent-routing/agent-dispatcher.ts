/**
 * Mode 6 Agent Dispatcher
 * 
 * Implements multi-agent handoff protocol from multi-agent-sop.md
 * Manages agent availability, capability matching, and result verification
 * Integrates with real agent API adapters (Claude, OpenAI, Grok)
 */

import {
  AgentType,
  AgentCapabilities,
  HandoffContext,
  ExecutionResult,
  RoutingDecision,
  DispatchResult,
} from '../intent-router/types';
import AdapterRegistry from '../agents/adapter-registry';

export class AgentDispatcher {
  private agentCapabilities: Map<AgentType, AgentCapabilities>;
  private executionQueue: Array<{ decision: RoutingDecision; handoff: HandoffContext }> = [];
  private executionResults: Map<string, ExecutionResult> = new Map();
  private dispatchStats = {
    totalDispatches: 0,
    successfulDispatches: 0,
    failedDispatches: 0,
  };
  private adapterRegistry: AdapterRegistry;

  constructor(adapterRegistry?: AdapterRegistry) {
    this.agentCapabilities = this.initializeCapabilities();
    this.adapterRegistry = adapterRegistry || new AdapterRegistry();
  }

  /**
   * Initialize agent capability matrix
   * Maps agent strengths to task types
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initializeCapabilities(config?: Record<string, any>): Map<AgentType, AgentCapabilities> {
    if (config) {
      const map = new Map<AgentType, AgentCapabilities>();
      for (const [name, c] of Object.entries(config)) {
        map.set(name as AgentType, {
          agent: name as AgentType,
          primarySkills: (c.capabilities as string[]) || [],
          secondarySkills: [],
          contextLimit: (c.maxContextTokens as number) || 100000,
          latencyProfile: 'standard',
          availableNow: true,
        });
      }
      return map;
    }

    return new Map([
      [
        'supergrok',
        {
          agent: 'supergrok',
          primarySkills: ['orchestration', 'coordination', 'complex-logic', 'multi-agent-management'],
          secondarySkills: ['code-generation', 'analysis', 'research'],
          contextLimit: 200000,
          latencyProfile: 'standard',
          availableNow: true,
        },
      ],
      [
        'grok-architect',
        {
          agent: 'grok-architect' as AgentType,
          primarySkills: ['code-generation', 'analysis', 'documentation', 'reasoning'],
          secondarySkills: ['research', 'orchestration-support'],
          contextLimit: 131072,
          latencyProfile: 'standard',
          availableNow: true,
        },
      ],
      [
        'comet',
        {
          agent: 'comet',
          primarySkills: ['research', 'verification', 'web-browsing', 'fact-checking'],
          secondarySkills: ['analysis', 'summarization'],
          contextLimit: 100000,
          latencyProfile: 'high',
          availableNow: true,
        },
      ],
      [
        'chatgpt',
        {
          agent: 'chatgpt',
          primarySkills: ['github-integration', 'git-operations', 'automated-commits'],
          secondarySkills: ['code-review', 'documentation'],
          contextLimit: 128000,
          latencyProfile: 'standard',
          availableNow: true,
        },
      ],
    ]);
  }

  /**
   * Initialize adapter capabilities with config
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configureAdapters(config?: Record<string, any>) {
    if (config) {
      for (const [agentName, agentConfig] of Object.entries(config)) {
        // Update capabilities from config if provided
        console.log(`Configured adapter: ${agentName}`, agentConfig);
      }
    }
  }

  /**
   * Dispatch task to primary agent following handoff protocol
   * Uses real adapter if available, falls back to mock
   */
  async dispatchToAgent(handoff: HandoffContext): Promise<DispatchResult> {
    this.dispatchStats.totalDispatches++;

    try {
      const agentName = handoff.targetAgent || 'grok';
      const adapter = this.adapterRegistry.getAdapter(agentName);

      // If adapter missing, treat as unavailable and attempt fallbacks
      if (!adapter) {
        // try fallbacks defined in handoff.secondaryAgents
        const secondaries = handoff.secondaryAgents || [];
        for (const sec of secondaries) {
          const secAdapter = this.adapterRegistry.getAdapter(sec);
          if (!secAdapter) continue;
          const secResult = await secAdapter.executeTask(handoff);
          if (secResult.success) {
            this.dispatchStats.successfulDispatches++;
            return secResult;
          }
        }

        this.dispatchStats.failedDispatches++;
        throw new Error(`Adapter not found for agent: ${agentName}`);
      }

      // Use adapter for execution
      let result: DispatchResult;
      try {
        result = await adapter.executeTask(handoff);
      } catch (err) {
        // Adapter threw (timeout etc.) — attempt secondaries if provided
        const secondaries = handoff.secondaryAgents || [];
        for (const sec of secondaries) {
          const secAdapter = this.adapterRegistry.getAdapter(sec);
          if (!secAdapter) continue;
          const secResult = await secAdapter.executeTask(handoff);
          if (secResult.success) {
            this.dispatchStats.successfulDispatches++;
            return secResult;
          }
        }

        this.dispatchStats.failedDispatches++;
        return {
          success: false,
          taskId: handoff.taskId,
          agentUsed: agentName,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // If primary succeeded, count it and return
      if (result.success) {
        this.dispatchStats.successfulDispatches++;
        return result;
      }

      // If primary failed, attempt secondary agents
      if (!result.success) {
        const secondaries = handoff.secondaryAgents || [];
        for (const sec of secondaries) {
          const secAdapter = this.adapterRegistry.getAdapter(sec);
          if (!secAdapter) continue;
          const secResult = await secAdapter.executeTask(handoff);
          if (secResult.success) {
            this.dispatchStats.successfulDispatches++;
            return secResult;
          }
        }

        // If token/context overflow, escalate
        if (result.error && String(result.error).toLowerCase().includes('context')) {
          this.dispatchStats.failedDispatches++;
          return {
            success: false,
            taskId: handoff.taskId,
            agentUsed: agentName,
            error: `context-overflow`,
          };
        }

        this.dispatchStats.failedDispatches++;
      }

      return result;
    } catch (error) {
      this.dispatchStats.failedDispatches++;
      return {
        success: false,
        taskId: handoff.taskId,
        agentUsed: 'unknown',
        error: `Dispatch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Dispatch to secondary agent (multi-agent coordination)
   */
  async dispatchToSecondaryAgents(handoff: HandoffContext): Promise<DispatchResult[]> {
    const results: DispatchResult[] = [];
    const secondaryAgents = handoff.secondaryAgents || [];

    for (const agentName of secondaryAgents) {
      try {
        const adapter = this.adapterRegistry.getAdapter(agentName);
        if (!adapter) continue;

        const result = await adapter.executeTask(handoff);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          taskId: handoff.taskId,
          agentUsed: agentName,
          error: `Secondary dispatch failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return results;
  }

  /**
   * Execute task (legacy method for compatibility)
   */
  private async executeTask(_decision: RoutingDecision, _handoff: HandoffContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    const processingTime = this.estimateProcessingTime('grok' as AgentType, _handoff);
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    const executionTime = Date.now() - startTime;

    return {
      taskId: _decision.intentId,
      agent: _decision.primaryAgent,
      status: 'completed',
      output: {
        summary: `Completed by ${_decision.primaryAgent}`,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        executionTime,
        tokensUsed: Math.floor(Math.random() * 5000) + 1000,
        errors: [],
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Estimate processing time based on agent and task complexity
   */
  private estimateProcessingTime(agent: AgentType, _handoff: HandoffContext): number {
    const baseTime = 500;
    const agentLatencyMap = { instant: 0, standard: 200, high: 500 };
    const capabilities = this.agentCapabilities.get(agent)!;
    return baseTime + agentLatencyMap[capabilities.latencyProfile];
  }

  /**
   * Handle agent unavailability
   */
  private async _handleUnavailableAgent(
    _decision: RoutingDecision,
    _handoff: HandoffContext
  ): Promise<ExecutionResult> {
    console.warn(`Agent ${_decision.primaryAgent} unavailable, routing to backup`);
    const backupAgent = this.getBackupAgent(_decision.primaryAgent);
    const backupDecision = { ..._decision, primaryAgent: backupAgent };
    return this.executeTask(backupDecision, _handoff);
  }

  /**
   * Handle context overflow
   */
  private async _handleContextOverflow(
    _decision: RoutingDecision,
    _handoff: HandoffContext
  ): Promise<ExecutionResult> {
    console.warn(`Context overflow for ${_decision.primaryAgent}, escalating`);

    return {
      taskId: _decision.intentId,
      agent: _decision.primaryAgent,
      status: 'escalated',
      output: {
        reason: 'context-overflow',
        escalationPath: _decision.escalationPath,
        recommendation: 'Split task and re-delegate with summarized context',
      },
      metadata: {
        executionTime: 0,
        errors: ['Context window exceeded'],
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get backup agent based on mode routing table
   */
  private getBackupAgent(primaryAgent: AgentType): AgentType {
    const modeRoutingTable: Record<AgentType, AgentType> = {
      'grok-architect': 'grok',
      supergrok: 'grok',
      comet: 'grok',
      chatgpt: 'grok',
      grok: 'openai',
      openai: 'grok',
      claude: 'grok',
    };
    return modeRoutingTable[primaryAgent] || 'grok';
  }

  /**
   * Verify output matches expected format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyOutput(result: any, expectedOutput?: any): boolean {
    if (!result) return false;
    if (expectedOutput?.format === 'structured-result' && typeof result.output !== 'object') {
      return false;
    }
    return true;
  }

  /**
   * Create sub-handoff for secondary agents
   */
  private _createSubHandoff(parentHandoff: HandoffContext, secondaryAgent: AgentType): HandoffContext {
    return {
      ...parentHandoff,
      sourceMode: 'mode6-secondary',
      targetAgent: secondaryAgent,
    };
  }

  /**
   * Check if agent is currently available
   */
  private _isAgentAvailable(agent: AgentType): boolean {
    const capabilities = this.agentCapabilities.get(agent);
    return capabilities ? capabilities.availableNow : false;
  }

  /**
   * Get execution result by task ID
   */
  getExecutionResult(taskId: string): ExecutionResult | undefined {
    return this.executionResults.get(taskId);
  }

  /**
   * Get dispatcher statistics for dashboard
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDispatcherStats(): Record<string, any> {
    return {
      totalDispatches: this.dispatchStats.totalDispatches,
      successfulDispatches: this.dispatchStats.successfulDispatches,
      failedDispatches: this.dispatchStats.failedDispatches,
      queueLength: this.executionQueue.length,
      adapterStats: this.adapterRegistry.getAllStats(),
      agentCapabilities: Array.from(this.agentCapabilities.entries()).map(([agent, caps]) => ({
        agent,
        skills: caps.primarySkills,
        contextLimit: caps.contextLimit,
        available: caps.availableNow,
      })),
    };
  }
}
