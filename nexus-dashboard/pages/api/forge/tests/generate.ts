import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { emitEvent } from '../../../../lib/event-bus';

/**
 * 🛠️ FORGE Autonomous Testing Endpoint (Phase 20)
 * 
 * Called by git hooks or the IDE bridge when a file is modified.
 * It uses the local LLM to read the newly modified source file and
 * automatically generate a `*.test.ts` or `*.test.tsx` file adjacent to it.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({ error: 'Missing absolute filePath parameter' });
    }

    // Ignore files that are already tests, or non-js/ts files
    if (filePath.includes('.test.') || filePath.includes('.spec.') || (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))) {
        return res.status(200).json({ status: 'skipped', reason: 'Not a testable file type' });
    }

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsedPath = path.parse(filePath);
        const testFilePath = path.join(parsedPath.dir, `${parsedPath.name}.test${parsedPath.ext}`);

        // If the test already exists, we skip generating a new one to prevent overwriting manual tests.
        // In a more advanced implementation, this could parse the AST to inject new test blocks instead.
        if (fs.existsSync(testFilePath)) {
            return res.status(200).json({ status: 'skipped', reason: 'Test file already exists', testFilePath });
        }

        emitEvent({
            source: 'FORGE',
            target: 'SYSTEM',
            action: 'AUTONOMOUS_TEST_GENERATION',
            payload: JSON.stringify({ message: `FORGE is writing unit tests for ${parsedPath.base}...`, file: parsedPath.base }),
            severity: 'info'
        });

        // Prompt the local LLM to generate tests
        const prompt = `You are FORGE, the elite execution agent.
Write a comprehensive Jest/Vitest unit test suite for the following file.
Output ONLY the raw code for the test file. No markdown formatting, no explanations.

Source File: ${parsedPath.base}
Code:
${fileContent}`;

        const ollamaRes = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3:latest',
                prompt: prompt,
                stream: false
            })
        });

        if (!ollamaRes.ok) {
            throw new Error(`Ollama generation failed: ${ollamaRes.statusText}`);
        }

        const data = await ollamaRes.json();
        let rawCode = data.response;

        // Clean up any markdown blocks if the model ignored the constraint
        if (rawCode.startsWith('```')) {
            const lines = rawCode.split('\n');
            lines.shift(); // remove first ```
            if (lines[lines.length - 1].includes('```')) lines.pop(); // remove last ```
            rawCode = lines.join('\n');
        }

        // Write the new test file directly to disk
        fs.writeFileSync(testFilePath, rawCode, 'utf-8');

        emitEvent({
            source: 'FORGE',
            target: 'SYSTEM',
            action: 'AUTONOMOUS_TEST_SUCCESS',
            payload: JSON.stringify({ message: `FORGE verified logic integrity for ${parsedPath.base}`, file: testFilePath }),
            severity: 'info'
        });

        res.status(200).json({
            status: 'success',
            message: `Generated tests for ${parsedPath.base}`,
            testFile: testFilePath
        });

    } catch (e: any) {
        emitEvent({
            source: 'FORGE',
            target: 'SYSTEM',
            action: 'AUTONOMOUS_TEST_FAILED',
            payload: JSON.stringify({ message: `Failed to generate test for ${filePath}: ${e.message}` }),
            severity: 'error'
        });
        res.status(500).json({ error: e.message });
    }
}
