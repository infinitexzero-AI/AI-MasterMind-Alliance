/**
 * Forge Monitor Heartbeat Simulator
 * Generates mock deterministic agent and pipeline telemetry
 */

import { AgentHealth, AgentStatus } from '../types/agents';
import { PipelineTelemetry, PipelineTaskMetrics } from '../types/pipeline';

export class HeartbeatSimulator {
  private agents = ['claude', 'openai', 'grok'];
  private taskCounter = 0;
  private startTime = Date.now();

  constructor() {}

  /**
   * Generate mock agent health telemetry
   */
  generateAgentHealth(): AgentHealth[] {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return this.agents.map((agent, idx) => ({
      agentName: agent,
      status: idx === 1 ? 'warn' : 'ok', // openai in warn mode
      uptime,
      lastHeartbeat: new Date().toISOString(),
      errorCount: idx * 2,
      successCount: 100 - idx * 5,
    }));
  }

  /**
   * Generate mock agent status telemetry
   */
  generateAgentStatus(): AgentStatus[] {
    return this.agents.map((agent) => ({
      agentName: agent,
      availability: agent === 'openai' ? 'busy' : 'available',
      currentTask: agent === 'openai' ? 'task-0042' : undefined,
      queuedTasks: agent === 'grok' ? 3 : 0,
      capabilities: this.getCapabilitiesForAgent(agent),
      latency: 50 + Math.random() * 30, // deterministic-ish: 50-80ms
    }));
  }

  /**
   * Generate mock pipeline telemetry
   */
  generatePipelineTelemetry(): PipelineTelemetry {
    const now = new Date().toISOString();
    const recentTasks: PipelineTaskMetrics[] = [
      {
        taskId: 'task-0001',
        taskType: 'analysis',
        status: 'completed',
        agentAssigned: 'claude',
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date(Date.now() - 50000).toISOString(),
        duration: 10000,
        successIndicator: true,
      },
      {
        taskId: 'task-0002',
        taskType: 'code-generation',
        status: 'completed',
        agentAssigned: 'openai',
        startTime: new Date(Date.now() - 50000).toISOString(),
        endTime: new Date(Date.now() - 35000).toISOString(),
        duration: 15000,
        successIndicator: true,
      },
      {
        taskId: 'task-0003',
        taskType: 'reasoning',
        status: 'running',
        agentAssigned: 'grok',
        startTime: new Date(Date.now() - 5000).toISOString(),
        successIndicator: true,
      },
    ];

    return {
      timestamp: now,
      overallStatus: 'ok',
      tasksInFlight: 1,
      tasksCompleted: 2,
      tasksFailed: 0,
      averageLatency: 65,
      recentTasks,
    };
  }

  /**
   * Get capabilities for an agent
   */
  private getCapabilitiesForAgent(agent: string): string[] {
    const capabilities: Record<string, string[]> = {
      claude: ['analysis', 'code-generation', 'documentation'],
      openai: ['code-generation', 'documentation', 'quick-tasks'],
      grok: ['reasoning', 'multi-step-planning', 'code-review'],
    };
    return capabilities[agent] || [];
  }
}
