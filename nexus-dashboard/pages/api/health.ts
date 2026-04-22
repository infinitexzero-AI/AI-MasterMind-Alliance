import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from './middleware/error';
import { HealthRequestSchema } from '../../shared/schemas';
import { traceEvent } from '../../src/lib/comet';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    HealthRequestSchema.parse(req.query);

    const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8001';
    
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (!healthRes.ok) throw new Error("Cortex Internal API Refused Connection.");
    
    const metricsRes = await fetch(`${BACKEND_URL}/system/metrics`);
    if (!metricsRes.ok) throw new Error("Cortex Metrics Endpoint Offline.");
    
    const health = await healthRes.json();
    const metrics = await metricsRes.json();

    // Autonomous Audit: Trace System Health
    traceEvent('System_Health_Check', 
        { endpoint: '/api/health' },
        { status: healthRes.status, uvicorn: health.status },
        { type: 'heartbeat', port: 8001 }
    ).catch(console.error);

    res.status(200).json({
        success: true,
        status: 'OPTIMAL',
        timestamp: new Date().toISOString(),
        service: health.service || 'cortex-core',
        system: {
            memory: { usage: metrics.memory || 0 },
            cpu: { usage: metrics.cpu || 0 },
            disk: { usage: 0 }
        },
        message: 'Central Intelligence Telemetry established.'
    });
}

export default withErrorHandler(handler);
