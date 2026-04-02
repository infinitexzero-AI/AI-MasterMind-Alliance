import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new QdrantClient({ url: 'http://localhost:6333' });
const COLLECTION_NAME = 'ailcc_intelligence';

async function prune() {
    console.log('[NeuralPrune] Initiating vector hygiene scan...');

    try {
        // Fetch all points (limit to 100 for prototype)
        const response = await client.scroll(COLLECTION_NAME, {
            limit: 100,
            with_payload: true,
            with_vector: true
        });

        const points = response.points;
        const duplicates: any[] = [];
        const checked = new Set();

        for (let i = 0; i < points.length; i++) {
            if (checked.has(points[i].id)) continue;

            for (let j = i + 1; j < points.length; j++) {
                if (checked.has(points[j].id)) continue;

                // Simple dot product/cosine similarity heuristic would be better here
                // but for prototype we compare payload snippets
                const textA = (points[i].payload?.text as string || '').substring(0, 100);
                const textB = (points[j].payload?.text as string || '').substring(0, 100);

                if (textA === textB && textA.length > 20) {
                    duplicates.push({
                        keep: points[i].id,
                        remove: points[j].id,
                        snippet: textA
                    });
                    checked.add(points[j].id);
                }
            }
        }

        console.log(`[NeuralPrune] Found ${duplicates.length} duplicate clusters.`);

        if (duplicates.length > 0) {
            console.log('[NeuralPrune] Proposed Merges:');
            duplicates.forEach(d => {
                console.log(` - Merge ${d.remove} -> ${d.keep} ("${d.snippet}...")`);
            });

            // In a real execution, we would call client.delete() here
            console.log('[NeuralPrune] Dry run complete. No points deleted.');
        }

    } catch (e) {
        console.error('[NeuralPrune] Pruning failed:', e);
    }
}

prune();
