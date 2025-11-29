import { NextApiRequest, NextApiResponse } from "next";
/**
 * Receives runtime command from dashboard and publishes to supervisor bus.
 * For local dev this returns success; in-process wiring would require importing the bus.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const body = req.body || {};
    const command = body.command || body.cmd || (typeof body === "string" ? body : null);
    // If the environment runs supervisor in-process we could import and publish:
    // import bus from "../../../../forge-monitor/supervisor/bus";
    // bus.publish({ cmd: command });
    // For safety, just echo back:
    return res.status(200).json({ ok: true, command });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
