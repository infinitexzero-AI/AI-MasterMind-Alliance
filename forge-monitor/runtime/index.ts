/**
 * Forge runtime scaffold - TypeScript
 * Exposes start/stop/status and emits telemetry events via EventEmitter
 */
import { EventEmitter } from "events";

interface RuntimeConfig {
  maxAgents?: number;
}

interface AgentConfig {
  name?: string;
  capabilities?: string[];
  [key: string]: any;
}

interface Agent {
  id: string;
  config: AgentConfig;
  status: 'active' | 'terminated';
  spawnedAt: number;
}

export class AgentRuntime extends EventEmitter {
  private running = false;
  private interval: NodeJS.Timeout | null = null;
  private agents: Map<string, Agent> = new Map();
  private maxAgents: number;

  constructor(config: RuntimeConfig = {}) {
    super();
    this.maxAgents = config.maxAgents || 10;
  }

  async start(): Promise<void> {
    if (this.running) {
      throw new Error("Runtime already started");
    }
    
    this.running = true;
    this.emit("started", { ts: Date.now() });
    
    this.interval = setInterval(() => {
      this.emit("telemetry", {
        ts: Date.now(),
        latency: Math.floor(25 + Math.random() * 50),
        load: Math.round(Math.random() * 100) / 100,
        activeAgents: this.agents.size
      });
    }, 3000);
  }

  async stop(): Promise<void> {
    if (!this.running) {
      throw new Error("Runtime not running");
    }
    
    this.running = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    // Terminate all active agents
    const agentIds = Array.from(this.agents.keys());
    for (const agentId of agentIds) {
      await this.terminateAgent(agentId);
    }
    
    this.emit("stopped", { ts: Date.now() });
  }

  async spawnAgent(agentId: string, config: AgentConfig): Promise<Agent> {
    if (this.agents.size >= this.maxAgents) {
      throw new Error(`Maximum agent limit of ${this.maxAgents} reached`);
    }
    
    if (this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} already exists`);
    }

    const agent: Agent = {
      id: agentId,
      config,
      status: 'active',
      spawnedAt: Date.now()
    };

    this.agents.set(agentId, agent);
    this.emit("agent:spawned", { agentId, config, ts: Date.now() });
    
    return agent;
  }

  async terminateAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = 'terminated';
    this.agents.delete(agentId);
    this.emit("agent:terminated", { agentId, ts: Date.now() });
  }

  getActiveAgents(): string[] {
    return Array.from(this.agents.keys()).filter(id => {
      const agent = this.agents.get(id);
      return agent?.status === 'active';
    });
  }

  status() {
    return {
      running: this.running,
      activeAgents: this.agents.size,
      maxAgents: this.maxAgents,
      agents: Array.from(this.agents.values()),
      ts: Date.now()
    };
  }

  isRunning(): boolean {
    return this.running;
  }
}

// Singleton export for backward compatibility with worker.ts
const runtime = new AgentRuntime();
export default runtime;

// Named export for tests
// AgentRuntime is already exported by the class definition

