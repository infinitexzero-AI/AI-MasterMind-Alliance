/**
 * Agent Adapter Registry
 * Centralized registry for all available agent adapters
 * Provides factory methods for adapter instantiation and capability lookup
 */

import ClaudeAdapter, { ClaudeAdapterConfig } from './claude-adapter';
import OpenAIAdapter, { OpenAIAdapterConfig } from './openai-adapter';
import GrokAdapter, { GrokAdapterConfig } from './grok-adapter';
import { configLoader } from '../config/env';
import { DispatchResult, HandoffContext } from '../intent-router/types';

export interface AgentAdapter {
  executeTask(handoff: HandoffContext): Promise<DispatchResult>;
  validateCapability(capability: string): Promise<boolean>;
  getStats(): Record<string, unknown>;
}

export class AdapterRegistry {
  private adapters: Map<string, AgentAdapter> = new Map();

  constructor() {
    this.initializeDefaultAdapters();
  }

  private initializeDefaultAdapters() {
    // Initialize with default configs; actual API keys come from environment
    this.register('claude', new ClaudeAdapter());
    this.register('openai', new OpenAIAdapter());
    this.register('grok', new GrokAdapter());
  }

  /**
   * Register a custom adapter
   */
  register(name: string, adapter: AgentAdapter) {
    this.adapters.set(name.toLowerCase(), adapter);
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): AgentAdapter | undefined {
    return this.adapters.get(name.toLowerCase());
  }

  /**
   * List all registered adapters
   */
  listAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if adapter exists
   */
  hasAdapter(name: string): boolean {
    return this.adapters.has(name.toLowerCase());
  }

  /**
   * Get adapters with specific capability
   */
  async getAdaptersByCapability(capability: string): Promise<string[]> {
    const matching: string[] = [];

    for (const [name, adapter] of this.adapters.entries()) {
      const hasCapability = await adapter.validateCapability(capability);
      if (hasCapability) {
        matching.push(name);
      }
    }

    return matching;
  }

  /**
   * Get stats for all adapters
   */
  getAllStats(): Record<string, Record<string, unknown>> {
    const stats: Record<string, Record<string, unknown>> = {};

    for (const [name, adapter] of this.adapters.entries()) {
      stats[name] = adapter.getStats();
    }

    return stats;
  }

  /**
   * Create new Claude adapter with custom config
   */
  createClaudeAdapter(config?: ClaudeAdapterConfig): ClaudeAdapter {
    return new ClaudeAdapter(config);
  }

  /**
   * Create new OpenAI adapter with custom config
   */
  createOpenAIAdapter(config?: OpenAIAdapterConfig): OpenAIAdapter {
    return new OpenAIAdapter(config);
  }

  /**
   * Create new Grok adapter with custom config
   */
  createGrokAdapter(config?: GrokAdapterConfig): GrokAdapter {
    return new GrokAdapter(config);
  }
}

export default AdapterRegistry;
