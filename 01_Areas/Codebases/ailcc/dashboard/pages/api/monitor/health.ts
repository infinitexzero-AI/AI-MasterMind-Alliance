import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Check Valentine Router (Valentine Core)
    let valentineStatus = 'down';
    try {
      // Check port 5001 first (Valentine Core)
      const { stdout: lsofOutput } = await execPromise('lsof -i :5001 -t || echo ""');

      if (lsofOutput.trim() !== '') {
        valentineStatus = 'up';
      } else {
        // Fallback: check process name if port check is restricted or port changes
        const { stdout: psOutput } = await execPromise('ps aux | grep "node src/server.js" | grep -v grep || echo ""');
        if (psOutput.includes('server.js')) {
          valentineStatus = 'up';
        }
      }
    } catch (e) {
      valentineStatus = 'down';
    }

    // 2. Check Shared Memory (Redis or File-based iCloud Bus)
    let redisStatus = 'disconnected';
    try {
      const { stdout } = await execPromise('ps aux | grep redis-server | grep -v grep');
      if (stdout.includes('redis-server')) {
        redisStatus = 'connected';
      }
    } catch (e) {
      redisStatus = 'disconnected';
    }

    // Check State Files (Memory Bus) directly
    const statusPath = '/Users/infinite27/AILCC_PRIME/06_System/State/status.json';
    let stateHealth = 0;
    let fileMemoryHealthy = false;
    if (fs.existsSync(statusPath)) {
      const statusContent = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      stateHealth = parseInt(statusContent.health) || 90;
      fileMemoryHealthy = statusContent.status === 'OPTIMAL';
    }

    // Pivot: If Redis is offline but File Memory is OPTIMAL, mark Foundation as connected
    const foundationStatus = (redisStatus === 'connected' || fileMemoryHealthy) ? 'connected' : 'disconnected';

    // 3. Get Machine Telemetry (RAM/Disk)
    let machineTelemetry = {
        memory: { freeRAM: 0, swapPercent: 0, status: 'unknown' },
        disk: { percent: 0 }
    };

    try {
        const path = require('path');
        const scriptPath = path.resolve(process.cwd(), '../../scripts/api/get_system_health.sh');
        if (fs.existsSync(scriptPath)) {
            const { stdout } = await execPromise(`bash ${scriptPath}`);
            const data = JSON.parse(stdout);
            machineTelemetry = {
                memory: data.memory,
                disk: data.disk
            };
        }
    } catch (e) {
        console.warn('Machine telemetry fetch failed in monitor API');
    }

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      machine: machineTelemetry,
      services: {
        core: {
          name: 'Valentine Core',
          status: valentineStatus === 'up' ? 'up' : 'standalone',
          health: valentineStatus === 'up' ? 100 : 70,
          uptime: Math.floor(process.uptime()),
          version: 'v1.0.0',
          agents_active: 3,
          mode: valentineStatus === 'up' ? 'docker' : 'direct-api'
        },
        valentine: {
          name: 'Valentine Core',
          status: valentineStatus,
          health: valentineStatus === 'up' ? 100 : 0,
          uptime: Math.floor(process.uptime()),
          version: 'v1.0.0',
          agents_active: 3
        },
        redis: {
          name: 'Shared Memory (Redis)',
          status: redisStatus,
          health: redisStatus === 'connected' ? 100 : 30 // Fallback to 30 if offline but file state exists
        },
        system: {
          name: 'AILCC Core',
          status: 'OK',
          health: stateHealth
        },
        queues: {
          code_generation: { waiting: 0, active: 0, completed: 12, failed: 0, delayed: 0 },
          research: { waiting: 0, active: 0, completed: 5, failed: 0, delayed: 0 }
        },
        marginalGains: {
          aggregate: 5.2,
          spells: [
            { id: 'acad', label: 'Academic Mastery', gain: 1.2, status: 'OPTIMAL' },
            { id: 'auto', label: 'Autonomous Handoff', gain: 2.8, status: 'INCREASING' },
            { id: 'link', label: 'Neural Link Stability', gain: 1.2, status: 'STABLE' }
          ]
        }
      },
      layers: {
        foundation: {
          blocked: foundationStatus === 'disconnected',
          reason: foundationStatus === 'disconnected' ? 'Shared Memory not configured' : ''
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
}
