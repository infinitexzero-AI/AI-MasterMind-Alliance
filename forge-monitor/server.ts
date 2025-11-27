/**
 * Forge Monitor Server
 * Lightweight Express server providing agent health, status, and pipeline telemetry endpoints
 * Auto-starts when invoked directly
 */

import express, { Request, Response } from 'express';
import { HeartbeatSimulator } from './sim/heartbeat';
import { AgentHealth, AgentStatus } from './types/agents';
import { PipelineTelemetry } from './types/pipeline';

const app = express();
const PORT = process.env.PORT || 3001;
const simulator = new HeartbeatSimulator();

// In-memory store for telemetry
let agentHealthCache: AgentHealth[] = [];
let agentStatusCache: AgentStatus[] = [];
let pipelineTelemetryCache: PipelineTelemetry | null = null;

/**
 * Refresh telemetry from simulator every 5 seconds
 */
function refreshTelemetry(): void {
  agentHealthCache = simulator.generateAgentHealth();
  agentStatusCache = simulator.generateAgentStatus();
  pipelineTelemetryCache = simulator.generatePipelineTelemetry();
}

// Refresh telemetry on startup and periodically
refreshTelemetry();
setInterval(refreshTelemetry, 5000);

/**
 * GET /api/agents/health
 * Returns agent health metrics
 */
app.get('/api/agents/health', (_req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    agents: agentHealthCache,
  });
});

/**
 * GET /api/agents/status
 * Returns agent availability and current status
 */
app.get('/api/agents/status', (_req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    agents: agentStatusCache,
  });
});

/**
 * GET /api/pipeline/telemetry
 * Returns pipeline task execution telemetry
 */
app.get('/api/pipeline/telemetry', (_req: Request, res: Response) => {
  res.json(pipelineTelemetryCache || {});
});

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Start server if invoked directly
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Forge Monitor] Server listening on http://localhost:${PORT}`);
    console.log(`[Forge Monitor] Endpoints:`);
    console.log(`  GET /health`);
    console.log(`  GET /api/agents/health`);
    console.log(`  GET /api/agents/status`);
    console.log(`  GET /api/pipeline/telemetry`);
  });
}

export default app;
