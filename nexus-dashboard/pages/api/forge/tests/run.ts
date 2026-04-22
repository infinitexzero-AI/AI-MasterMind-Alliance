import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);
const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';

function publishEvent(payload: Record<string, unknown>) {
    fetch('http://localhost:3000/api/system/relay-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => { });
}

/**
 * POST /api/forge/tests/run
 * 
 * Triggers the autonomous test runner against the configured test suite.
 * Reports results to the dashboard event bus.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { targetPath = 'pages/api', timeout = 30000 } = req.body as { targetPath?: string; timeout?: number };

    publishEvent({
        source: 'ForgeTestRunner',
        message: '[FORGE] Starting autonomous test run...',
        severity: 'info',
        timestamp: new Date().toISOString()
    });

    const testFile = path.join(WORKSPACE_DIR, '__tests__');
    const hasTests = fs.existsSync(testFile);

    try {
        // If project has jest tests, run them
        const cmd = hasTests
            ? `npx jest --testPathPattern=${targetPath} --passWithNoTests --json`
            : `echo '{"numPassedTests":0,"numFailedTests":0,"testResults":[]}'`;

        const { stdout } = await execAsync(cmd, {
            cwd: WORKSPACE_DIR,
            timeout
        });

        const results = JSON.parse(stdout);

        publishEvent({
            source: 'ForgeTestRunner',
            message: `[FORGE] Test run complete. Passed: ${results.numPassedTests}, Failed: ${results.numFailedTests}`,
            severity: results.numFailedTests > 0 ? 'warning' : 'success',
            payload: JSON.stringify({ passed: results.numPassedTests, failed: results.numFailedTests }),
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            passed: results.numPassedTests,
            failed: results.numFailedTests,
            testResults: results.testResults?.slice(0, 10) ?? []
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        publishEvent({
            source: 'ForgeTestRunner',
            message: `[FORGE] Test runner error: ${msg}`,
            severity: 'error',
            timestamp: new Date().toISOString()
        });
        return res.status(500).json({ success: false, error: msg });
    }
}
