import { NextApiRequest, NextApiResponse } from "next";
/**
 * Proxy to in-repo runtime status for local/dev (deterministic mock).
 * In production this should call the runtime process or supervisor endpoint.
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // Proxy to Forge Monitor instead of importing local file
    const r = await fetch('http://localhost:3001/api/runtime/status');
    if (!r.ok) throw new Error(`Monitor returned ${r.status}`);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e: any) {
    // Return offline status if monitor is inaccessible
    res.status(200).json({ status: 'offline', details: 'Forge Monitor unreachable' });
  }
}
