import { Project, Node } from 'ts-morph';
import * as path from 'path';

/**
 * 🕵️‍♂️ AILCC SCOUT Documentation Daemon (Phase 21)
 * 
 * Runs a background AST analysis pass natively on the codebase.
 * Identifies exported functions, classes, and interfaces missing TSDoc/JSDoc.
 * Prompts the local LLM to generate documentation and injects it back in safely via ts-morph.
 */

const WORKSPACE_DIR = '/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard';
const POLL_INTERVAL_MS = 60000 * 30; // 30 minutes

async function emitEvent(type: string, message: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info') {
    try {
        await fetch('http://localhost:3000/api/system/relay-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'SCOUT',
                message: `[${type}] ${message}`,
                severity,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error("Failed to relay event:", message);
    }
}

async function generateJSDoc(codeSnippet: string): Promise<string> {
    const prompt = `You are SCOUT, the AILCC code documentation agent.
Write a clean, professional JSDoc block for the following TypeScript node.
Do NOT include the original code. Output ONLY the raw JSDoc block starting with /** and ending with */. Do not wrap in markdown \`\`\`.

Code snippet to document:
${codeSnippet}`;

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
    let rawDoc = data.response.trim();

    // Clean up markdown block if model ignored constraints
    if (rawDoc.startsWith('```')) {
        const lines = rawDoc.split('\n');
        lines.shift(); // remove first ``` 
        if (lines[lines.length - 1].includes('```')) lines.pop(); // remove last ```
        rawDoc = lines.join('\n').trim();
    }

    // Ensure it looks like a valid JSDoc
    if (!rawDoc.startsWith('/**')) rawDoc = '/**\n * ' + rawDoc;
    if (!rawDoc.endsWith('*/')) rawDoc = rawDoc + '\n */';

    return rawDoc;
}

// Ensure the crawler doesn't spam LLM generation all at once. Process one by one.
async function runScoutAudit() {
    console.log(`[SCOUT] 🕵️‍♂️ Running background documentation pass...`);

    const project = new Project({
        tsConfigFilePath: path.join(WORKSPACE_DIR, 'tsconfig.json')
    });

    // Specifically target lib and api layer files to start
    const sourceFiles = project.getSourceFiles([
        path.join(WORKSPACE_DIR, 'lib/**/*.ts'),
        path.join(WORKSPACE_DIR, 'pages/api/**/*.ts')
    ]);

    let filesModified = 0;
    let nodesDocumented = 0;

    for (const sourceFile of sourceFiles) {
        let fileChanged = false;
        const filePath = sourceFile.getFilePath();

        // Check if file is inside a node_modules or something generated
        if (filePath.includes('node_modules') || filePath.includes('.next')) continue;

        // Find all exported Functions, Classes, and Interfaces
        const exportableNodes = [
            ...sourceFile.getFunctions(),
            ...sourceFile.getClasses(),
            ...sourceFile.getInterfaces()
        ];

        for (const node of exportableNodes) {
            if (node.isExported()) {
                const jsDocs = node.getJsDocs ? node.getJsDocs() : [];

                // If it doesn't have a JSDoc block
                if (jsDocs.length === 0) {
                    const nodeName = Node.isFunctionDeclaration(node) || Node.isClassDeclaration(node) || Node.isInterfaceDeclaration(node)
                        ? node.getName() || 'Anonymous Node'
                        : 'Unknown Node';

                    console.log(`[SCOUT] 📝 Found undocumented exported node: ${nodeName} in ${path.basename(filePath)}`);

                    try {
                        const snippet = node.getText();
                        // Truncate snippet if it's too huge, just feed signature
                        const docString = await generateJSDoc(snippet.slice(0, 1000));

                        // Add JSDoc via ts-morph
                        if (Node.isClassDeclaration(node) || Node.isFunctionDeclaration(node) || Node.isInterfaceDeclaration(node)) {
                            node.addJsDoc(docString);
                            fileChanged = true;
                            nodesDocumented++;
                            await emitEvent('AUTO_DOC', `Generated documentation for ${nodeName}`, 'info');

                            // Let's just do 1 per run to avoid huge delays and token limits
                            await sourceFile.save();
                            console.log(`[SCOUT] ✅ Generated doc for ${nodeName}`);
                            return;
                        }
                    } catch (e: unknown) {
                        const msg = e instanceof Error ? e.message : String(e);
                        console.error(`[SCOUT] ❌ Failed to generate docs for ${nodeName}:`, msg);
                    }
                }
            }
        }

        if (fileChanged) {
            filesModified++;
        }
    }

    if (nodesDocumented > 0) {
        await emitEvent('SCOUT_PASS_COMPLETE', `SCOUT pass finished. Mutated ${filesModified} files to inject ${nodesDocumented} autonomous JSDocs.`, 'success');
    } else {
        console.log(`[SCOUT] ✅ Pass complete. Codebase is fully documented.`);
    }
}

// Initial Boot
console.log(`[SCOUT] 🕵️‍♂️ Daemon Online. Scanning for documentation voids.`);
runScoutAudit();

// Scheduled Loop
setInterval(runScoutAudit, POLL_INTERVAL_MS);
