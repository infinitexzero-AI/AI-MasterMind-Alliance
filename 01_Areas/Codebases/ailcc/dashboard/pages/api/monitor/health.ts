import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execPromise = util.promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isWin = os.platform() === 'win32';
    const AILCC_ROOT = process.env.AILCC_ROOT || (isWin ? 'c:\\Users\\infin\\AILCC_PRIME' : path.join(os.homedir(), 'AILCC_PRIME'));

    // 1. Check Valentine Router (Valentine Core) - Port 3002
    let valentineStatus = 'down';
    try {
      const port = 3002;
      if (isWin) {
        const { stdout } = await execPromise(`netstat -ano | findstr :${port} | findstr LISTENING`);
        if (stdout.trim() !== '') valentineStatus = 'up';
      } else {
        const { stdout } = await execPromise(`lsof -i :${port} -t || echo ""`);
        if (stdout.trim() !== '') valentineStatus = 'up';
      }
    } catch (e) {
      valentineStatus = 'down';
    }

    // 2. Check Shared Memory (Redis) - Port 6379
    let redisStatus = 'disconnected';
    try {
      if (isWin) {
        const { stdout } = await execPromise(`netstat -ano | findstr :6379 | findstr LISTENING`);
        if (stdout.trim() !== '') redisStatus = 'connected';
      } else {
        const { stdout } = await execPromise('ps aux | grep redis-server | grep -v grep || echo ""');
        if (stdout.includes('redis-server') || stdout.trim() !== '') {
          redisStatus = 'connected';
        }
      }
    } catch (e) {
      redisStatus = 'disconnected';
    }

    // Check State Files (Memory Bus) 
    const statusPath = path.join(AILCC_ROOT, '06_System/State/status.json');
    let stateHealth = 100; // Default to healthy if services are up
    let fileMemoryHealthy = false;
    
    if (fs.existsSync(statusPath)) {
      try {
        const statusContent = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        stateHealth = parseInt(statusContent.health) || 90;
        fileMemoryHealthy = statusContent.status === 'OPTIMAL';
      } catch (e) {
        console.warn('Failed to parse status.json');
      }
    }

    // Foundation Status
    const foundationStatus = (redisStatus === 'connected' || fileMemoryHealthy) ? 'connected' : 'disconnected';

    // 3. Machine Telemetry
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const machineTelemetry = {
        memory: { 
            freeRAM: Math.round(freeMem / 1024 / 1024 / 1024), 
            totalRAM: Math.round(totalMem / 1024 / 1024 / 1024),
            usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
            status: freeMem > totalMem * 0.1 ? 'healthy' : 'critical'
        },
        disk: { percent: 0 } // Disk check is harder cross-platform without extra libs
    };

    res.status(200).json({
      status: 'healthy',
      node: os.hostname(),
      platform: os.platform(),
      timestamp: new Date().toISOString(),
      machine: machineTelemetry,
      services: {
        core: {
          name: 'Neural Relay',
          status: 'up', // We are running the API, so we are up
          health: 100,
          uptime: Math.floor(process.uptime()),
          version: 'v1.0.0',
          mode: 'sovereign'
        },
        valentine: {
          name: 'Valentine Core',
          status: valentineStatus,
          health: valentineStatus === 'up' ? 100 : 0,
          uptime: Math.floor(process.uptime()),
          version: 'v1.0.0'
        },
        redis: {
          name: 'Shared Memory (Redis)',
          status: redisStatus,
          health: redisStatus === 'connected' ? 100 : 30
        },
        system: {
          name: 'AILCC Nexus',
          status: 'OK',
          health: stateHealth
        }
      },
      layers: {
        foundation: {
          blocked: foundationStatus === 'disconnected',
          reason: foundationStatus === 'disconnected' ? 'Shared Memory not detected' : ''
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
}
