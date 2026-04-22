import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({ error: 'filePath is required' });
    }

    // Security check: Ensure the file is within the AILCC_PRIME directory
    const absolutePath = path.resolve(filePath);
    if (!absolutePath.startsWith('/Users/infinite27/AILCC_PRIME')) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(absolutePath, 'utf8');

        // Dispatch to ARCHITECT for analysis
        const agentResponse = await fetch('http://localhost:3000/api/alliance/dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentType: 'strategy', // ARCHITECT
                task: `Review this source file for architectural debt, redundancy, or HSL design standard violations. Propose at least 3 high-impact refactors. Respond ONLY with a valid JSON array of objects: { "type": string, "description": string, "impact": "High" | "Medium" | "Low" }.\n\nFILE CONTENT:\n${content}`
            })
        });

        if (!agentResponse.ok) {
            throw new Error('Failed to dispatch to architect');
        }

        const analysis = await agentResponse.json();

        // The architect might wrap JSON in markdown blocks
        let rawResponse = analysis.response;
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const refactors = JSON.parse(jsonMatch[0]);
            res.status(200).json({
                filePath: absolutePath,
                refactors,
                thought: analysis.thought
            });
        } else {
            res.status(200).json({
                filePath: absolutePath,
                message: rawResponse,
                thought: analysis.thought
            });
        }

    } catch (error) {
        console.error('Refactor scan error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
}
