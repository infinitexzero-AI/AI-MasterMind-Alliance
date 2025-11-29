// AILCC Framework - Phase 4: Runtime Environment
// Central runtime coordinator for all agent processes

import { EventEmitter } from 'events';
import { SupervisorBus } from '../supervisor/bus';

export interface RuntimeConfig {
  maxAgents: number;
  heartbeatInterval: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class AgentRuntime extends EventEmitter {
  private supervisor: SupervisorBus;
  private activeAgents: Map<string, any>;
  private config: RuntimeConfig;

  constructor(config: Partial<RuntimeConfig> = {}) {
    super();
    this.config = {
      maxAgents: 10,
      heartbeatInterval: 5000,
      logLevel: 'info',
      ...config
    };
    this.supervisor = new SupervisorBus();
    this.activeAgents = new Map();
  }

  async start(): Promise<void> {
    console.log('[Runtime] Starting AILCC Agent Runtime...');
    await this.supervisor.start();
    this.emit('runtime:started');
  }

  async stop(): Promise<void> {
    console.log('[Runtime] Stopping AILCC Agent Runtime...');
    await this.supervisor.stop();
    this.activeAgents.clear();
    this.emit('runtime:stopped');
  }

  async spawnAgent(agentId: string, config: any): Promise<void> {
    if (this.activeAgents.size >= this.config.maxAgents) {
      throw new Error('Maximum agent limit reached');
    }
    console.log(`[Runtime] Spawning agent: ${agentId}`);
    this.activeAgents.set(agentId, { id: agentId, config, status: 'running' });
    this.emit('agent:spawned', agentId);
  }

  getActiveAgents(): string[] {
    return Array.from(this.activeAgents.keys());
  }
}
