import { NextApiRequest, NextApiResponse } from "next";
/**
 * Receives runtime command from dashboard and publishes to supervisor bus.
 * For local dev this returns success; in-process wiring would require importing the bus.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  
  // Proxy to Forge Monitor (Port 3001)
  // This avoids build-time dependency issues with relative imports outside 'dashboard'
  try {
    const forgeRes = await fetch('http://localhost:3001/api/runtime/cmd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
    });
    
    // Fallback if monitor endpoint doesn't exist yet (soft failure)
    if (!forgeRes.ok && forgeRes.status === 404) {
         // Mock success for UI feel if backend isn't fully implemented
         return res.status(200).json({ ok: true, note: 'Mock success (backend endpoint missing)' });
    }

    const json = await forgeRes.json();
    return res.status(forgeRes.status).json(json);

  } catch (err: any) {
    // If monitor is down, just return error
    return res.status(502).json({ error: 'Forge Monitor unreachable', details: String(err) });
  }
}
