import type { NextApiRequest, NextApiResponse } from 'next';
import { Project } from 'ts-morph';
import path from 'path';
import fs from 'fs';

/**
 * 🃏 AILCC Smart API Mocking (Phase 21)
 * 
 * Dynamic catch-all endpoint: `/api/mock/[...path]`
 * If a frontend requests unfinished or missing data from this endpoint,
 * it dynamically queries the corresponding frontend/backend TypeScript types,
 * passes the type schema to the local LLM, and generates a realistic mock JSON payload on the fly.
 */

const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';
const CACHE_DIR = path.join(WORKSPACE_DIR, '.mock-cache');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

async function generateMockData(endpoint: string, schemaDefinition: string): Promise<any> {
    const cacheFile = path.join(CACHE_DIR, `${endpoint.replace(/\//g, '_')}.json`);
    if (fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));

    const prompt = `You are a Smart Mock Data generator for a complex AI Command Center dashboard.
Generate a realistic JSON payload for the endpoint: /api/${endpoint}.
The payload MUST conform exactly to the following TypeScript interfaces/types:

${schemaDefinition}

Return ONLY raw JSON. No markdown, no explanations, no code blocks around it. Just pure valid JSON.`;

    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'llama3:latest',
            prompt: prompt,
            stream: false
        })
    });

    if (!ollamaRes.ok) throw new Error(`Ollama generation failed`);

    const data = await ollamaRes.json();
    let rawJson = data.response.trim();

    // Clean up code block backticks if LLM ignores constraints
    if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    if (rawJson.startsWith('```')) rawJson = rawJson.replace(/```/g, '').trim();

    const parsedJson = JSON.parse(rawJson);
    fs.writeFileSync(cacheFile, JSON.stringify(parsedJson, null, 2));

    return parsedJson;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path: routePath } = req.query;

    if (!routePath || !Array.isArray(routePath)) {
        return res.status(400).json({ error: 'Invalid mock path' });
    }

    const endpointStr = routePath.join('/');
    console.log(`[SmartMock] 🃏 Intercepting mock request for schema extrapolation: /api/${endpointStr}`);

    try {
        // Find existing TS types related to this endpoint name.
        // E.g., if endpoint is `system/health`, look for `HealthData` or similar in the project.
        const project = new Project({
            tsConfigFilePath: path.join(WORKSPACE_DIR, 'tsconfig.json')
        });

        // Search common frontend data consumption locations for types relating to this endpoint
        const targetSearchString = endpointStr.split('/').pop() || 'data';
        let foundSchema = '';

        for (const sf of project.getSourceFiles()) {
            if (sf.getFilePath().includes('node_modules')) continue;

            const interfaces = sf.getInterfaces();
            const typeAliases = sf.getTypeAliases();

            for (const dec of [...interfaces, ...typeAliases]) {
                const name = dec.getName().toLowerCase();
                // Extremely heuristic grep-like match for demo - "does this type name match the endpoint name roughly?"
                if (name.includes(targetSearchString.toLowerCase()) || name.includes(routePath[0].toLowerCase())) {
                    foundSchema += dec.getText() + '\n\n';
                }
            }
        }

        if (!foundSchema) {
            foundSchema = `// Fallback schema for /api/${endpointStr}
interface MockResponse {
    status: string;
    message: string;
    data: any[];
}`;
        }

        const mockPayload = await generateMockData(endpointStr, foundSchema);
        return res.status(200).json(mockPayload);

    } catch (e) {
        console.error('[SmartMock] Failed to mock:', e);
        // Provide absolute fallback
        return res.status(200).json({
            status: 'fallback',
            _ailcc_mock_note: 'LLM failed to generate or parse JSON strict type match.',
            endpoint: endpointStr
        });
    }
}
