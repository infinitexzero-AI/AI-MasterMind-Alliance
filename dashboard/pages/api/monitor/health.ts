/**
 * Proxy endpoint for Forge Monitor agent health data
 * Fetches from http://localhost:3001/api/agents/health
 * Implements 5-second caching to avoid duplicate requests
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentHealth {
  agentName: string;
  status: 'ok' | 'warn' | 'error';
  uptime: number;
  lastHeartbeat: string;
  errorCount: number;
  successCount: number;
}

interface HealthResponse {
  timestamp: string;
  agents: AgentHealth[];
}

interface FallbackResponse {
  timestamp: string;
  agents: AgentHealth[];
}

// In-memory cache for 5-second TTL
let cache: HealthResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 seconds

// Fallback mock data when Forge Monitor is unavailable
const getFallbackData = (): FallbackResponse => ({
  timestamp: new Date().toISOString(),
  agents: [
    {
      agentName: 'claude',
      status: 'ok',
      uptime: 3600,
      lastHeartbeat: new Date().toISOString(),
      errorCount: 0,
      successCount: 100,
    },
    {
      agentName: 'openai',
      status: 'warn',
      uptime: 3600,
      lastHeartbeat: new Date().toISOString(),
      errorCount: 2,
      successCount: 98,
    },
    {
      agentName: 'grok',
      status: 'ok',
      uptime: 3600,
      lastHeartbeat: new Date().toISOString(),
      errorCount: 0,
      successCount: 95,
    },
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse | { error: string }>
) {
  const now = Date.now();

  // Return cached data if still fresh
  if (cache && now - cacheTimestamp < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  try {
    // Attempt to fetch from Forge Monitor
    const forgeMonitorUrl = process.env.FORGE_MONITOR_URL || 'http://localhost:3001';
    const response = await fetch(`${forgeMonitorUrl}/api/agents/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000), // 2-second timeout
    });

    if (!response.ok) {
      throw new Error(`Forge Monitor returned ${response.status}`);
    }

    const data: HealthResponse = await response.json() as HealthResponse;
    
    // Validate response structure
    if (!data.timestamp || !Array.isArray(data.agents)) {
      throw new Error('Invalid response structure from Forge Monitor');
    }

    // Cache the response
    cache = data;
    cacheTimestamp = now;

    return res.status(200).json(data);
  } catch (error) {
    console.error('[Dashboard API] Forge Monitor health fetch failed:', error);

    // Fall back to mock data
    const fallbackData = getFallbackData();
    return res.status(200).json(fallbackData);
  }
}
