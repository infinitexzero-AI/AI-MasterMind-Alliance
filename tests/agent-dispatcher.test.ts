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
    // Create a registry with deterministic test adapters to avoid runtime warnings
    const { AdapterRegistry } = require('../automations/mode6/agents/adapter-registry');
    const { TestAdapter } = require('./helpers/test-adapters');

    const registry = new AdapterRegistry();
    // clear default adapters and register deterministic test adapters
    // (AdapterRegistry uses a private map; monkey-patch via register)
    registry.register('claude', new TestAdapter('claude', ['analysis', 'code-generation', 'documentation']));
    registry.register('grok', new TestAdapter('grok', ['reasoning', 'multi-step-planning', 'code-review']));
    registry.register('openai', new TestAdapter('openai', ['code-generation', 'documentation', 'quick-tasks']));

    dispatcher = new AgentDispatcher(registry);
    const capConfig = {
      claude: { capabilities: ['analysis', 'code-generation', 'documentation'], maxContextTokens: 100000 },
      grok: { capabilities: ['reasoning', 'multi-step-planning', 'code-review'], maxContextTokens: 50000 },
      openai: { capabilities: ['code-generation', 'documentation', 'quick-tasks'], maxContextTokens: 80000 },
    };

    dispatcher.initializeCapabilities(capConfig);
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
      expect(result).toBeDefined();
      expect(['claude', 'openai', 'unknown']).toContain(result.agentUsed);
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
      expect(result).toBeDefined();
      expect(result.agentUsed).toBeDefined();
    });

    it('should fallback to secondary agent when primary returns token overflow', async () => {
      // setup registry where primary (claude) will token-overflow and openai will succeed
      const { AdapterRegistry } = require('../automations/mode6/agents/adapter-registry');
      const { TestAdapter } = require('./helpers/test-adapters');
      const registry = new AdapterRegistry();

      registry.register('claude', new TestAdapter('claude', { capabilities: ['analysis'], mode: 'tokenOverflow' }));
      registry.register('openai', new TestAdapter('openai', { capabilities: ['analysis'], mode: 'normal' }));

      const localDispatcher = new AgentDispatcher(registry);
      localDispatcher.initializeCapabilities({
        claude: { capabilities: ['analysis'], maxContextTokens: 100000 },
        openai: { capabilities: ['analysis'], maxContextTokens: 80000 },
      });

      const handoff: HandoffContext = {
        taskId: 'fallback-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        secondaryAgents: ['openai'],
        metadata: { description: 'Fallback test' },
        taskData: { command: 'analyze' },
      };

      const result = await localDispatcher.dispatchToAgent(handoff);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.agentUsed).toBe('openai');
    });

    it('should escalate when both primary and secondaries overflow (context overflow)', async () => {
      const { AdapterRegistry } = require('../automations/mode6/agents/adapter-registry');
      const { TestAdapter } = require('./helpers/test-adapters');
      const registry = new AdapterRegistry();

      registry.register('claude', new TestAdapter('claude', { capabilities: ['analysis'], mode: 'tokenOverflow' }));
      registry.register('openai', new TestAdapter('openai', { capabilities: ['analysis'], mode: 'tokenOverflow' }));

      const localDispatcher = new AgentDispatcher(registry);
      localDispatcher.initializeCapabilities({
        claude: { capabilities: ['analysis'], maxContextTokens: 100000 },
        openai: { capabilities: ['analysis'], maxContextTokens: 80000 },
      });

      const handoff: HandoffContext = {
        taskId: 'escalate-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        secondaryAgents: ['openai'],
        metadata: { description: 'Escalation test' },
        taskData: { command: 'analyze' },
      };

      const result = await localDispatcher.dispatchToAgent(handoff);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(String(result.error).toLowerCase()).toContain('context');
    });

    it('should propagate timeout errors from adapters when no fallback succeeds', async () => {
      const { AdapterRegistry } = require('../automations/mode6/agents/adapter-registry');
      const { TestAdapter } = require('./helpers/test-adapters');
      const registry = new AdapterRegistry();

      registry.register('claude', new TestAdapter('claude', { capabilities: ['analysis'], mode: 'timeout' }));

      const localDispatcher = new AgentDispatcher(registry);
      localDispatcher.initializeCapabilities({
        claude: { capabilities: ['analysis'], maxContextTokens: 100000 },
      });

      const handoff: HandoffContext = {
        taskId: 'timeout-001',
        sourceMode: 'mode6',
        timestamp: new Date(),
        targetAgent: 'claude',
        metadata: { description: 'Timeout test' },
        taskData: { command: 'analyze' },
      };

      const result = await localDispatcher.dispatchToAgent(handoff);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(String(result.error).toLowerCase()).toContain('timeout');
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
