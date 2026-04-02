import type { NextApiRequest, NextApiResponse } from 'next';
import * as os from 'os';

/**
 * GET /api/system/memory-trend
 *
 * Returns current memory usage snapshot plus a simple timestamp.
 * Client-side polls this endpoint every ~10 seconds to build a RAM trend chart
 * that powers the Memory Leak Detector UI.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedPercent = (usedMem / totalMem) * 100;

    // macOS-specific: try to get process-level memory via process.memoryUsage()
    const processMemory = process.memoryUsage();

    return res.status(200).json({
        timestamp: new Date().toISOString(),
        system: {
            totalMB: Math.round(totalMem / 1024 / 1024),
            usedMB: Math.round(usedMem / 1024 / 1024),
            freeMB: Math.round(freeMem / 1024 / 1024),
            usedPercent: parseFloat(usedPercent.toFixed(1))
        },
        process: {
            heapUsedMB: Math.round(processMemory.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(processMemory.heapTotal / 1024 / 1024),
            rssMB: Math.round(processMemory.rss / 1024 / 1024),
            externalMB: Math.round(processMemory.external / 1024 / 1024)
        }
    });
}
