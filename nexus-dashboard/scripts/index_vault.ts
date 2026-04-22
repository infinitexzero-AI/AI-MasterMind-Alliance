import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { generateEmbedding } from '../lib/embeddings';
import { localVectorStore } from '../lib/local_vector_store';

const VAULT_PATH = '/Users/infinite27/Library/CloudStorage/OneDrive-Personal/AILCC_VAULT';
const CHUNK_SIZE = 1000; // characters

async function walk(dir: string): Promise<string[]> {
    let results: string[] = [];
    try {
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const filePath = path.join(dir, file);
            try {
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(await walk(filePath));
                } else if (/\.(md|txt|json)$/.test(file)) {
                    results.push(filePath);
                }
            } catch (e) { /* skip unreadable */ }
        }
    } catch (e) { /* skip unreadable dirs */ }
    return results;
}

function chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

export async function indexVault() {
    try {
        await localVectorStore.init();
        console.log('Scanning vault...');
        const files = await walk(VAULT_PATH);
        console.log(`Found ${files.length} files to index.`);

        for (const file of files) {
            console.log(`Indexing: ${path.basename(file)}`);
            const content = fs.readFileSync(file, 'utf-8');
            const chunks = chunkText(content, CHUNK_SIZE);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                try {
                    const embedding = await generateEmbedding(chunk);
                    await localVectorStore.upsert(uuidv4(), embedding, {
                        path: file.replace('/Users/infinite27/AILCC_PRIME/', ''),
                        chunkIndex: i,
                        content: chunk,
                        timestamp: new Date().toISOString()
                    });
                } catch (e) {
                    console.error(`  ↳ Failed to embed chunk ${i}:`, (e as Error).message);
                }
            }
        }
        console.log('✅ Vault indexing complete.');
    } catch (error) {
        console.error('Error indexing vault:', error);
    }
}

// Run if invoked directly
indexVault().catch(console.error);
