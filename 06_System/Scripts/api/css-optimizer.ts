import * as fs from 'fs';
import * as path from 'path';

/**
 * 🎨 AILCC CSS Variable Optimizer (Phase 22)
 *
 * Scans globals.css for all defined CSS custom properties (--variable: value).
 * Then scans the entire React component tree (.tsx/.css files) to find variables
 * that are defined but never referenced. Emits a DEAD_TOKEN event for each
 * orphaned variable and produces a clean, consolidated list.
 */

const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';
const GLOBALS_CSS = path.join(WORKSPACE_DIR, 'styles', 'globals.css');
const POLL_INTERVAL_MS = 60000 * 20; // 20 minutes

async function emitEvent(type: string, message: string, payload: Record<string, unknown>, severity: 'info' | 'warning' | 'success' = 'info') {
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'CSSOptimizer',
                message: `[${type}] ${message}`,
                payload: JSON.stringify(payload),
                severity,
                timestamp: new Date().toISOString()
            })
        });
    } catch { /* suppress */ }
}

function extractDefinedVars(css: string): string[] {
    const matches = css.match(/--[\w-]+(?=\s*:)/g) ?? [];
    return [...new Set(matches)];
}

function collectAllSourceText(dir: string, exts: string[]): string {
    let combined = '';
    if (!fs.existsSync(dir)) return combined;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
            combined += collectAllSourceText(fullPath, exts);
        } else if (exts.some(ext => entry.name.endsWith(ext))) {
            combined += fs.readFileSync(fullPath, 'utf-8') + '\n';
        }
    }
    return combined;
}

async function runOptimizer() {
    console.log('[CSSOptimizer] 🎨 Running CSS variable audit...');

    if (!fs.existsSync(GLOBALS_CSS)) {
        console.warn('[CSSOptimizer] globals.css not found at expected path.');
        return;
    }

    const cssContent = fs.readFileSync(GLOBALS_CSS, 'utf-8');
    const definedVars = extractDefinedVars(cssContent);

    // Collect all component + css source text to check usages
    const sourceText = collectAllSourceText(WORKSPACE_DIR, ['.tsx', '.ts', '.css', '.scss']);

    const unusedVars: string[] = [];
    const usedVars: string[] = [];

    for (const varName of definedVars) {
        // Check if the variable is used anywhere as var(--name) or referenced directly
        const usagePattern = new RegExp(`var\\(\\s*${varName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`, 'g');
        if (usagePattern.test(sourceText)) {
            usedVars.push(varName);
        } else {
            unusedVars.push(varName);
        }
    }

    console.log(`[CSSOptimizer] Found ${definedVars.length} total variables. ${unusedVars.length} unused.`);

    if (unusedVars.length > 0) {
        for (const dead of unusedVars) {
            console.log(`[CSSOptimizer] ☠️ Dead token: ${dead}`);
        }

        await emitEvent(
            'DEAD_TOKEN',
            `Found ${unusedVars.length} unused CSS variables out of ${definedVars.length} total.`,
            { unusedVars, usedCount: usedVars.length, totalCount: definedVars.length },
            'warning'
        );
    } else {
        await emitEvent(
            'CSS_CLEAN',
            `All ${definedVars.length} CSS variables are actively referenced.`,
            { totalCount: definedVars.length },
            'success'
        );
    }
}

console.log('[CSSOptimizer] 🎨 Daemon Online. CSS token audit starting...');
runOptimizer();
setInterval(runOptimizer, POLL_INTERVAL_MS);
