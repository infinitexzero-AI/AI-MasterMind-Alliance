/**
 * Proxy endpoint for Forge Monitor pipeline telemetry data
 * Fetches from http://localhost:3001/api/pipeline/telemetry
 * Implements 5-second caching to avoid duplicate requests
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface PipelineTaskMetrics {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  agentAssigned?: string;
  duration: number;
  successIndicator: boolean;
}

interface PipelineTelemetry {
  timestamp: string;
  overallStatus: 'ok' | 'degraded' | 'failed';
  tasksInFlight: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageLatency: number;
  recentTasks: PipelineTaskMetrics[];
}

// In-memory cache for 5-second TTL
let cache: PipelineTelemetry | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 seconds

// Fallback mock data when Forge Monitor is unavailable
const getFallbackData = (): PipelineTelemetry => ({
  timestamp: new Date().toISOString(),
  overallStatus: 'ok',
  tasksInFlight: 1,
  tasksCompleted: 47,
  tasksFailed: 2,
  averageLatency: 320,
  recentTasks: [
    {
      taskId: 'task-001-claude',
      status: 'running',
      agentAssigned: 'claude',
      duration: 1500,
      successIndicator: true,
    },
    {
      taskId: 'task-002-openai',
      status: 'completed',
      agentAssigned: 'openai',
      duration: 2100,
      successIndicator: true,
    },
    {
      taskId: 'task-003-grok',
      status: 'completed',
      agentAssigned: 'grok',
      duration: 890,
      successIndicator: true,
    },
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PipelineTelemetry | { error: string }>
) {
  const now = Date.now();

  // Return cached data if still fresh
  if (cache && now - cacheTimestamp < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  try {
    // Attempt to fetch from Forge Monitor
    const forgeMonitorUrl = process.env.FORGE_MONITOR_URL || 'http://localhost:3001';
    const response = await fetch(`${forgeMonitorUrl}/api/pipeline/telemetry`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000), // 2-second timeout
    });

    if (!response.ok) {
      throw new Error(`Forge Monitor returned ${response.status}`);
    }

    const data: PipelineTelemetry = await response.json() as PipelineTelemetry;
    
    // Validate response structure
    if (!data.timestamp || !data.overallStatus || typeof data.tasksInFlight !== 'number') {
      throw new Error('Invalid response structure from Forge Monitor');
    }

    // Cache the response
    cache = data;
    cacheTimestamp = now;

    return res.status(200).json(data);
  } catch (error) {
    console.error('[Dashboard API] Forge Monitor telemetry fetch failed:', error);

    // Fall back to mock data
    const fallbackData = getFallbackData();
    return res.status(200).json(fallbackData);
  }
}
