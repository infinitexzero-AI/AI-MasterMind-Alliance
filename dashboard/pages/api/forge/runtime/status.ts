import { NextApiRequest, NextApiResponse } from "next";
/**
 * Proxy to in-repo runtime status for local/dev (deterministic mock).
 * In production this should call the runtime process or supervisor endpoint.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ running: false, ts: Date.now() });
}
