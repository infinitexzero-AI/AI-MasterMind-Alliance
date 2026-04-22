import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, SystemHealth } from '../../../types/api.types';
import { withAuth } from '../../../lib/apiAuth';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';
import { AgentManager } from '../../../lib/agentManager';
import { TaskQueue } from '../../../lib/taskQueue';
import { logApiCall } from '../../../lib/logger';
import os from 'os';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SystemHealth>>) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const agents = AgentManager.getAllAgents();
    const queue = TaskQueue.getQueueStats();
    
    // Calculate system load (CPU usage as percentage)
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => 
      acc + cpu.times.idle + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq, 0
    );
    const systemLoad = Math.round(100 - (totalIdle / totalTick) * 100);

    const healthData: SystemHealth = {
      agents,
      queue,
      systemLoad
    };

    logApiCall('/api/dashboard/health', 'system', 'GET', 200);

    return res.status(200).json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiCall('/api/dashboard/health', 'unknown', 'GET', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(withAuth(handler));
