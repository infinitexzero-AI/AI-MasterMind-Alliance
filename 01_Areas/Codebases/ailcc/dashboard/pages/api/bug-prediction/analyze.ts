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

// Heuristic cyclomatic complexity estimator (matches bug-predictor.ts daemon)
function estimateComplexity(code: string): number {
    let complexity = 1;
    const keywords = ['\\bif\\b', '\\belse\\b', '\\bfor\\b', '\\bwhile\\b', '\\bcase\\b', '\\bcatch\\b', '\\?', '\\&\\&', '\\|\\|'];
    for (const keyword of keywords) {
        const matches = code.match(new RegExp(keyword, 'g'));
        if (matches) complexity += matches.length;
    }
    return complexity;
}

interface FileAnalysis {
    file: string;
    lines: number;
    complexity: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    warnings: string[];
}

/**
 * POST /api/bug-prediction/analyze
 *
 * Scans the target path (defaults to pages/api) for TS/TSX files.
 * Returns complexity scores and risk levels for each file in the tree.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { targetPath = 'pages/api' } = req.body as { targetPath?: string };
    const analysisDir = path.join(WORKSPACE_DIR, targetPath);
    const results: FileAnalysis[] = [];

    if (!fs.existsSync(analysisDir)) {
        return res.status(404).json({ error: `Target path not found: ${targetPath}` });
    }

    const scanDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
                scanDir(fullPath);
            } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n').length;
                const complexity = estimateComplexity(content);
                const density = complexity / Math.max(lines, 1);
                const riskLevel: FileAnalysis['riskLevel'] = complexity > 20 ? 'High' : density > 0.15 ? 'Medium' : 'Low';

                const warnings: string[] = [];
                if (complexity > 20) warnings.push(`High cyclomatic complexity (${complexity})`);
                if (lines > 300 && complexity > 10) warnings.push(`Large file with complex logic`);
                if (content.includes(': any')) warnings.push(`Contains loose 'any' type usage`);

                results.push({
                    file: fullPath.replace(WORKSPACE_DIR, ''),
                    lines,
                    complexity,
                    riskLevel,
                    warnings
                });
            }
        }
    };

    try {
        scanDir(analysisDir);
        const highRisk = results.filter(r => r.riskLevel === 'High');

        publishEvent({
            source: 'BugPredictor',
            message: `[BUG_PREDICTION] Analyzed ${results.length} files. ${highRisk.length} high-risk files detected.`,
            severity: highRisk.length > 0 ? 'warning' : 'success',
            payload: JSON.stringify({ total: results.length, highRisk: highRisk.length }),
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            total: results.length,
            highRisk: highRisk.length,
            results: results.sort((a, b) => b.complexity - a.complexity)
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: msg });
    }
}
