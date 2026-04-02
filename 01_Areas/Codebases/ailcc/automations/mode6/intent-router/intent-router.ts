/**
 * Intent Router
 * Analyzes TaskIntent and produces routing decisions for agent dispatch
 */

import {
  TaskIntent,
  HandoffContext,
  AgentType,
} from './types';
import { RoutingOptimizer } from '../agent-routing/routing-optimizer';

export class IntentRouter {
  private routingStats = {
    totalRoutingDecisions: 0,
    routesByAgent: {} as Record<string, number>,
  };
  private optimizer: RoutingOptimizer;

  constructor() {
    this.optimizer = new RoutingOptimizer();
  }

  /**
   * Main routing entry point
   */
  async routeIntent(intent: TaskIntent): Promise<HandoffContext> {
    // 1. Try LLM Classification
    try {
      const classification = await this.classifyWithLLM(intent);

      // Map LLM output to HandoffContext
      const handoff: HandoffContext = {
        taskId: intent.id,
        sourceMode: intent.mode,
        targetAgent: classification.primaryAgent,
        secondaryAgents: classification.secondaryAgents,
        timestamp: new Date(),
        metadata: {
          description: intent.description,
          taskType: classification.taskType,
          priority: intent.priority,
          contextSize: this.estimateContextSize(intent),
          reasoning: classification.reasoning
        },
        taskData: {
          description: intent.description,
          subtasks: intent.subtasks || [],
          priority: intent.priority
        },
        escalationPath: this.getEscalationPath(classification.complexity)
      };

      this.logRoutingDecision({
        primaryAgent: classification.primaryAgent
      });

      return handoff;

    } catch (error) {
      console.warn('LLM Routing failed, falling back to heuristic:', error);

      // Fallback to original heuristic + Optimizer
      const taskType = this.classifyTaskType(intent);
      const complexity = this.estimateComplexity(intent);
      this.estimateContextSize(intent);

      // Select primary agent using the RoutingOptimizer (ML-scaffolding)
      const primaryAgent = this.optimizer.predictBestAgent(taskType, {});

      const secondaryAgents = this.identifySecondaryAgents(taskType, complexity);
      const escalationPath = this.getEscalationPath(complexity);

      return this.prepareHandoff(intent, primaryAgent, secondaryAgents, escalationPath);
    }
  }

  private async classifyWithLLM(intent: TaskIntent): Promise<{
    taskType: string;
    complexity: number;
    primaryAgent: AgentType;
    secondaryAgents: AgentType[];
    reasoning: string;
  }> {
    // Dynamic import to avoid potential circular dependencies if they arise in future refactors
    const { OpenAIAdapter } = await import('../agents/openai-adapter');
    const adapter = new OpenAIAdapter();

    const prompt = `
      Analyze this task and return a JSON object (NO markdown, just raw JSON).
      Task: "${intent.description}"
      
      Output Schema:
      {
        "taskType": "code-generation" | "analysis" | "reasoning" | "research" | "documentation",
        "complexity": number (0.0 to 1.0),
        "primaryAgent": "claude" | "openai" | "grok",
        "secondaryAgents": ["agent"],
        "reasoning": "short explanation"
      }
      `;

    const result = await adapter.executeTask({
      taskId: 'routing-' + (intent.id || intent.linearId || 'unknown'),
      sourceMode: intent.mode || 'mode-6',
      timestamp: new Date(),
      taskData: prompt,
      metadata: { description: 'Classify Intent' }
    });

    if (!result.success || !result.output) throw new Error('Adapter failed');

    // Clean up markdown if present
    const cleanJson = result.output.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
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
  private logRoutingDecision(decision: { primaryAgent: string }) {
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
