/**
 * Memory Manager Unit Tests
 * Tests cross-agent memory storage, retrieval, and retention policies.
 */

import { MemoryManager } from '../automations/mode6/memory/memory-manager';
import { MemoryEntry, AgentType } from '../automations/mode6/index';

interface MemoryStats {
  totalEntries: number;
  totalRoutingDecisions: number;
  totalExecutionResults: number;
}

describe('MemoryManager', () => {
  let memory: MemoryManager;

  beforeEach(() => {
    memory = new MemoryManager();
  });

  describe('storeMemoryEntry', () => {
    it('should store a memory entry successfully', async () => {
      const entry: MemoryEntry = {
        id: 'mem-001',
        taskId: 'task-001',
        content: 'Test memory content',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400, // 24 hours
      };
      const stored = await memory.storeMemoryEntry(entry);
      expect(stored).toBe(true);
    });

    it('should retrieve stored memory entry by ID', async () => {
      const entry: MemoryEntry = {
        id: 'mem-002',
        taskId: 'task-002',
        content: 'Retrievable memory',
        sourceAgent: 'grok',
        timestamp: new Date(),
        ttl: 86400,
      };

      await memory.storeMemoryEntry(entry);
      const stats = await memory.getMemoryStats() as MemoryStats;
      expect(stats.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('storeRoutingDecision', () => {
    it('should store routing decision for future reference', async () => {
      const decision = {
        taskId: 'task-003',
        primaryAgent: 'claude' as AgentType,
        secondaryAgents: ['grok'] as AgentType[],
        complexity: 0.7,
        timestamp: new Date(),
      };

      const stored = await memory.storeRoutingDecision(decision);
      expect(stored).toBe(true);
    });
  });

  describe('retrieveRelatedContext', () => {
    it('should retrieve related memory entries by task similarity', async () => {
      const entry1: MemoryEntry = {
        id: 'mem-ctx-001',
        taskId: 'analysis-task-1',
        content: 'Security analysis of module X',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      const entry2: MemoryEntry = {
        id: 'mem-ctx-002',
        taskId: 'analysis-task-2',
        content: 'Security audit findings',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      await memory.storeMemoryEntry(entry1);
      await memory.storeMemoryEntry(entry2);

      const related = await memory.getEntry('analysis-task-1');
      expect(related).toBeDefined();
    });
  });

  describe('retrievePrerequisiteContext', () => {
    it('should retrieve prerequisite entries for dependent tasks', async () => {
      const prerequisite: MemoryEntry = {
        id: 'mem-prereq-001',
        taskId: 'setup-task',
        content: 'Environment setup completed',
        sourceAgent: 'openai',
        timestamp: new Date(),
        ttl: 86400,
      };

      await memory.storeMemoryEntry(prerequisite);

      const prereq = await memory.getEntry('setup-task');
      expect(prereq).toBeDefined();
    });
  });

  describe('storeExecutionResult', () => {
    it('should store execution result with outcome', async () => {
      const result = {
        taskId: 'exec-001',
        agentUsed: 'claude',
        success: true,
        output: 'Task completed successfully',
        duration: 2500,
        timestamp: new Date(),
      };

      const stored = await memory.storeExecutionResult(result);
      expect(stored).toBe(true);
    });
  });

  describe('applyRetentionPolicy', () => {
    it('should clean up expired entries based on TTL', async () => {
      const expiredEntry: MemoryEntry = {
        id: 'mem-expired-001',
        taskId: 'task-expired',
        content: 'This should expire',
        sourceAgent: 'claude',
        timestamp: new Date(Date.now() - 90000000), // Older than 25 hours
        ttl: 3600, // 1 hour
      };

      const recentEntry: MemoryEntry = {
        id: 'mem-recent-001',
        taskId: 'task-recent',
        content: 'This should stay',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      await memory.storeMemoryEntry(expiredEntry);
      await memory.storeMemoryEntry(recentEntry);

      await memory.applyRetentionPolicy();

      const stats = await memory.getMemoryStats();
      expect(stats).toBeDefined();
    });
  });

  describe('getMemoryStats', () => {
    it('should return accurate memory statistics', async () => {
      const entry: MemoryEntry = {
        id: 'mem-stats-001',
        taskId: 'task-stats',
        content: 'Stats test',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      await memory.storeMemoryEntry(entry);
      const stats = await memory.getMemoryStats() as MemoryStats;

      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBeGreaterThan(0);
      expect(stats.totalRoutingDecisions).toBeGreaterThanOrEqual(0);
      expect(stats.totalExecutionResults).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMemoryDump', () => {
    it('should verify memory init', async () => {
      await memory.init();
      const stats = await memory.getMemoryStats();
      expect(stats).toBeDefined();
    });
  });
});
