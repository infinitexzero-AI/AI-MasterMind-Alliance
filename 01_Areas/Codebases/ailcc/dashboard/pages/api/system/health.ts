import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface MemoryStatus {
    freeRAM: number;
    swapUsed: string;
    swapTotal: string;
    swapPercent: number;
    status: 'healthy' | 'warning' | 'critical';
}

export interface ProcessStatus {
    pid?: string;
    memory: string;
    status: string;
    count?: number;
}

export interface AutomationStatus {
    lastRun: string;
    status: 'active' | 'inactive';
}

export interface DiskStatus {
    used: string;
    total: string;
    percent: number;
}

export interface SystemHealthResponse {
    memory: MemoryStatus;
    disk: DiskStatus;
    processes: {
        languageServer: ProcessStatus;
        docker: ProcessStatus;
        chrome: ProcessStatus;
        antigravity: ProcessStatus;
    };
    automation: {
        memoryOrchestrator: AutomationStatus;
        storageOrchestrator: AutomationStatus;
        processMonitor: AutomationStatus;
        playwrightProxy: AutomationStatus;
        duckSearchProxy: AutomationStatus;
    };
    timestamp: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SystemHealthResponse | { error: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const path = require('path');
        const os = require('os');
        const AILCC_ROOT = process.env.AILCC_ROOT || path.join(os.homedir(), 'AILCC_PRIME');
        const scriptPath = path.join(AILCC_ROOT, '01_Areas/Codebases/ailcc/scripts/vanguard_telemetry.py');
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        
        const { stdout } = await execAsync(`${pythonCmd} "${scriptPath}"`);
        const telemetry = JSON.parse(stdout);
        
        const data: SystemHealthResponse = {
            memory: telemetry.system.memory,
            disk: telemetry.system.disk,
            processes: {
                languageServer: { status: "running", memory: "N/A" },
                docker: { status: telemetry.docker.status === 'HEALTHY' ? 'running' : 'degraded', memory: "N/A" },
                chrome: { count: 0, status: "idle", memory: "N/A" },
                antigravity: { count: 1, status: "running", memory: "N/A" }
            },
            automation: {
                memoryOrchestrator: { status: "active", lastRun: telemetry.system.timestamp },
                storageOrchestrator: { status: "active", lastRun: telemetry.system.timestamp },
                processMonitor: { status: "active", lastRun: telemetry.system.timestamp },
                playwrightProxy: { status: "inactive", lastRun: telemetry.system.timestamp },
                duckSearchProxy: { status: "inactive", lastRun: telemetry.system.timestamp }
            },
            timestamp: telemetry.system.timestamp
        };
        res.status(200).json(data);
    } catch (error) {
        console.error('Telemetry failure:', error);
        res.status(500).json({ error: 'Failed to retrieve system health' });
    }
}
