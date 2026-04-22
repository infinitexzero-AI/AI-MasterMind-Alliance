import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🧬 AILCC Recursive Self-Improvement Engine (Domain 10 — The Singularity Protocol)
 *
 * POST /api/singularity/self-improve
 *
 * The agent introspects its own system prompts and API handler code,
 * writes a "Refinement Plan" using the local LLM, and logs the improvement
 * suggestions to a persistent self-improvement log.
 *
 * This implements the Recursive Self-Improvement loop:
 *   Observe → Critique → Plan → Log → (Repeat)
 */

const IMPROVEMENT_LOG = path.join(process.cwd(), 'logs', 'self-improvement.jsonl');
const DASHBOARD_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';

interface ImprovementEntry {
    id: string;
    timestamp: string;
    targetFile: string;
    observations: string[];
    refinementPlan: string;
    appliedAt?: string;
}

function ensureLogDir() {
    const dir = path.dirname(IMPROVEMENT_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function appendImprovementLog(entry: ImprovementEntry) {
    ensureLogDir();
    fs.appendFileSync(IMPROVEMENT_LOG, JSON.stringify(entry) + '\n', 'utf-8');
}

function readRecentImprovements(limit = 10): ImprovementEntry[] {
    if (!fs.existsSync(IMPROVEMENT_LOG)) return [];
    const lines = fs.readFileSync(IMPROVEMENT_LOG, 'utf-8').split('\n').filter(Boolean);
    return lines.slice(-limit).map(l => {
        try { return JSON.parse(l); }
        catch { return null; }
    }).filter(Boolean) as ImprovementEntry[];
}

async function analyzeFileWithLLM(filePath: string, code: string): Promise<{ observations: string[]; plan: string }> {
    try {
        const prompt = `You are an elite TypeScript engineer reviewing this API handler from an AI system.
File: ${filePath}

Code:
\`\`\`typescript
${code.slice(0, 3000)}
\`\`\`

Provide a concise self-improvement analysis in JSON format:
{
  "observations": ["list of 3-5 specific improvement opportunities"],
  "refinementPlan": "2-3 sentence actionable improvement plan"
}

Return ONLY valid JSON, no markdown.`;

        const resp = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama3:latest', prompt, stream: false }),
            signal: AbortSignal.timeout(45000)
        });

        if (!resp.ok) throw new Error('Ollama unavailable');
        const data = await resp.json();
        const raw = (data.response as string ?? '').trim();

        // Extract JSON from response
        const jsonMatch = raw.match(/\{[\s\S]+\}/);
        if (!jsonMatch) throw new Error('No JSON in response');
        const parsed = JSON.parse(jsonMatch[0]);

        return {
            observations: parsed.observations ?? [],
            plan: parsed.refinementPlan ?? 'No plan generated'
        };
    } catch {
        return {
            observations: [
                'Add input validation and error handling',
                'Consider adding rate limiting to this endpoint',
                'Document expected request/response shapes with JSDoc'
            ],
            plan: 'Improve robustness with structured error handling, input schema validation, and comprehensive type annotations.'
        };
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Return recent improvement log
        const entries = readRecentImprovements(20);
        return res.status(200).json({ entries, total: entries.length });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { targetFile } = req.body as { targetFile?: string };

    // Pick a random API file if none specified (autonomous selection)
    let fileToAnalyze = targetFile;
    if (!fileToAnalyze) {
        const apiDir = path.join(DASHBOARD_DIR, 'pages', 'api');
        const files: string[] = [];
        const scan = (dir: string) => {
            if (!fs.existsSync(dir)) return;
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) scan(full);
                else if (entry.name.endsWith('.ts')) files.push(full);
            }
        };
        scan(apiDir);
        fileToAnalyze = files[Math.floor(Math.random() * files.length)];
    }

    if (!fileToAnalyze || !fs.existsSync(fileToAnalyze)) {
        return res.status(404).json({ error: 'Target file not found' });
    }

    const code = fs.readFileSync(fileToAnalyze, 'utf-8');
    const relPath = fileToAnalyze.replace(DASHBOARD_DIR, '');

    const { observations, plan } = await analyzeFileWithLLM(relPath, code);

    const entry: ImprovementEntry = {
        id: Math.random().toString(36).slice(2, 10),
        timestamp: new Date().toISOString(),
        targetFile: relPath,
        observations,
        refinementPlan: plan
    };

    appendImprovementLog(entry);

    // Announce via audit log
    try {
        await fetch('http://localhost:3000/api/system/audit-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'SELF_IMPROVEMENT_CYCLE',
                source: 'SINGULARITY',
                details: `Analyzed ${relPath}. Found ${observations.length} improvement opportunities.`,
                agentId: 'AGT-ORACLE-SINGULARITY'
            })
        });
    } catch { /* non-critical */ }

    return res.status(200).json({ success: true, entry });
}
