/**
 * Forge Monitor Server
 * Lightweight HTTP server providing agent health, status, and pipeline telemetry endpoints
 * Auto-starts when invoked directly
 * 
 * Note: Requires optional dependency 'express' for full functionality.
 * Can be imported and used as a module for telemetry generation.
 */

import { HeartbeatSimulator } from './sim/heartbeat';
import { AgentHealth, AgentStatus } from './types/agents';
import { PipelineTelemetry } from './types/pipeline';

const simulator = new HeartbeatSimulator();

// In-memory store for telemetry
let agentHealthCache: AgentHealth[] = [];
let agentStatusCache: AgentStatus[] = [];
let pipelineTelemetryCache: PipelineTelemetry | null = null;

/**
 * Refresh telemetry from simulator every 5 seconds
 */
export function refreshTelemetry(): void {
  agentHealthCache = simulator.generateAgentHealth();
  agentStatusCache = simulator.generateAgentStatus();
  pipelineTelemetryCache = simulator.generatePipelineTelemetry();
}

/**
 * Get current agent health telemetry
 */
export function getAgentHealth(): { timestamp: string; agents: AgentHealth[] } {
  return {
    timestamp: new Date().toISOString(),
    agents: agentHealthCache,
  };
}

/**
 * Get current agent status telemetry
 */
export function getAgentStatus(): { timestamp: string; agents: AgentStatus[] } {
  return {
    timestamp: new Date().toISOString(),
    agents: agentStatusCache,
  };
}

/**
 * Get current pipeline telemetry
 */
export function getPipelineTelemetry(): PipelineTelemetry | null {
  return pipelineTelemetryCache;
}

/**
 * Get health status
 */
export function getHealth(): { status: string; timestamp: string } {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Start Express server (requires express to be installed)
 */
export async function startServer(port: number = 3001): Promise<void> {
  try {
    // Dynamically import express if available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const express = require('express');
    const app = express();

    // Refresh telemetry on startup
    refreshTelemetry();
    setInterval(refreshTelemetry, 5000);

    // Endpoints
    app.get('/health', (_req: any, res: any) => {
      res.json(getHealth());
    });

    app.get('/api/agents/health', (_req: any, res: any) => {
      res.json(getAgentHealth());
    });

    app.get('/api/agents/status', (_req: any, res: any) => {
      res.json(getAgentStatus());
    });

    app.get('/api/pipeline/telemetry', (_req: any, res: any) => {
      res.json(getPipelineTelemetry() || {});
    });

    app.listen(port, () => {
      console.log(`[Forge Monitor] Server listening on http://localhost:${port}`);
      console.log(`[Forge Monitor] Endpoints:`);
      console.log(`  GET /health`);
      console.log(`  GET /api/agents/health`);
      console.log(`  GET /api/agents/status`);
      console.log(`  GET /api/pipeline/telemetry`);
    });
  } catch (error) {
    console.error('[Forge Monitor] Express not available. Install with: npm install express @types/express');
    console.error('[Forge Monitor] Telemetry functions available for import.');
    throw error;
  }
}

/**
 * Auto-start server if invoked directly
 */
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3001;
  startServer(PORT).catch((error) => {
    console.error('[Forge Monitor] Failed to start server:', error.message);
    process.exit(1);
  });
}
