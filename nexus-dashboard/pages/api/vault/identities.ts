import type { NextApiRequest, NextApiResponse } from 'next';
import { getSwarmManifest } from '../../../lib/agent-identity';

/**
 * GET /api/vault/identities
 * Returns the cryptographic identity manifest for all swarm agents.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const manifest = getSwarmManifest();
    return res.status(200).json({ success: true, agents: manifest });
}
