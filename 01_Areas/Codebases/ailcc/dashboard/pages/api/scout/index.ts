import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';

function publishEvent(payload: Record<string, unknown>) {
    fetch('http://localhost:3000/api/system/relay-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => { });
}

interface DocEntry {
    file: string;
    type: 'md' | 'jsdoc';
    title: string;
    lines: number;
    lastModified: string;
}

/**
 * POST /api/scout/index
 *
 * Indexes all Markdown documentation files and JSDoc-rich TypeScript files in the workspace.
 * Returns a structured list of documentation inventory and fires SSE events to the dashboard.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { targetPath = '.' } = req.body as { targetPath?: string };
    const docs: DocEntry[] = [];

    const scanDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
                scanDir(fullPath);
            } else {
                // Index Markdown docs
                if (entry.name.endsWith('.md') || entry.name.endsWith('.MD')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const stats = fs.statSync(fullPath);
                    docs.push({
                        file: fullPath.replace(WORKSPACE_DIR, ''),
                        type: 'md',
                        title: titleMatch?.[1] || entry.name,
                        lines: content.split('\n').length,
                        lastModified: stats.mtime.toISOString()
                    });

                    publishEvent({
                        source: 'ScoutDocs',
                        message: `[AUTO_DOC] Indexed: ${entry.name} (${docs[docs.length - 1].lines} lines)`,
                        payload: JSON.stringify(docs[docs.length - 1]),
                        severity: 'info',
                        timestamp: new Date().toISOString()
                    });
                }

                // Index TSDoc-rich TS/TSX files
                if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const jsdocComments = content.match(/\/\*\*[\s\S]*?\*\//g) ?? [];
                    if (jsdocComments.length > 3) {
                        const stats = fs.statSync(fullPath);
                        docs.push({
                            file: fullPath.replace(WORKSPACE_DIR, ''),
                            type: 'jsdoc',
                            title: entry.name,
                            lines: jsdocComments.length,
                            lastModified: stats.mtime.toISOString()
                        });
                    }
                }
            }
        }
    };

    try {
        scanDir(path.join(WORKSPACE_DIR, targetPath));

        publishEvent({
            source: 'ScoutDocs',
            message: `[SCOUT_PASS_COMPLETE] Indexed ${docs.length} documentation files`,
            payload: JSON.stringify({
                total: docs.length,
                types: docs.reduce((acc, d) => {
                    acc[d.type] = (acc[d.type] ?? 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            }),
            severity: 'success',
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({ success: true, indexed: docs.length, docs });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        publishEvent({
            source: 'ScoutDocs',
            message: `[AUTO_DOC] Error: ${msg}`,
            payload: JSON.stringify({ error: msg }),
            severity: 'error',
            timestamp: new Date().toISOString()
        });
        return res.status(500).json({ success: false, error: msg });
    }
}
