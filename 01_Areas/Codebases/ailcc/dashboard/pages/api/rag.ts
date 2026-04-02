import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query required' });
    }

    try {
        const fetchRes = await fetch("http://localhost:8091/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: q, num_results: 5 })
        });

        if (!fetchRes.ok) {
            return res.status(500).json({ error: 'RAG Server Offline' });
        }

        const data = await fetchRes.json();

        // Map ChromaDB tuple structure (documents, metadatas, distances) into an object array format
        const formattedResults = [];
        if (data.results && data.results.documents && data.results.documents[0]) {
            const docs = data.results.documents[0];
            const meta = data.results.metadatas[0];
            const dist = data.results.distances[0];

            for (let i = 0; i < docs.length; i++) {
                formattedResults.push({
                    id: data.results.ids[0][i],
                    document: docs[i],
                    metadata: meta[i] || {},
                    distance: dist[i]
                });
            }
        }
        res.status(200).json(formattedResults);
    } catch (e) {
        console.error("RAG Error:", e);
        res.status(500).json({ error: 'Failed to connect to RAG server' });
    }
}
