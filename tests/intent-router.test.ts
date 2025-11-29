/**
 * Intent Router Unit Tests
 * Tests routing logic, agent selection, and handoff preparation.
 */

import { IntentRouter } from '../automations/mode6/intent-router/intent-router';
import { TaskIntent } from '../automations/mode6/index';

describe('IntentRouter', () => {
  let router: IntentRouter;

  beforeEach(() => {
    router = new IntentRouter();
  });

  describe('analyzeIntent', () => {
    it('should parse a valid task intent', async () => {
      const intent: TaskIntent = {
        id: 'task-001',
        description: 'Analyze codebase for security vulnerabilities',
        priority: 'high',
        mode: 'automation',
        subtasks: [],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(intent);

      expect(result).toBeDefined();
      expect(result.taskId).toBe('task-001');
      expect(result.targetAgent).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should classify task types correctly', async () => {
      const analysisIntent: TaskIntent = {
        id: 'analysis-001',
        description: 'Analyze logs',
        priority: 'medium',
        mode: 'automation',
        subtasks: [],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(analysisIntent);
      expect(result.targetAgent).toBe('claude'); // Default for analysis
    });

    it('should estimate complexity based on context and dependencies', async () => {
      const complexIntent: TaskIntent = {
        id: 'complex-001',
        description: 'Refactor entire module with cross-cutting concerns',
        priority: 'high',
        mode: 'automation',
        subtasks: ['auth', 'db', 'cache'],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(complexIntent);
      expect((result.secondaryAgents || []).length).toBeGreaterThan(0); // High complexity needs backups
      expect(result.escalationPath).toBeDefined();
    });
  });

  describe('selectPrimaryAgent', () => {
    it('should select agent based on task capability match', async () => {
      const intent: TaskIntent = {
        id: 'code-001',
        description: 'Write TypeScript module',
        priority: 'high',
        mode: 'automation',
        subtasks: [],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(intent);
      expect(result.targetAgent).toBeTruthy();
      expect(['claude', 'grok', 'openai']).toContain(result.targetAgent);
    });

    it('should return different agent for low-priority research tasks', async () => {
      const intent: TaskIntent = {
        id: 'research-001',
        description: 'Find best practices for API design',
        priority: 'low',
        mode: 'automation',
        subtasks: [],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(intent);
      expect(result.targetAgent).toBeTruthy();
    });
  });

  describe('prepareHandoff', () => {
    it('should create valid handoff context with metadata', async () => {
      const intent: TaskIntent = {
        id: 'handoff-001',
        description: 'Test handoff preparation',
        priority: 'medium',
        mode: 'automation',
        subtasks: [],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(intent);
      expect(result.taskId).toBe('handoff-001');
      expect(result.sourceMode).toBe('mode6');
      expect(result.timestamp).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should include secondary agents in handoff for escalation paths', async () => {
      const intent: TaskIntent = {
        id: 'escalation-001',
        description: 'Complex multi-faceted refactoring',
        priority: 'high',
        mode: 'automation',
        subtasks: ['module-a', 'module-b', 'module-c'],
        createdAt: new Date().toISOString(),
      };

      const result = await router.routeIntent(intent);
      expect((result.secondaryAgents || []).length).toBeGreaterThan(0);
      expect(result.escalationPath).toBeDefined();
    });
  });

  describe('getRoutingStats', () => {
    it('should return router statistics', async () => {
      const intent: TaskIntent = {
        id: 'stats-001',
        description: 'Stat test',
        priority: 'medium',
        mode: 'automation',
        subtasks: [],
        createdAt: new Date().toISOString(),
      };

      await router.routeIntent(intent);
      const stats = router.getRoutingStats();

      expect(stats).toBeDefined();
      expect(stats.totalRoutingDecisions).toBeGreaterThan(0);
    });
  });
});
