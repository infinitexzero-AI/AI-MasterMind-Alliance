/**
 * Memory Manager
 * Manages cross-agent memory storage, retrieval, and retention policies
 */

import { MemoryEntry } from '../intent-router/types';

export interface ExecutionResult {
  taskId: string;
  agentUsed: string;
  success: boolean;
  output?: any;
  duration: number;
  timestamp: Date;
}

export interface RoutingDecisionRecord {
  taskId: string;
  primaryAgent: string;
  secondaryAgents: string[];
  complexity: number;
  timestamp: Date;
}

export class MemoryManager {
  private memoryEntries: Map<string, MemoryEntry> = new Map();
  private routingDecisions: RoutingDecisionRecord[] = [];
  private executionResults: ExecutionResult[] = [];

  constructor() {}

  /**
   * Store a memory entry
   */
  storeMemoryEntry(entry: MemoryEntry): boolean {
    try {
      this.memoryEntries.set(entry.id, entry);
      return true;
    } catch (error) {
      console.error('Failed to store memory entry:', error);
      return false;
    }
  }

  /**
   * Store a routing decision
   */
  storeRoutingDecision(decision: RoutingDecisionRecord): boolean {
    try {
      this.routingDecisions.push(decision);
      return true;
    } catch (error) {
      console.error('Failed to store routing decision:', error);
      return false;
    }
  }

  /**
   * Retrieve related context by task similarity
   */
  retrieveRelatedContext(taskId: string): MemoryEntry[] {
    const related: MemoryEntry[] = [];

    for (const entry of this.memoryEntries.values()) {
      // Simple similarity: same task ID or related context
      if (entry.taskId === taskId || entry.taskId.startsWith(taskId.split('-')[0])) {
        related.push(entry);
      }
    }

    return related;
  }

  /**
   * Retrieve prerequisite context for dependent tasks
   */
  retrievePrerequisiteContext(dependencyIds: string[]): MemoryEntry[] {
    const prereqs: MemoryEntry[] = [];

    for (const depId of dependencyIds) {
      for (const entry of this.memoryEntries.values()) {
        if (entry.taskId === depId) {
          prereqs.push(entry);
        }
      }
    }

    return prereqs;
  }

  /**
   * Store an execution result
   */
  storeExecutionResult(result: ExecutionResult): boolean {
    try {
      this.executionResults.push(result);
      return true;
    } catch (error) {
      console.error('Failed to store execution result:', error);
      return false;
    }
  }

  /**
   * Build task dependencies from memory
   */
  buildTaskDependencies(_taskId: string): string[] {
    const deps: string[] = [];

    // Scan memory for tasks that might be dependencies
    for (const entry of this.memoryEntries.values()) {
      if (entry.relationshipType === 'prerequisite') {
        deps.push(entry.taskId);
      }
    }

    return deps;
  }

  /**
   * Apply retention policy: remove expired entries
   */
  applyRetentionPolicy(): Record<string, any> {
    const now = Date.now();
    let removedCount = 0;

    for (const [id, entry] of this.memoryEntries.entries()) {
      const entryTime = entry.timestamp.getTime();
      const ttlMs = entry.ttl * 1000;

      if (now - entryTime > ttlMs) {
        this.memoryEntries.delete(id);
        removedCount++;
      }
    }

    return {
      removedExpiredEntries: removedCount,
      remainingEntries: this.memoryEntries.size,
    };
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): Record<string, any> {
    return {
      totalEntries: this.memoryEntries.size,
      totalRoutingDecisions: this.routingDecisions.length,
      totalExecutionResults: this.executionResults.length,
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry(),
    };
  }

  /**
   * Get full memory dump for debugging
   */
  getMemoryDump(): Record<string, any> {
    return {
      memoryEntries: Array.from(this.memoryEntries.values()),
      routingDecisions: this.routingDecisions,
      executionResults: this.executionResults,
      stats: this.getMemoryStats(),
    };
  }

  /**
   * Get oldest entry timestamp
   */
  private getOldestEntry(): Date | null {
    if (this.memoryEntries.size === 0) return null;

    let oldest = new Date();
    for (const entry of this.memoryEntries.values()) {
      if (entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
    }
    return oldest;
  }

  /**
   * Get newest entry timestamp
   */
  private getNewestEntry(): Date | null {
    if (this.memoryEntries.size === 0) return null;

    let newest = new Date(0);
    for (const entry of this.memoryEntries.values()) {
      if (entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }
    return newest;
  }
}

export default MemoryManager;
