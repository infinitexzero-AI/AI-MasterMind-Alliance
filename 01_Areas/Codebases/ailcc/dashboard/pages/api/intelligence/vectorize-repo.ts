import type { NextApiRequest, NextApiResponse } from 'next';
import { cloneRepo, getFilesRecursive } from '../../../lib/git_utils';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST only' });
    }

    const { repoUrl } = req.body;
    if (!repoUrl) {
        return res.status(400).json({ error: 'repoUrl is required' });
    }

    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'temp-repo';
    const tempDir = path.join(os.tmpdir(), `alliance-clone-${Date.now()}`);

    try {
        console.log(`[Vectorize] Cloning ${repoUrl} to ${tempDir}...`);
        await cloneRepo(repoUrl, tempDir);

        const allFiles = getFilesRecursive(tempDir);
        const targetExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.md', '.txt', '.json'];
        const filteredFiles = allFiles.filter(f => targetExtensions.includes(path.extname(f)));

        console.log(`[Vectorize] Found ${filteredFiles.length} files to index.`);

        let processedCount = 0;
        for (const filePath of filteredFiles) {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(tempDir, filePath);

            // Call internal embedding API
            await fetch('http://localhost:3000/api/intelligence/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `[REPO: ${repoName}] FILE: ${relativePath}\n\n${content}`,
                    metadata: {
                        source: 'github_vectorizer',
                        repo: repoUrl,
                        file: relativePath,
                        timestamp: new Date().toISOString()
                    }
                })
            });
            processedCount++;
        }

        // Cleanup
        await fs.promises.rm(tempDir, { recursive: true, force: true });

        res.status(200).json({
            message: 'Vectorization complete',
            repo: repoUrl,
            filesProcessed: processedCount
        });

    } catch (error: any) {
        console.error('[Vectorize Error]', error);
        res.status(500).json({ error: error.message });
    }
}
