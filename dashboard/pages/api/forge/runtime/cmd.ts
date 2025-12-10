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
    // Connect to real supervisor bus
    // Path: cmd.ts -> runtime -> forge -> api -> pages -> dashboard -> (root) -> forge-monitor -> supervisor
    const bus = require("../../../../../../forge-monitor/supervisor/bus").default;
    
    if (command) {
        bus.publish({ cmd: command, args: body.args });
    }
    
    return res.status(200).json({ ok: true, command });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
