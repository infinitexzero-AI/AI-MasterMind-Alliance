import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    // Generate a secure random challenge for WebAuthn
    const challenge = crypto.randomBytes(32).toString('base64');

    // In a real system, we'd store this challenge in the session/database 
    // to verify it against the signed response from the authenticator.

    res.status(200).json({
        challenge,
        timeout: 60000, // 1 minute
        rp: { name: "NEXUS Command Center" },
        user: {
            id: "user-nexus-01",
            name: "Commander",
            displayName: "Nexus Commander"
        }
    });
}
