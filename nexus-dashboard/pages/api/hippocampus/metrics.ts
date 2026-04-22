import type { NextApiRequest, NextApiResponse } from 'next';
import { QdrantClient } from '@qdrant/js-client-rest';

// Initialize Qdrant Client (adjust URL/API Key if using cloud, currently local)
// Note: In Mode 7, we expect the Qdrant instance to be running locally on port 6333
const client = new QdrantClient({ url: 'http://localhost:6333' });
const COLLECTION_NAME = 'hippocampus_v1';

type HippocampusMetrics = {
    vectorsIndexed: number;
    collections: number;
    lastIngestTime: string;
    targetVectors: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HippocampusMetrics | { error: string }>
) {
    try {
        // 1. Fetch Collections
        const collections = await client.getCollections();
        const collectionCount = collections.collections.length;

        // 2. Fetch Vector Count for 'hippocampus_v1'
        let vectorCount = 0;
        try {
            const collectionInfo = await client.getCollection(COLLECTION_NAME);
            // Using 'points_count' usually, or 'vectors_count' depending on version
            vectorCount = collectionInfo.points_count ?? 0;
        } catch (e: unknown) {
            // If collection doesn't exist, count is 0
            console.warn(`Collection ${COLLECTION_NAME} not found or error.`, (e instanceof Error ? e.message : String(e)));
        }

        // 3. Construct Metrics
        const metrics: HippocampusMetrics = {
            vectorsIndexed: vectorCount,
            collections: collectionCount,
            lastIngestTime: new Date().toISOString(), // In a real system, we'd query last update time
            targetVectors: 1000, // Arbitrary target for the "Centurion Sequence"
        };

        res.status(200).json(metrics);
    } catch (error: unknown) {
        // Return fallback data when Qdrant is offline (graceful degradation)
        console.warn('Hippocampus API: Qdrant offline, returning fallback data');
        res.status(200).json({
            vectorsIndexed: 0,
            collections: 0,
            lastIngestTime: 'Offline',
            targetVectors: 1000,
        });
    }
}
