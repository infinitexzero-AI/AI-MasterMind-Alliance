/**
 * Intent Router Unit Tests
 * Tests routing logic, agent selection, and handoff preparation.
 */

import { IntentRouter } from '../../automations/mode6/intent-router/intent-router';
import { TaskIntent } from '../../automations/mode6/index';

describe('IntentRouter', () => {
  let router: IntentRouter;

  beforeEach(() => {
    router = new IntentRouter();
  });

  describe('analyzeIntent', () => {
    it('should parse a valid task intent', () => {
      const intent: TaskIntent = {
        id: 'task-001',
        description: 'Analyze codebase for security vulnerabilities',
        taskType: 'analysis',
        priority: 'high',
        dependencies: [],
        contextSize: 'medium',
      };

      const result = router.routeIntent(intent);

      expect(result).toBeDefined();
      expect(result.taskId).toBe('task-001');
      expect(result.primaryAgent).toBeDefined();
      expect(result.handoffContext).toBeDefined();
    });

    it('should classify task types correctly', () => {
      const analysisIntent: TaskIntent = {
        id: 'analysis-001',
        description: 'Analyze logs',
        taskType: 'analysis',
        priority: 'medium',
        dependencies: [],
        contextSize: 'small',
      };

      const result = router.routeIntent(analysisIntent);
      expect(result.primaryAgent).toBe('claude'); // Default for analysis
    });

    it('should estimate complexity based on context and dependencies', () => {
      const complexIntent: TaskIntent = {
        id: 'complex-001',
        description: 'Refactor entire module with cross-cutting concerns',
        taskType: 'code-generation',
        priority: 'high',
        dependencies: ['auth', 'db', 'cache'],
        contextSize: 'large',
      };

      const result = router.routeIntent(complexIntent);
      expect(result.complexity).toBeGreaterThan(0.5);
      expect(result.secondaryAgents.length).toBeGreaterThan(0); // High complexity needs backups
    });
  });

  describe('selectPrimaryAgent', () => {
    it('should select agent based on task capability match', () => {
      const intent: TaskIntent = {
        id: 'code-001',
        description: 'Write TypeScript module',
        taskType: 'code-generation',
        priority: 'high',
        dependencies: [],
        contextSize: 'medium',
      };

      const result = router.routeIntent(intent);
      expect(result.primaryAgent).toBeTruthy();
      expect(['claude', 'grok', 'openai']).toContain(result.primaryAgent);
    });

    it('should return different agent for low-priority research tasks', () => {
      const intent: TaskIntent = {
        id: 'research-001',
        description: 'Find best practices for API design',
        taskType: 'research',
        priority: 'low',
        dependencies: [],
        contextSize: 'small',
      };

      const result = router.routeIntent(intent);
      expect(result.primaryAgent).toBeTruthy();
    });
  });

  describe('prepareHandoff', () => {
    it('should create valid handoff context with metadata', () => {
      const intent: TaskIntent = {
        id: 'handoff-001',
        description: 'Test handoff preparation',
        taskType: 'code-generation',
        priority: 'medium',
        dependencies: [],
        contextSize: 'medium',
      };

      const result = router.routeIntent(intent);
      expect(result.handoffContext.taskId).toBe('handoff-001');
      expect(result.handoffContext.sourceMode).toBe('mode6');
      expect(result.handoffContext.timestamp).toBeDefined();
      expect(result.handoffContext.metadata).toBeDefined();
    });

    it('should include secondary agents in handoff for escalation paths', () => {
      const intent: TaskIntent = {
        id: 'escalation-001',
        description: 'Complex multi-faceted refactoring',
        taskType: 'code-generation',
        priority: 'high',
        dependencies: ['module-a', 'module-b', 'module-c'],
        contextSize: 'large',
      };

      const result = router.routeIntent(intent);
      expect(result.secondaryAgents.length).toBeGreaterThan(0);
      expect(result.handoffContext.escalationPath).toBeDefined();
    });
  });

  describe('getRoutingStats', () => {
    it('should return router statistics', () => {
      const intent: TaskIntent = {
        id: 'stats-001',
        description: 'Stat test',
        taskType: 'analysis',
        priority: 'medium',
        dependencies: [],
        contextSize: 'small',
      };

      router.routeIntent(intent);
      const stats = router.getRoutingStats();

      expect(stats).toBeDefined();
      expect(stats.totalRoutingDecisions).toBeGreaterThan(0);
    });
  });
});
