import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({ host: 'localhost', port: 6333 });

async function deduplicate(collectionName: string) {
    console.log(`[VaultMaintenance] Starting de-duplication for ${collectionName}...`);

    // 1. Scroll through all points
    const points = await client.scroll(collectionName, {
        limit: 1000,
        with_payload: true,
        with_vector: false
    });

    const uniqueHashes = new Set<string>();
    const idsToDelete: (string | number)[] = [];

    points.points.forEach(p => {
        const content = p.payload?.text as string;
        if (!content) return;

        // Simple string hash or just the string itself for direct dupe detection
        const hash = content.trim();
        if (uniqueHashes.has(hash)) {
            idsToDelete.push(p.id);
        } else {
            uniqueHashes.add(hash);
        }
    });

    if (idsToDelete.length > 0) {
        console.log(`[VaultMaintenance] Found ${idsToDelete.length} duplicates. Deleting...`);
        await client.delete(collectionName, {
            points: idsToDelete
        });
        console.log('[VaultMaintenance] Deletion complete.');
    } else {
        console.log('[VaultMaintenance] No duplicates found.');
    }
}

deduplicate('intelligence_vault').catch(e => console.error(e));
