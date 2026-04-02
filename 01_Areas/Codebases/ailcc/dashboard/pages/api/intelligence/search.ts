import type { NextApiRequest, NextApiResponse } from 'next';
import { localVectorStore } from '../../../lib/local_vector_store';
import { generateEmbedding } from '../../../lib/embeddings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET ?q=query or POST {query}' });
    }

    const query = (req.method === 'GET' ? req.query.q : req.body?.query) as string;
    const limit = parseInt(String(req.query.limit || req.body?.limit || '5'));

    if (!query) {
        return res.status(400).json({ error: 'Query is required. Use ?q=your+query or POST body {query: "..."}' });
    }

    try {
        localVectorStore.init();
        const count = localVectorStore.count();

        if (count === 0) {
            return res.status(503).json({ error: 'Vector store is empty. Run the indexer first.' });
        }

        const queryEmbedding = await generateEmbedding(query);
        const results = localVectorStore.search(queryEmbedding, limit);

        res.status(200).json({
            query,
            total_vectors: count,
            results: results.map(r => ({
                score: Math.round(r.score * 1000) / 1000,
                path: r.path,
                content: r.content.slice(0, 500) + (r.content.length > 500 ? '...' : ''),
                timestamp: r.timestamp
            }))
        });
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
}
