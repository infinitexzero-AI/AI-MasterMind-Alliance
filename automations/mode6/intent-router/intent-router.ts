/**
 * Intent Router
 * Analyzes TaskIntent and produces routing decisions for agent dispatch
 */

import {
  TaskIntent,
  HandoffContext,
  AgentType,
} from './types';

export class IntentRouter {
  private routingStats = {
    totalRoutingDecisions: 0,
    routesByAgent: {} as Record<string, number>,
  };

  constructor() { }

  /**
   * Main routing entry point
   */
  async routeIntent(intent: TaskIntent): Promise<HandoffContext> {
    const taskType = this.classifyTaskType(intent);
    const complexity = this.estimateComplexity(intent);
    const contextSize = this.estimateContextSize(intent);

    const primaryAgent = this.selectPrimaryAgent(taskType, complexity);
    const secondaryAgents = this.identifySecondaryAgents(taskType, complexity);
    const escalationPath = this.getEscalationPath(complexity);

    const handoff = this.prepareHandoff(intent, primaryAgent, secondaryAgents, escalationPath);

    this.logRoutingDecision({
      taskId: intent.id,
      primaryAgent,
      secondaryAgents,
      complexity,
      contextSize,
    });

    return handoff;
  }

  /**
   * Analyze the task intent (internal helper)
   * @internal Not currently used; kept for future analysis expansion
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private analyzeIntent(intent: TaskIntent): Record<string, unknown> {
    return {
      id: intent.id,
      description: intent.description,
      priority: intent.priority,
      mode: intent.mode,
      hasSubtasks: (intent.subtasks || []).length > 0,
    };
  }

  /**
   * Classify task type from description
   */
  private classifyTaskType(intent: TaskIntent): string {
    const description = intent.description.toLowerCase();

    if (description.includes('code') || description.includes('implement') || description.includes('refactor')) {
      return 'code-generation';
    }
    if (description.includes('analyze') || description.includes('review') || description.includes('audit')) {
      return 'analysis';
    }
    if (description.includes('document') || description.includes('write')) {
      return 'documentation';
    }
    if (description.includes('research') || description.includes('find') || description.includes('look')) {
      return 'research';
    }
    if (description.includes('reason') || description.includes('think') || description.includes('plan')) {
      return 'reasoning';
    }

    return 'general';
  }

  /**
   * Estimate task complexity
   */
  private estimateComplexity(intent: TaskIntent): number {
    let score = 0.3; // Base score

    // Priority increases complexity
    if (intent.priority === 'critical') score += 0.3;
    if (intent.priority === 'high') score += 0.2;

    // Subtasks increase complexity
    score += (intent.subtasks || []).length * 0.1;

    // Description length indicates complexity
    score += Math.min(intent.description.length / 500, 0.3);

    return Math.min(score, 1.0);
  }

  /**
   * Estimate context size requirement
   */
  private estimateContextSize(intent: TaskIntent): string {
    const totalLength = (intent.description.length + (intent.subtasks || []).join('').length);

    if (totalLength < 500) return 'small';
    if (totalLength < 2000) return 'medium';
    return 'large';
  }

  /**
   * Select primary agent based on task type and complexity
   */
  private selectPrimaryAgent(taskType: string, complexity: number): AgentType {
    // Complex tasks → Claude (best reasoning)
    if (complexity > 0.7) {
      return 'claude';
    }

    // Task-specific routing
    switch (taskType) {
      case 'code-generation':
        return 'claude';
      case 'analysis':
        return 'claude';
      case 'reasoning':
        return 'grok';
      case 'research':
        return 'openai';
      case 'documentation':
        return 'claude';
      default:
        return 'claude';
    }
  }

  /**
   * Identify secondary agents for verification or parallel execution
   */
  private identifySecondaryAgents(taskType: string, complexity: number): AgentType[] {
    const secondaries: AgentType[] = [];

    if (complexity > 0.6) {
      // High complexity tasks get secondary verification
      secondaries.push('grok');
      if (taskType === 'code-generation' || taskType === 'analysis') {
        secondaries.push('openai');
      }
    }

    if (taskType === 'code-generation') {
      secondaries.push('openai');
    }

    return secondaries.slice(0, 2); // Max 2 secondary agents
  }

  /**
   * Get escalation path for task failure scenarios
   */
  private getEscalationPath(complexity: number): string {
    if (complexity > 0.8) {
      return 'human-review';
    }
    if (complexity > 0.6) {
      return 'multi-agent-consensus';
    }
    return 'retry-with-backup';
  }

  /**
   * Prepare handoff context for agent dispatcher
   */
  private prepareHandoff(
    intent: TaskIntent,
    primaryAgent: AgentType,
    secondaryAgents: AgentType[],
    escalationPath: string
  ): HandoffContext {
    return {
      taskId: intent.id,
      sourceMode: 'mode6',
      targetAgent: primaryAgent,
      secondaryAgents,
      timestamp: new Date(),
      metadata: {
        description: intent.description,
        taskType: this.classifyTaskType(intent),
        priority: intent.priority,
        contextSize: this.estimateContextSize(intent),
      },
      taskData: {
        description: intent.description,
        subtasks: intent.subtasks || [],
        priority: intent.priority,
      },
      escalationPath,
    };
  }

  /**
   * Log routing decision for monitoring
   */
  private logRoutingDecision(decision: { primaryAgent: string } & Record<string, unknown>) {
    this.routingStats.totalRoutingDecisions++;
    const agent = decision.primaryAgent;
    if (!this.routingStats.routesByAgent[agent]) {
      this.routingStats.routesByAgent[agent] = 0;
    }
    this.routingStats.routesByAgent[agent]++;
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(): Record<string, unknown> {
    return this.routingStats;
  }
}

export default IntentRouter;
