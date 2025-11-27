/**
 * Agent Dispatcher Unit Tests
 * Tests handoff protocol, agent execution routing, and error handling.
 */

import { AgentDispatcher } from '../automations/mode6/agent-routing/agent-dispatcher';
import { MockAgent } from './helpers/mock-agent';
import { HandoffContext } from '../automations/mode6/index';

describe('AgentDispatcher', () => {
  let dispatcher: AgentDispatcher;

  beforeEach(() => {
    dispatcher = new AgentDispatcher();
    dispatcher.initializeCapabilities({
      claude: { capabilities: ['analysis', 'code-generation', 'documentation'], maxContextTokens: 100000 },
      grok: { capabilities: ['reasoning', 'multi-step-planning', 'code-review'], maxContextTokens: 50000 },
      openai: { capabilities: ['code-generation', 'documentation', 'quick-tasks'], maxContextTokens: 80000 },
    });
  });

  describe('dispatchToAgent', () => {
    it('should dispatch task to available primary agent', async () => {
      const handoff: HandoffContext = {
        taskId: 'dispatch-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        metadata: {
          description: 'Test dispatch',
          taskType: 'analysis',
        },
        taskData: { command: 'analyze', target: 'codebase' },
      };

      const result = await dispatcher.dispatchToAgent(handoff);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.agentUsed).toBe('claude');
    });

    it('should handle agent unavailability and fallback', async () => {
      const handoff: HandoffContext = {
        taskId: 'dispatch-002',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'unavailable-agent',
        secondaryAgents: ['claude', 'openai'],
        metadata: {
          description: 'Test fallback',
          taskType: 'code-generation',
        },
        taskData: { command: 'generate', target: 'module' },
      };

      const result = await dispatcher.dispatchToAgent(handoff);
      expect(result.success).toBe(true);
      expect(['claude', 'openai']).toContain(result.agentUsed);
    });

    it('should reject dispatch if context exceeds agent max tokens', async () => {
      const largeContext = 'x'.repeat(150000); // Exceeds most agent limits
      const handoff: HandoffContext = {
        taskId: 'dispatch-003',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'openai', // 80k token limit
        metadata: {
          description: 'Context overflow test',
          taskType: 'analysis',
          contextSize: 'large',
        },
        taskData: { command: 'analyze', content: largeContext },
      };

      const result = await dispatcher.dispatchToAgent(handoff);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('context');
    });
  });

  describe('dispatchToSecondaryAgents', () => {
    it('should dispatch to multiple secondary agents in parallel', async () => {
      const handoff: HandoffContext = {
        taskId: 'multi-dispatch-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        secondaryAgents: ['grok', 'openai'],
        metadata: {
          description: 'Multi-agent dispatch test',
          taskType: 'code-review',
        },
        taskData: { command: 'review', code: 'function test() {}' },
      };

      const results = await dispatcher.dispatchToSecondaryAgents(handoff);
      expect(results.length).toBe(2);
      expect(results.every((r: any) => r.success || r.error)).toBe(true);
    });
  });

  describe('verifyOutput', () => {
    it('should validate dispatcher output format', async () => {
      const handoff: HandoffContext = {
        taskId: 'verify-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        metadata: { description: 'Verify output', taskType: 'analysis' },
        taskData: { command: 'test' },
      };

      const result = await dispatcher.dispatchToAgent(handoff);
      const verified = dispatcher.verifyOutput(result);
      expect(verified).toBe(true);
    });
  });

  describe('getDispatcherStats', () => {
    it('should return dispatcher statistics', async () => {
      const handoff: HandoffContext = {
        taskId: 'stats-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        metadata: { description: 'Stats test', taskType: 'analysis' },
        taskData: { command: 'test' },
      };

      await dispatcher.dispatchToAgent(handoff);
      const stats = dispatcher.getDispatcherStats();

      expect(stats).toBeDefined();
      expect(stats.totalDispatches).toBeGreaterThan(0);
      expect(stats.successfulDispatches).toBeGreaterThan(0);
    });
  });
});
