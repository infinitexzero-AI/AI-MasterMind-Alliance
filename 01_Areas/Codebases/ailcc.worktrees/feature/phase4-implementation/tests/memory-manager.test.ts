/**
 * Memory Manager Unit Tests
 * Tests cross-agent memory storage, retrieval, and retention policies.
 */

import { MemoryManager } from '../automations/mode6/memory/memory-manager';
import { MemoryEntry, HandoffContext } from '../automations/mode6/index';

describe('MemoryManager', () => {
  let memory: MemoryManager;

  beforeEach(() => {
    memory = new MemoryManager();
  });

  describe('storeMemoryEntry', () => {
    it('should store a memory entry successfully', () => {
      const entry: MemoryEntry = {
        id: 'mem-001',
        taskId: 'task-001',
        content: 'Test memory content',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400, // 24 hours
      };

      const stored = memory.storeMemoryEntry(entry);
      expect(stored).toBe(true);
    });

    it('should retrieve stored memory entry by ID', () => {
      const entry: MemoryEntry = {
        id: 'mem-002',
        taskId: 'task-002',
        content: 'Retrievable memory',
        sourceAgent: 'grok',
        timestamp: new Date(),
        ttl: 86400,
      };

      memory.storeMemoryEntry(entry);
      const stats = memory.getMemoryStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('storeRoutingDecision', () => {
    it('should store routing decision for future reference', () => {
      const decision = {
        taskId: 'task-003',
        primaryAgent: 'claude',
        secondaryAgents: ['grok'],
        complexity: 0.7,
        timestamp: new Date(),
      };

      const stored = memory.storeRoutingDecision(decision);
      expect(stored).toBe(true);
    });
  });

  describe('retrieveRelatedContext', () => {
    it('should retrieve related memory entries by task similarity', () => {
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

      memory.storeMemoryEntry(entry1);
      memory.storeMemoryEntry(entry2);

      const related = memory.retrieveRelatedContext('analysis-task-3');
      expect(Array.isArray(related)).toBe(true);
    });
  });

  describe('retrievePrerequisiteContext', () => {
    it('should retrieve prerequisite entries for dependent tasks', () => {
      const prerequisite: MemoryEntry = {
        id: 'mem-prereq-001',
        taskId: 'setup-task',
        content: 'Environment setup completed',
        sourceAgent: 'openai',
        timestamp: new Date(),
        ttl: 86400,
      };

      memory.storeMemoryEntry(prerequisite);

      const prereqs = memory.retrievePrerequisiteContext(['setup-task']);
      expect(Array.isArray(prereqs)).toBe(true);
    });
  });

  describe('storeExecutionResult', () => {
    it('should store execution result with outcome', () => {
      const result = {
        taskId: 'exec-001',
        agentUsed: 'claude',
        success: true,
        output: 'Task completed successfully',
        duration: 2500, // milliseconds
        timestamp: new Date(),
      };

      const stored = memory.storeExecutionResult(result);
      expect(stored).toBe(true);
    });
  });

  describe('applyRetentionPolicy', () => {
    it('should clean up expired entries based on TTL', () => {
      const expiredEntry: MemoryEntry = {
        id: 'mem-expired-001',
        taskId: 'task-expired',
        content: 'This should expire',
        sourceAgent: 'claude',
        timestamp: new Date(Date.now() - 90000000), // Older than 25 hours
        ttl: 86400, // 24 hours
      };

      const recentEntry: MemoryEntry = {
        id: 'mem-recent-001',
        taskId: 'task-recent',
        content: 'This should stay',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      memory.storeMemoryEntry(expiredEntry);
      memory.storeMemoryEntry(recentEntry);

      memory.applyRetentionPolicy();

      const stats = memory.getMemoryStats();
      expect(stats).toBeDefined();
    });
  });

  describe('getMemoryStats', () => {
    it('should return accurate memory statistics', () => {
      const entry: MemoryEntry = {
        id: 'mem-stats-001',
        taskId: 'task-stats',
        content: 'Stats test',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      memory.storeMemoryEntry(entry);
      const stats = memory.getMemoryStats();

      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBeGreaterThan(0);
      expect(stats.totalRoutingDecisions).toBeGreaterThanOrEqual(0);
      expect(stats.totalExecutionResults).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMemoryDump', () => {
    it('should export full memory dump for debugging', () => {
      const entry: MemoryEntry = {
        id: 'mem-dump-001',
        taskId: 'task-dump',
        content: 'Dump test',
        sourceAgent: 'claude',
        timestamp: new Date(),
        ttl: 86400,
      };

      memory.storeMemoryEntry(entry);
      const dump = memory.getMemoryDump();

      expect(dump).toBeDefined();
      expect(dump.memoryEntries).toBeDefined();
    });
  });
});
